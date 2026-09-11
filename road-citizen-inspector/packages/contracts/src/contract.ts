export interface Contract<T = null> {
  success: boolean;
  message: string;
  data: T;
}

export interface ContractError<T = {
  name: string
  details: unknown
}> {
  success: boolean;
  message: string;
  error: T;
}
