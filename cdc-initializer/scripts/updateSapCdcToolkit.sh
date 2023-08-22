#!/usr/bin/env bash

#
# Copyright (c) 2023 SAP SE or an SAP affiliate company.
# All rights reserved.
#
# This software is the confidential and proprietary information of SAP
# ("Confidential Information"). You shall not disclose such Confidential
# Information and shall use it only in accordance with the terms of the
# license agreement you entered into with SAP.
#

PROJECT_BASE_DIRECTORY="cdc-initializer"
TOOLKIT_SRC_CODE_FILE="sap-cdc-toolkit.zip"
TOOLKIT_FOLDER="sap-cdc-toolkit"
MAC_CONFIG=()
WINDOWS_CONFIG=()
OS=$(uname)

checkGitHubToken() {
  if [ $GITHUB_TOKEN = "" ]
  then
    echo "Error: Missing value of environment variable GITHUB_TOKEN. Please set it before trying again."
    exit 1
  fi
}

initOperatingSystemVariables() {
  case $OS in
    'WindowsNT')
      OS="Windows"
      WINDOWS_CONFIG+=("copy")          # cmd to copy directory
      WINDOWS_CONFIG+=("tar -xf")       # cmd to extract file
      WINDOWS_CONFIG+=($(echo %TEMP%))  # OS temporary directory
      WINDOWS_CONFIG+=("rmdir /s /q")   # cmd to delete directory
      WINDOWS_CONFIG+=("del /f")        # cmd to delete file
      ;;
    'Darwin')
      OS="Mac"
      MAC_CONFIG+=("cp -R")             # cmd to copy directory
      MAC_CONFIG+=("unzip -q")          # cmd to extract file
      MAC_CONFIG+=($(echo $TMPDIR))     # OS temporary directory
      MAC_CONFIG+=("rm -rf")            # cmd to delete directory
      MAC_CONFIG+=("rm -f")             # cmd to delete file
      ;;
    *) ;;
  esac
}

getConfigVariable() {
  local variableIndex=$1
  case $OS in
    'Windows')
      echo ${WINDOWS_CONFIG[$variableIndex]}
      ;;
    'Mac')
      echo ${MAC_CONFIG[$variableIndex]}
      ;;
    *) ;;
  esac
}

getTempDirectory() {
  local TEMP_DIR_INDEX=2
  echo $(getConfigVariable $TEMP_DIR_INDEX)
}

getCommandUnzip() {
  local CMD_UNZIP_INDEX=1
  echo $(getConfigVariable $CMD_UNZIP_INDEX)
}

getCommandCopy() {
  local CMD_COPY_INDEX=0
  echo $(getConfigVariable $CMD_COPY_INDEX)
}

getCommandDeleteFolder() {
  local CMD_DELETE_FOLDER_INDEX=3
  echo $(getConfigVariable $CMD_DELETE_FOLDER_INDEX)
}

getCommandDeleteFile() {
  local CMD_DELETE_FILE_INDEX=4
  echo $(getConfigVariable $CMD_DELETE_FILE_INDEX)
}

getReleaseInfo() {
  releaseInfo=`curl -s -L \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer $GITHUB_TOKEN" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    https://api.github.com/repos/SAP/sap-customer-data-cloud-toolkit/releases/latest`

  if [[ $releaseInfo == "null" ]]
  then
    echo "Could not get release info. Aborting..."
    exit 1
  fi
  echo "$releaseInfo"
}

getSrcCodeUrl() {
  local releaseInfo=$1
  local htmlUrl=`echo $releaseInfo | jq '.html_url'`  
  htmlUrl=`echo "${htmlUrl}" | sed 's/"//g'`
  srcCodeUrl="${htmlUrl/releases\/tag/archive/refs/tags}"
  srcCodeUrl="${srcCodeUrl}.zip"
  echo "$srcCodeUrl"
}

getExtractedFolderName() {
  local releaseInfo=$1
  local assetName=`echo $releaseInfo | jq '.assets[0].name'`  
  folderName=`echo "${assetName}" | sed 's/"//g' | sed 's/.zip//'`
  echo "$folderName"
}

downloadSrcCode() {
  local srcCodeUrl=$1
  local destinationFile=$(getTempDirectory)$TOOLKIT_SRC_CODE_FILE
  echo "Downloading source code from $1 to $destinationFile"
  curl -o $destinationFile -s -L \
    -H "Accept: application/octet-stream" \
    -H "Authorization: Bearer $GITHUB_TOKEN" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    $srcCodeUrl
}

extractZipFile() {
  local tempDirectory=$(getTempDirectory)
  local filePath=$tempDirectory$TOOLKIT_SRC_CODE_FILE
  cd $tempDirectory
  echo "Extracting file $filePath"
  if [ ! -f "$filePath" ]; then
    echo "Error: File $filePath do not exists. Aborting..."
    exit 1
  fi
  $(getCommandUnzip) $filePath
  cd - > /dev/null
}

deleteToolkitFolder() {
  local folder=$1
  echo "Deleting folder $toolkitReferencePath"
  chmod -R 777 $toolkitReferencePath  # make the files writable, so they can be deleted
  $(getCommandDeleteFolder) $folder
  if [ -d $folder ]
  then
    echo "Error: Could not delete directory $folder. Aborting..."
    exit 1
  fi
}

copyToolkitFolder() {
  local destinationFolder=$1
  local extractedFolderName=$2
  local srcFolder=$(getTempDirectory)$extractedFolderName/src/services/*
  echo "Copying $srcFolder to $destinationFolder"
  $(getCommandCopy) $srcFolder $destinationFolder
}

deleteTestFilesFromToolkitFolder() {
  local destinationFolder=$1
  echo "Deleting test files from $destinationFolder"
  case $OS in
    'Windows')
      #do something here
      ;;
    'Mac')
      find $destinationFolder -name '*est.js' -type f -delete
      ;;
    *) ;;
  esac
}

copySrcCodeFolderToProject() {
  local extractedFolderName=$1
  local toolkitReferencePath="$PROJECT_BASE_DIRECTORY/$TOOLKIT_FOLDER"
  deleteToolkitFolder $toolkitReferencePath
  echo "Creating folder $toolkitReferencePath"
  mkdir -p $toolkitReferencePath
  copyToolkitFolder $toolkitReferencePath $extractedFolderName
  deleteTestFilesFromToolkitFolder $toolkitReferencePath
  chmod -R 555 $toolkitReferencePath    # make the directory content not writable, to avoid unaware file changes
}

deleteTemporaryFiles() {
  local extractedFolderName=$1
  local tempDirectory=$(getTempDirectory)
  cd $tempDirectory
  echo "Deleting temporary file $tempDirectory$TOOLKIT_SRC_CODE_FILE"
  $(getCommandDeleteFile) $TOOLKIT_SRC_CODE_FILE
  echo "Deleting temporary folder ${tempDirectory}$extractedFolderName"
  $(getCommandDeleteFolder) $extractedFolderName
  cd - > /dev/null
}

getNumberOfFilesOnDirectory() {
  local directory=$1
  case $OS in
    'Windows')
      #do something here
      ;;
    'Mac')
      echo $(find $directory -name "*.js" | wc -l)
      ;;
    *) ;;
  esac
}

verifyUpdateResult() {
  local toolkitReferencePath="$PROJECT_BASE_DIRECTORY/$TOOLKIT_FOLDER"
  local numberOfFiles=$(getNumberOfFilesOnDirectory "$toolkitReferencePath")
  if [ $numberOfFiles -gt 30 ]; then
    echo "Toolkit source files updated successfully"
    exit 0
  else
    echo "Toolkit source files were not updated successfully"
    exit 1
  fi
}

main() {
  checkGitHubToken
  initOperatingSystemVariables
  local releaseInfo=$(getReleaseInfo)
  local srcCodeUrl=$(getSrcCodeUrl "$releaseInfo")
  downloadSrcCode $srcCodeUrl
  extractZipFile
  local extractedFolderName=$(getExtractedFolderName "$releaseInfo")
  copySrcCodeFolderToProject $extractedFolderName
  deleteTemporaryFiles $extractedFolderName
}

main
verifyUpdateResult
