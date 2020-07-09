import { UserEntity } from "../entities/user.entity";
import { getConnection, getRepository, SelectQueryBuilder } from "typeorm";
import { DEFAULT_NAME_DB_CONNECION } from "../types/constants";
import { User } from "../types/user";
import { UserSessionEntity } from "../entities/session.entity";
import { DBManager } from "./db_manager";
import { UserPositionEntity } from "../entities/userPosition.entity";

export class DBUserManager {
	public static applyUserInnerJoins(
		query: SelectQueryBuilder<UserEntity>
	): SelectQueryBuilder<UserEntity> {
		query.leftJoinAndSelect("user.position", "position");
		query.leftJoinAndSelect("position.parent", "posParent");
		return query;
	}

	public static async CreateUser(user: User) {
		const position = await DBUserManager.GetUserPositionsById(
			user.position.pos_id
		);

		await (await DBManager.get())
			.getConnection()
			.getRepository(UserEntity)
			.save({
				login: user.login,
				password: user.password,
				firstName: user.firstName,
				secondName: user.secondName,
				middleName: user.middleName,
				role: user.role,
				position: position,
			});
	}

	public static async GetUser(login: string): Promise<UserEntity | undefined> {
		const user = DBUserManager.applyUserInnerJoins(
			getRepository(UserEntity).createQueryBuilder("user")
		)
			.where("user.login = :login", { login })
			.getOne();
		return user;
	}

	public static async GetUserById(id: number): Promise<UserEntity | undefined> {
		const user = DBUserManager.applyUserInnerJoins(
			getRepository(UserEntity).createQueryBuilder("user")
		)
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

		return DBUserManager.applyUserInnerJoins(
			getRepository(UserEntity).createQueryBuilder("user")
		)
			.where("user.id = :id", { id: sessionEntity?.user.id })
			.getOne();
	}

	public static async GetAllUserPositions(): Promise<UserPositionEntity[]> {
		const sessionEntity = await (await DBManager.get())
			.getConnection()
			.getRepository(UserPositionEntity)
			.createQueryBuilder("position")
			.leftJoinAndSelect("position.parent", "parent")
			.getMany();

		return sessionEntity;
	}

	public static async GetUserPositionsById(
		id: number
	): Promise<UserPositionEntity | undefined> {
		const sessionEntity = await (await DBManager.get())
			.getConnection()
			.getRepository(UserPositionEntity)
			.createQueryBuilder("position")
			.leftJoinAndSelect("position.parent", "parent")
			.where("position.id = :id", { id })
			.getOne();

		return sessionEntity;
	}

	public static async GetUsersByPositionId(id: number): Promise<UserEntity[]> {
		const sessionEntity = DBUserManager.applyUserInnerJoins(
			await (await DBManager.get())
				.getConnection()
				.getRepository(UserEntity)
				.createQueryBuilder("user")
		)
			.where("position.id = :id", { id })
			.getMany();

		return sessionEntity;
	}
}
