import { UserEntity } from "../entities/user.entity";
import { getConnection, getRepository } from "typeorm";
import { DEFAULT_NAME_DB_CONNECION, SESSION_LENGTH } from "../types/constants";
import { User } from "../types/user";
import { UserSessionEntity } from "../entities/session.entity";
import { DBManager } from "./db_manager";

export class DBSessionManager {
	public static makeid(length: number): string {
		var result = "";
		var characters =
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		var charactersLength = characters.length;
		for (var i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	}

	public static async CreateSession(user: User): Promise<string> {
		const session: string = this.makeid(SESSION_LENGTH);
		await (await DBManager.get())
			.getConnection()
			.getRepository(UserSessionEntity)
			.save({
				session,
				user,
			});
		return session;
	}

	public static async GetSessionsByUserId(
		userId: number
	): Promise<UserSessionEntity[]> {
		const sessionEntity = getRepository(UserSessionEntity)
			.createQueryBuilder("session")
			.leftJoinAndSelect("session.user", "user")
			.where("user.id = :user_id", { user_id: userId })
			.getMany();
		return sessionEntity;
	}
}
