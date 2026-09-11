import { ServerError } from '../ServerError'

class SessionError extends ServerError {
  constructor(message: string) {
    super(message)
  }
}

export {SessionError}