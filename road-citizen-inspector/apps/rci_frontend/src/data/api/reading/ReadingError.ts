import { ServerError } from '../ServerError'

class ReadingError extends ServerError {
  constructor(message: string) {
    super(message)
  }
}

export {ReadingError}