import { ServerError } from "../ServerError";

class WebhookKeyError extends ServerError {
    constructor(message: string) {
        super(message)
    }
}

export { WebhookKeyError }