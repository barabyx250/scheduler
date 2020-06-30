import { createConnection, Connection } from "typeorm";
import { DEFAULT_NAME_DB_CONNECION } from '../types/constants';

export class DBManager {
  private static instance: DBManager;

  private constructor() {}

  private connection: Connection;

  public static async get(): Promise<DBManager> {
    if (!DBManager.instance) {
      DBManager.instance = new DBManager();
      DBManager.instance.connection = await createConnection();
    }

    return DBManager.instance;
  }

  public createConnetion() {
    return createConnection({
      name: DEFAULT_NAME_DB_CONNECION,
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "user0",
      password: "user0",
      database: "userdb",
      entities: [__dirname + "/../entities/*.ts"],
      synchronize: true,
    });
  }

  public getConnection() : Connection {
    return this.connection;
  }
}
