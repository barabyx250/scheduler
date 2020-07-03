import { UserEntity } from "../entities/user.entity";
import { getConnection, getRepository } from "typeorm";
import { DEFAULT_NAME_DB_CONNECION } from "../types/constants";
import { User } from "../types/user";
import { UserSessionEntity } from "../entities/session.entity";
import { DBManager } from "./db_manager";

export class DBUserManager {
	public static async CreateUser(user: User) {
		await (await DBManager.get())
			.getConnection()
			.getRepository(UserEntity)
			.save({
				login: user.login,
				password: user.password,
			});
	}

	public static async GetUser(login: string): Promise<UserEntity | undefined> {
		const user = getRepository(UserEntity)
			.createQueryBuilder("user")
			.where("user.login = :login", { login })
			.getOne();
		return user;
	}

	public static async GetUserById(id: number): Promise<UserEntity | undefined> {
		const user = getRepository(UserEntity)
			.createQueryBuilder("user")
			.where("user.id = :id", { id })
			.getOne();
		return user;
	}

	public static async GetUserBySession(
		session: string
	): Promise<UserEntity | undefined> {
		const sessionEntity = await getRepository(UserSessionEntity)
			.createQueryBuilder("session")
			.leftJoinAndSelect("session.user", "user")
			.where("session.session = :session", { session })
			.getOne();

		return getRepository(UserEntity)
			.createQueryBuilder("user")
			.where("user.id = :id", { id: sessionEntity?.user.id })
			.getOne();
	}
}
