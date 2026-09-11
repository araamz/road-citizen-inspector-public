export type SerializedServiceError<T> = {
  name: string;
  details: T;
};

export class ServiceError<T> extends Error {
  public details: T | undefined;

  constructor(message: string, name: string, details?: T) {
    super(message);
    this.name = name;
    this.details = details;
  }

  toJSON(): SerializedServiceError<T | undefined> {
    return {
      name: this.name.toUpperCase(),
      details: this.details,
    };
  }
}

export default class Service {}
