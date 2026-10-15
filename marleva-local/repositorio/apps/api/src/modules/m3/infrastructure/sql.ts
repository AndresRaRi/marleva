export interface Sql {
  query<T>(sql: string, ...values: unknown[]): Promise<T[]>;
  execute(sql: string, ...values: unknown[]): Promise<number>;
}
export interface TransactionalSql extends Sql {
  transaction<T>(work: (sql: Sql) => Promise<T>): Promise<T>;
}
