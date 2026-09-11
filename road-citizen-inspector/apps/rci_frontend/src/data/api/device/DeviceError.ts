import { ServerError } from '../ServerError'

class DeviceError extends ServerError {
  constructor(message: string) {
    super(message)
  }
}

export {DeviceError}