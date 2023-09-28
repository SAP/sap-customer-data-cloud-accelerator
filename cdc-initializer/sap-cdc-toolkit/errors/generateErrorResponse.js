/*
 * Copyright: Copyright 2023 SAP SE or an SAP affiliate company and cdc-tools-chrome-extension contributors
 * License: Apache-2.0
 */

function generateErrorResponse(error, message) {
  return error.response
    ? error.response
    : {
        data: {
          errorCode: error.code,
          errorDetails: error.details ? error.details : error.message,
          errorMessage: message,
          time: Date.now(),
        },
      }
}

export const ERROR_SEVERITY_ERROR = 'Error'
export const ERROR_SEVERITY_WARNING = 'Warning'
export const ERROR_SEVERITY_INFO = 'Information'

export const ERROR_CODE_ZIP_FILE_DOES_NOT_CONTAINS_METADATA_FILE = 1
export const ERROR_CODE_ZIP_FILE_DOES_NOT_CONTAINS_TEMPLATE_FILES = 2
export const ERROR_CODE_CANNOT_CHANGE_CONSENTS_ON_CHILD_SITE = 3
export const ERROR_CODE_CANNOT_CHANGE_SCHEMA_FIELD_TYPE = 4
export const ERROR_CODE_CANNOT_COPY_CHILD_THAT_HAVE_PARENT_ON_DESTINATION = 5
export const ERROR_CODE_CANNOT_COPY_NEW_FIELD_OF_PROFILE_SCHEMA = 6

export default generateErrorResponse
