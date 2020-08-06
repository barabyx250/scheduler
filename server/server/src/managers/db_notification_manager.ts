import { DEFAULT_NAME_DB_CONNECION, SESSION_LENGTH } from "../types/constants";
import { UserSessionEntity } from "../entities/session.entity";
import { DBManager } from "./db_manager";
import { NotificationEntity } from "../entities/notification.entity";
import { NotificationItem } from "../types/notification";
import { DBUserManager } from "./db_user_manager";

export class DBNotificationManager {
	public static async Create(
		not: NotificationItem
	): Promise<NotificationEntity> {
		const user_to = await DBUserManager.GetUserById(not.to_id);
		const user_from = await DBUserManager.GetUserById(not.from_id);

		const res = await (await DBManager.get())
			.getConnection()
			.getRepository(NotificationEntity)
			.save({
				content: not.content,
				dateCreation: new Date(),
				title: not.title,
				type: not.type,
				userTo: user_to,
				userFrom: user_from,
				wasSend: not.wasSend,
				customData: not.customData,
			});
		return res;
	}

	public static async Read(notId: number) {
		const res = await (await DBManager.get())
			.getConnection()
			.getRepository(NotificationEntity)
			.update(notId, { wasSend: true });
	}

	public static async GetByIds(ids: number[]): Promise<NotificationEntity[]> {
		const res = (await DBManager.get())
			.getConnection()
			.getRepository(NotificationEntity)
			.createQueryBuilder("notification")
			.leftJoinAndSelect("notification.userTo", "userTo")
			.leftJoinAndSelect("notification.userFrom", "userFrom")
			.where("notification.id IN :ids", { ids: ids })
			.andWhere("notification.wasSend <> TRUE")
			.getMany();
		return res;
	}

	public static async GetByUserTo(id: number): Promise<NotificationEntity[]> {
		const res = (await DBManager.get())
			.getConnection()
			.getRepository(NotificationEntity)
			.createQueryBuilder("notification")
			.leftJoinAndSelect("notification.userTo", "userTo")
			.leftJoinAndSelect("notification.userFrom", "userFrom")
			.where("userTo.id = :id", { id: id })
			.andWhere("notification.wasSend <> TRUE")
			.getMany();
		return res;
	}
}
