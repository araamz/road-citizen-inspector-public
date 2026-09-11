import { ServerError } from '../ServerError'

class StatusError extends ServerError {
  constructor(message: string) {
    super(message)
  }
}

export {StatusError}