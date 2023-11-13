export default {
    idSuccessMessage: 'preferences-center-update-confirm-msg',
    set: function (message) {
        const successMsg = document.getElementById(this.idSuccessMessage)
        if (successMsg) {
            successMsg.innerHTML = message
        }
    },
}
