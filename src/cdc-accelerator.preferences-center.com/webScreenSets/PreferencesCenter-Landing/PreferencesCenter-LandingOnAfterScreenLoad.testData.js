const eventBeforeScreenLoad = {
    eventName: 'beforeScreenLoad',
    response: {},
    profile: {},
    data: {},
    subscriptions: {},
    communications: {},
    preferences: {},
    nextScreen: 'gigya-login-screen',
    screenSetID: 'preference-center-RegistrationLogin',
    source: 'showScreenSet',
    sourceContainerID: 'cdc-initializer--preview-container',
    instanceID: 'cdc-initializer--preview-container',
}

const eventAfterScreenLoad = {
    eventName: 'afterScreenLoad',
    currentScreen: 'gigya-login-screen',
    response: {},
    profile: {},
    preferences: {},
    data: {},
    screenSetID: 'preference-center-RegistrationLogin',
    source: 'showScreenSet',
    sourceContainerID: 'cdc-initializer--preview-container',
    instanceID: 'cdc-initializer--preview-container',
}

const mockHtml = `
<div data-width="auto" gigya-conditional:class="viewport.width < 550 ?gigya-screen v2 portrait mobile:viewport.width < 920 ?gigya-screen v2 portrait:" class="gigya-screen v2 landscape" gigya-expression:data-caption="screenset.translations['GIGYA_LOGIN_SCREEN_CAPTION']" data-screenset-element-id="gigya-login-screen" data-screenset-element-id-publish="true" data-screenset-roles="instance" gigya-default-class="gigya-screen v2 landscape" gigya-default-data-caption="null" id="gigya-login-screen" data-caption="Preference Center Login">
        <form class="gigya-login-form" onsubmit="return false;" method="post" data-screenset-element-id="gigya-login-form" data-screenset-element-id-publish="true" data-screenset-roles="instance" id="gigya-login-form">
            <div class="gigya-layout-row"></div>
            <div class="gigya-layout-row with-divider">
                <div class="gigya-layout-cell responsive with-social-login">
                    <h2 class="gigya-composite-control gigya-composite-control-header" data-translation-key="HEADER_111188166847589810_LABEL" data-screenset-element-id="__gig_template_element_14_1685011781479" data-screenset-element-id-publish="false" data-screenset-roles="instance">Quickly log in with your social network:</h2>
                    <div class="">
                        <div class="gigya-composite-control gigya-composite-control-social-login">
                            <div class="gigya-social-login gigya-reset" data-screenset-element-id="__gig_template_element_19_1685011781479" data-screenset-element-id-publish="false" data-screenset-roles="instance"><div class="gigya-social-login-container gigya-style-modern gigya-mac gigya-chrome" id="cdc-initializer--preview-container_social_0" style="width: 420px; height: 100px;"><div id="cdc-initializer--preview-container_social_0_uiContainer" style="height: 100px; width: 420px;"><div class="gigya-login-providers" style="height: 98px;">
    <label id="social-buttons-login-caption" aria-label="Sign in with"></label>
    <table class="gigya-login-providers-container" role="presentation" style="width: 361px;">
        <tbody><tr>
            <td class="gigya-login-providers-arrow-left no-arrows" style="width: 0px; max-width: 0px;"></td>
            <td class="gigya-login-providers-list-container" style="width: 361px;"><div class="gigya-active"><div class="gigya-login-providers-list"><div class="gigya-login-provider-row" style="height: 45px;"><span data-gigya-provider="facebook" style="width:117px;height:45px;margin-right:5px;" class="gigya-login-provider" gigid="facebook"><button aria-label="Facebook" alt="Facebook" type="button" class="tabbing-button" style="height:45px;" tabindex="0" title="Facebook" id="Facebook_btn" aria-labelledby="social-buttons-login-caption Facebook_btn"><div aria-hidden="true" style="background-image:url('https://cdns.gigya.com/gs/GetSprite.ashx?path=%2FHTMLLogin%2FFullLogoColored%2F%5Bfacebook%2Cgoogleplus%2Ctwitter%2Clinkedin%2Camazon%2Cyahoo%5D_45.png%7C117%2C45');background-position:-0px 0px;width: 117px;height: 45px;line-height: 45px;background-repeat:no-repeat;position:static;"></div></button></span><span data-gigya-provider="googleplus" style="width:117px;height:45px;margin-right:5px;" class="gigya-login-provider" gigid="googleplus"><button aria-label="Google" alt="Google" type="button" class="tabbing-button" style="height:45px;" tabindex="0" title="Google" id="Google_btn" aria-labelledby="social-buttons-login-caption Google_btn"><div aria-hidden="true" style="background-image:url('https://cdns.gigya.com/gs/GetSprite.ashx?path=%2FHTMLLogin%2FFullLogoColored%2F%5Bfacebook%2Cgoogleplus%2Ctwitter%2Clinkedin%2Camazon%2Cyahoo%5D_45.png%7C117%2C45');background-position:-117px 0px;width: 117px;height: 45px;line-height: 45px;background-repeat:no-repeat;position:static;"></div></button></span><span data-gigya-provider="twitter" style="width: 117px; height: 45px; margin-right: 0px;" class="gigya-login-provider gigya-login-provider-last" gigid="twitter"><button aria-label="Twitter" alt="Twitter" type="button" class="tabbing-button" style="height:45px;" tabindex="0" title="Twitter" id="Twitter_btn" aria-labelledby="social-buttons-login-caption Twitter_btn"><div aria-hidden="true" style="background-image:url('https://cdns.gigya.com/gs/GetSprite.ashx?path=%2FHTMLLogin%2FFullLogoColored%2F%5Bfacebook%2Cgoogleplus%2Ctwitter%2Clinkedin%2Camazon%2Cyahoo%5D_45.png%7C117%2C45');background-position:-234px 0px;width: 117px;height: 45px;line-height: 45px;background-repeat:no-repeat;position:static;"></div></button></span></div><div class="gigya-login-provider-row" style="height: 45px;"><span data-gigya-provider="linkedin" style="width:117px;height:45px;margin-right:5px;" class="gigya-login-provider" gigid="linkedin"><button aria-label="LinkedIn" alt="LinkedIn" type="button" class="tabbing-button" style="height:45px;" tabindex="0" title="LinkedIn" id="LinkedIn_btn" aria-labelledby="social-buttons-login-caption LinkedIn_btn"><div aria-hidden="true" style="background-image:url('https://cdns.gigya.com/gs/GetSprite.ashx?path=%2FHTMLLogin%2FFullLogoColored%2F%5Bfacebook%2Cgoogleplus%2Ctwitter%2Clinkedin%2Camazon%2Cyahoo%5D_45.png%7C117%2C45');background-position:-351px 0px;width: 117px;height: 45px;line-height: 45px;background-repeat:no-repeat;position:static;"></div></button></span><span data-gigya-provider="amazon" style="width:117px;height:45px;margin-right:5px;" class="gigya-login-provider" gigid="amazon"><button aria-label="Amazon" alt="Amazon" type="button" class="tabbing-button" style="height:45px;" tabindex="0" title="Amazon" id="Amazon_btn" aria-labelledby="social-buttons-login-caption Amazon_btn"><div aria-hidden="true" style="background-image:url('https://cdns.gigya.com/gs/GetSprite.ashx?path=%2FHTMLLogin%2FFullLogoColored%2F%5Bfacebook%2Cgoogleplus%2Ctwitter%2Clinkedin%2Camazon%2Cyahoo%5D_45.png%7C117%2C45');background-position:-468px 0px;width: 117px;height: 45px;line-height: 45px;background-repeat:no-repeat;position:static;"></div></button></span><span data-gigya-provider="yahoo" style="width: 117px; height: 45px; margin-right: 0px;" class="gigya-login-provider gigya-login-provider-last" gigid="yahoo"><button aria-label="Yahoo" alt="Yahoo" type="button" class="tabbing-button" style="height:45px;" tabindex="0" title="Yahoo" id="Yahoo_btn" aria-labelledby="social-buttons-login-caption Yahoo_btn"><div aria-hidden="true" style="background-image:url('https://cdns.gigya.com/gs/GetSprite.ashx?path=%2FHTMLLogin%2FFullLogoColored%2F%5Bfacebook%2Cgoogleplus%2Ctwitter%2Clinkedin%2Camazon%2Cyahoo%5D_45.png%7C117%2C45');background-position:-585px 0px;width: 117px;height: 45px;line-height: 45px;background-repeat:no-repeat;position:static;"></div></button></span></div></div></div></td>
            <td class="gigya-login-providers-arrow-right no-arrows" style="width: 0px; max-width: 0px;"></td>
        </tr>
    </tbody></table>
</div></div></div></div>
                        </div>
                    </div>
                </div>
                <div class="gigya-layout-cell responsive with-divider">
                    <div class="separator-wrapper">
                        <div class="or-separator">
                            <div class="separator-line"></div>
                            <div> <label class="gigya-divider-content gigya-composite-control gigya-composite-control-label" data-translation-key="LABEL_48902362044111190_LABEL" data-screenset-element-id="__gig_template_element_15_1685011781479" data-screenset-element-id-publish="false" data-screenset-roles="instance">or</label></div>
                            <div class="separator-line"></div>
                        </div>
                    </div>
                </div>
                <div class="gigya-layout-cell responsive with-site-login">
                    <h2 class="gigya-composite-control gigya-composite-control-header" data-translation-key="HEADER_131443300282291300_LABEL" data-screenset-element-id="__gig_template_element_16_1685011781479" data-screenset-element-id-publish="false" data-screenset-roles="instance">Log in with your email and password:</h2>
                    <div class="gigya-composite-control gigya-composite-control-textbox">
                        <input type="text" class="gigya-input-text" name="username" tabindex="0" formnovalidate="formnovalidate" gigya-expression:data-gigya-placeholder="screenset.translations['LOGINID_1311311543682226_PLACEHOLDER']" gigya-expression:aria-label="screenset.translations['LOGINID_1311311543682226_PLACEHOLDER']" data-screenset-element-id="__gig_template_element_7_1685011781478" data-screenset-element-id-publish="false" data-screenset-roles="instance" gigya-default-data-gigya-placeholder="null" gigya-default-aria-label="null" data-gigya-name="loginID" data-original-value="" aria-required="true" data-gigya-placeholder="Email" placeholder="Email *" aria-label="Email">
                        <span class="gigya-error-msg" data-bound-to="loginID" data-screenset-element-id="__gig_template_element_3_1685011781477" data-screenset-element-id-publish="false" data-screenset-roles="instance" aria-atomic="true"></span>
                    </div>
                    <div class="gigya-composite-control gigya-composite-control-password gigya-password" style="display: none;">
                        <input type="password" name="password" class="gigya-input-password" tabindex="0" formnovalidate="formnovalidate" gigya-expression:data-gigya-placeholder="screenset.translations['PASSWORD_132128826476804690_PLACEHOLDER']" gigya-expression:aria-label="screenset.translations['PASSWORD_132128826476804690_PLACEHOLDER']" data-screenset-element-id="__gig_template_element_8_1685011781478" data-screenset-element-id-publish="false" data-screenset-roles="instance" gigya-default-data-gigya-placeholder="null" gigya-default-aria-label="null" data-gigya-name="password" data-original-value="" aria-required="true" data-gigya-placeholder="Password" placeholder="Password *" aria-label="Password">
                        <span class="gigya-error-msg" data-bound-to="password" data-screenset-element-id="__gig_template_element_4_1685011781477" data-screenset-element-id-publish="false" data-screenset-roles="instance" aria-atomic="true"></span>
                    </div>
                    <div class="gigya-layout-row">
                        <div class="gigya-layout-cell">
                            <div class="gigya-composite-control gigya-composite-control-checkbox gigya-keep-me-logged-in" aria-invalid="false">
                                <input type="checkbox" name="remember" class="gigya-input-checkbox" tabindex="0" data-screenset-element-id="gigya-checkbox-remember" data-screenset-element-id-publish="true" data-screenset-roles="instance" data-gigya-name="remember" data-original-value="false" id="gigya-checkbox-remember" aria-required="false">
                                <label class="gigya-label" for="gigya-checkbox-remember">
                                    <span class="gigya-label-text gigya-checkbox-text" data-translation-key="CHECKBOX_76374189532411820_LABEL" data-screenset-element-id="__gig_template_element_17_1685011781479" data-screenset-element-id-publish="false" data-screenset-roles="instance">Keep me logged-in</span>
                                    <label class="gigya-required-display gigya-reset gigya-hidden" data-bound-to="remember" style="" data-screenset-element-id="__gig_template_element_11_1685011781479" data-screenset-element-id-publish="false" data-screenset-roles="instance" aria-hidden="true">*</label>
                                </label>
                            </div>
                        </div>
                        <div class="gigya-layout-cell">
                            <a data-switch-screen="gigya-forgot-password-screen" class="gigya-forgotPassword gigya-composite-control gigya-composite-control-link" data-translation-key="LINK_146308315993881860_LABEL" data-screenset-element-id="__gig_template_element_12_1685011781479" data-screenset-element-id-publish="false" data-screenset-roles="template,instance,instance" tabindex="0" href="javascript:void(0)" role="button" title="Forgot password?" style="display: none;">Forgot password?</a>
                        </div>
                    </div>
                    <div class="gigya-composite-control gigya-composite-control-captcha-widget v1 gigya-v2 gigya-unsupported">
                        <div class="gigya-captcha-wrapper gigya-error-display" data-error-flags="captchaNeeded" data-bound-to="gigya-login-form" data-screenset-element-id="__gig_template_element_1_1685011781477" data-screenset-element-id-publish="false" data-screenset-roles="instance" aria-atomic="true">
                            <div class="gigya-captcha gigya-reset" data-screenset-element-id="__gig_template_element_10_1685011781479" data-screenset-element-id-publish="false" data-screenset-roles="">
                                <param name="theme" value="light">
                                <param name="mode" value="visible">
                            <param name="badge" value="bottomright"><param name="type" value="image"><param name="size" value="normal"></div>
                            <span class="gigya-error-msg" data-bound-to="captchaText" data-screenset-element-id="__gig_template_element_5_1685011781477" data-screenset-element-id-publish="false" data-screenset-roles="instance" aria-atomic="true"></span>
                        </div>
                    </div>
                    <label class="gigya-composite-control gigya-composite-control-label" data-binding="true" data-translation-key="LABEL_137860971746571800_LABEL" data-screenset-element-id="__gig_template_element_18_1685011781479" data-screenset-element-id-publish="false" data-screenset-roles="template,instance,instance"><div id="errorLabel"></div></label><div class="gigya-composite-control gigya-composite-control-submit pref-center-invite-btn">
                        <input type="submit" class="gigya-input-submit" tabindex="0" data-gigya-type="submit" gigya-expression:value="screenset.translations['SUBMIT_142674579108303380_VALUE']" data-screenset-element-id="__gig_template_element_9_1685011781478" data-screenset-element-id-publish="false" data-screenset-roles="instance" gigya-default-value="null" value="Next">
                    </div>
                    <div class="gigya-error-display gigya-composite-control gigya-composite-control-form-error" data-bound-to="gigya-login-form" data-screenset-element-id="__gig_template_element_2_1685011781477" data-screenset-element-id-publish="false" data-screenset-roles="instance" aria-atomic="true">
                        <div class="gigya-error-msg gigya-form-error-msg" data-bound-to="gigya-login-form" data-screenset-element-id="__gig_template_element_6_1685011781477" data-screenset-element-id-publish="false" data-screenset-roles="instance" aria-atomic="true"></div>
                    </div>
                </div>
                <div class="gigya-clear"></div>
            </div>
            <div class="gigya-layout-row">
                <div class="gigya-layout-cell responsive under-site-login">
                    <a data-switch-screen="gigya-register-screen" class="gigya-composite-control gigya-composite-control-link" data-translation-key="LINK_105018431100429140_LABEL" data-screenset-element-id="__gig_template_element_13_1685011781479" data-screenset-element-id-publish="false" data-screenset-roles="template,instance,instance" tabindex="0" href="javascript:void(0)" role="button" title="Don't have an account yet?">Don't have an account yet?</a>
                </div>
            </div>
            <div class="gigya-clear"></div>
        </form>
    </div>
`

export default { eventBeforeScreenLoad, eventAfterScreenLoad, mockHtml }
