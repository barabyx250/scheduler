import { UserEntity } from "../entities/user.entity";
import { getConnection, getRepository, SelectQueryBuilder } from "typeorm";
import { DEFAULT_NAME_DB_CONNECION } from "../types/constants";
import { User } from "../types/user";
import { UserSessionEntity } from "../entities/session.entity";
import { DBManager } from "./db_manager";
import { UserPositionEntity } from "../entities/user.position.entity";
import { UserPosition } from "../types/userPosition";

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
		const positionEntity = await (await DBManager.get())
			.getConnection()
			.getRepository(UserPositionEntity)
			.createQueryBuilder("position")
			.leftJoinAndSelect("position.parent", "parent")
			.where("position.id = :id", { id })
			.getOne();

		return positionEntity;
	}

	public static async GetUsersByPositionId(id: number): Promise<UserEntity[]> {
		const userEntities = DBUserManager.applyUserInnerJoins(
			await (await DBManager.get())
				.getConnection()
				.getRepository(UserEntity)
				.createQueryBuilder("user")
		)
			.where("position.id = :id", { id })
			.getMany();

		return userEntities;
	}

	public static async GetUserChiefs(user_id: number): Promise<UserEntity[]> {
		const userEntity = await DBUserManager.GetUserById(user_id);

		if (userEntity && userEntity.position) {
			const chief = DBUserManager.GetUsersByPositionId(
				userEntity.position.parent.id
			);
			return chief;
		}

		return [];
	}

	public static async IsPositionExistById(posId: number): Promise<boolean> {
		const position = await DBUserManager.GetUserPositionsById(posId);
		return position !== undefined;
	}

	public static async UpdateUserPosition(position: UserPosition) {
		const isExist = await DBUserManager.IsPositionExistById(position.pos_id);
		if (isExist) {
			console.log("uup exist", position);
			(await DBManager.get())
				.getConnection()
				.getRepository(UserPositionEntity)
				.update(position.pos_id, {
					parent: { id: position.parent_id },
					name: position.name,
					pos_id: position.pos_id,
				});
		} else {
			const parent = await DBUserManager.GetUserPositionsById(
				position.parent_id
			);
			console.log("uup", parent, position);

			if (parent !== undefined) {
				(await DBManager.get())
					.getConnection()
					.getRepository(UserPositionEntity)
					.save({
						id: position.pos_id,
						pos_id: position.pos_id,
						name: position.name,
						parent: {
							id: parent.id,
						},
					});
			}
		}
	}

	public static async UpdateUserInfo(user: UserEntity) {
		(await DBManager.get())
			.getConnection()
			.getRepository(UserEntity)
			.update(user.id, {
				login: user.login,
				firstName: user.firstName,
				middleName: user.middleName,
				secondName: user.secondName,
				password: user.password,
			});
	}
}
