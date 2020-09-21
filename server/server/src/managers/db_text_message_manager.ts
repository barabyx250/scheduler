import { getConnection, getRepository, SelectQueryBuilder } from "typeorm";
import { DEFAULT_NAME_DB_CONNECION, SESSION_LENGTH } from "../types/constants";
import { User } from "../types/user";
import { UserSessionEntity } from "../entities/session.entity";
import { DBManager } from "./db_manager";
import { TextMessageEntity } from "../entities/text.message.entity";

export class DBTextMessageManager {
	public static applyUserInnerJoins(
		query: SelectQueryBuilder<TextMessageEntity>
	): SelectQueryBuilder<TextMessageEntity> {
		query.leftJoinAndSelect("message.fromUser", "fromUser");
		query.leftJoinAndSelect("message.chat", "chat");

		return query;
	}

	public static async CreateMessage(
		content: string,
		chatId: number,
		fromUser: number
	): Promise<TextMessageEntity> {
		const message = await getRepository(TextMessageEntity).save({
			dateCreate: new Date(),
			content: content,
			fromUser: {
				id: fromUser,
			},
			chat: {
				id: chatId,
			},
		});

		return getRepository(TextMessageEntity).create(message);
	}

	public static async GetMessages(
		id: number,
		count: number,
		chatWithUserId: number
	): Promise<TextMessageEntity[]> {
		const message = DBTextMessageManager.applyUserInnerJoins(
			getRepository(TextMessageEntity).createQueryBuilder("message")
		)
			.orderBy("message.id", "DESC")
			.where("message.id < :message_id", { message_id: id })
			.andWhere("chat.withUser.id = :withUserId", {
				withUserId: chatWithUserId,
			})
			.limit(count)
			.getMany();
		return message;
	}
	public static async GetLastMessages(
		count: number,
		chatWithUserId: number
	): Promise<TextMessageEntity[]> {
		const message = DBTextMessageManager.applyUserInnerJoins(
			getRepository(TextMessageEntity).createQueryBuilder("message")
		)
			.where("chat.withUser.id = :withUserId", {
				withUserId: chatWithUserId,
			})
			.orderBy("message.id", "DESC")
			.limit(count)
			.getMany();
		return message;
	}
}
