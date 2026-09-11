export interface PasswordStrategy {
  hash: (password: string) => {
    salt: string;
    hash: string;
  };
  compare: (password: string, hash: string, salt: string) => boolean;
}
