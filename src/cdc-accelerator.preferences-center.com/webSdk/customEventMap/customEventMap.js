export default {
    eventMap: [
        {
            events: '*',
            args: [
                function (e) {
                    return e
                },
            ],
            method: function (e) {
                if (e.fullEventName === 'login') {
                    // Handle login event here.
                } else if (e.fullEventName === 'logout') {
                    // Handle logout event here.
                    // console.log('here');
                }
            },
        },
    ],
}
