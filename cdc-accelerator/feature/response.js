export default class Response {
    static Severity = { success: 0, error: 1, warning: 2 }

    static createErrorResponse(message) {
        return { errorCode: this.Severity.error, errorDetails : message }
    }

    static createWarningResponse(message) {
        return { errorCode: this.Severity.warning, errorDetails : message }
    }
}
