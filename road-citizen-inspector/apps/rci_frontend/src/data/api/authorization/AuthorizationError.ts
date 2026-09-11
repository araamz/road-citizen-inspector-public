import { ServerError } from "../ServerError";

class AuthorizationError extends ServerError {
    constructor(message: string) {
        super(message)
    }
}

class PermissionError extends AuthorizationError {
    constructor(message: string) {
         super(message)
    }
}

export { AuthorizationError, PermissionError }