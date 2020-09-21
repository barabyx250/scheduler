import { getConnection, getRepository, SelectQueryBuilder } from "typeorm";
import { DEFAULT_NAME_DB_CONNECION, SESSION_LENGTH } from "../types/constants";
import { User } from "../types/user";
import { UserSessionEntity } from "../entities/session.entity";
import { DBManager } from "./db_manager";
import { TextMessageEntity } from "../entities/text.message.entity";
import { AdminChatEntity } from "../entities/admin.chat.entity";

export class DBAdminChatManager {
	public static applyUserInnerJoins(
		query: SelectQueryBuilder<AdminChatEntity>
	): SelectQueryBuilder<AdminChatEntity> {
		query.leftJoinAndSelect("chat.withUser", "withUser");

		return query;
	}

	public static async CreateChat(withUserId: number): Promise<AdminChatEntity> {
		const chat = await getRepository(AdminChatEntity).save({
			withUser: {
				id: withUserId,
			},
		});

		return getRepository(AdminChatEntity).create(chat);
	}

	public static async GetChatByUserId(
		user_id: number
	): Promise<AdminChatEntity | undefined> {
		const chat = DBAdminChatManager.applyUserInnerJoins(
			getRepository(AdminChatEntity).createQueryBuilder("chat")
		)
			.where("withUser.id = :user_id", { user_id: user_id })
			.getOne();
		return chat;
	}

	public static async GetAllChats(): Promise<AdminChatEntity[]> {
		const chats = DBAdminChatManager.applyUserInnerJoins(
			getRepository(AdminChatEntity).createQueryBuilder("chat")
		).getMany();
		return chats;
	}
}
