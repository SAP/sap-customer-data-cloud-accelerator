'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports['default'] = void 0;
var _default = (exports['default'] = {
    // Called when an error occurs.
    onError: function onError(event) {},

    // Called before validation of the form.
    onBeforeValidation: function onBeforeValidation(event) {},

    // Called before a form is submitted. This event gives you an opportunity to perform certain actions before the form is submitted, or cancel the submission by returning false.
    onBeforeSubmit: function onBeforeSubmit(event) {},

    // Called when a form is submitted, can return a value or a promise. This event gives you an opportunity to modify the form data when it is submitted.
    onSubmit: function onSubmit(event) {},

    // Called after a form is submitted.
    onAfterSubmit: function onAfterSubmit(event) {},

    // Called before a new screen is rendered. This event gives you an opportunity to cancel the navigation by returning false.
    onBeforeScreenLoad: function onBeforeScreenLoad(event) {},

    // Called after a new screen is rendered.
    onAfterScreenLoad: function onAfterScreenLoad(event) {},

    // Called when a field is changed in a managed form.
    onFieldChanged: function onFieldChanged(event) {},

    // Called when a user clicks the "X" (close) button or the screen is hidden following the end of the flow.
    onHide: function onHide(event) {}
});
