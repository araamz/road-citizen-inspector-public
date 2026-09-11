import { ServerError } from "../ServerError";

export class VisualizationError extends ServerError {
    constructor(message: string) {
        super(message);
    }
}