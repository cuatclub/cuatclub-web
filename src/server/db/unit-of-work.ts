import { db, type DbClient } from "@/server/db";

// Lets usecases declare "these writes must be atomic" without depending on
// Drizzle directly — they call unitOfWork.run() and pass the given client
// down to every repository call inside the callback.
export interface UnitOfWork {
  run<T>(fn: (client: DbClient) => Promise<T>): Promise<T>;
}

class DrizzleUnitOfWork implements UnitOfWork {
  run<T>(fn: (client: DbClient) => Promise<T>): Promise<T> {
    return db.transaction(fn);
  }
}

export const unitOfWork: UnitOfWork = new DrizzleUnitOfWork();
