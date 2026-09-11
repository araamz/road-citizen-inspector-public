import type { Kysely } from "kysely";

export type PaginationParams = {
  page: number;
  size: number;
}

export type PaginationResult<T> = {
  entries: T
  pages: number
  count: number
} & PaginationParams

export class Model<DatabaseType> {
  protected db: Kysely<DatabaseType>;

  constructor(kyselyObject: Kysely<DatabaseType>) {
    this.db = kyselyObject;
  }
}
