import { ServerError } from '../ServerError'

class UplinkError extends ServerError {
  constructor(message: string) {
    super(message)
  }
}

export { UplinkError }