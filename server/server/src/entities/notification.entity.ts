import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Task, TaskPriority, TaskPeriod, TaskStatus } from "../types/task";
import { UserEntity } from "./user.entity";
import { NotificationType, NotificationItem } from "../types/notification";

@Entity()
export class NotificationEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	title: string;

	@Column()
	content: string;

	@Column()
	dateCreation: Date;

	@Column({
		type: "enum",
		enum: NotificationType,
		default: NotificationType.SYSTEM,
	})
	type: NotificationType;

	@Column({
		default: "",
	})
	customData: string;

	@Column()
	wasSend: boolean;

	@ManyToOne((type) => UserEntity, (user) => user.myNotifications)
	userTo: UserEntity;

	@ManyToOne((type) => UserEntity, (user) => user.notifications)
	userFrom?: UserEntity;

	public ToRequestObject(): NotificationItem {
		return {
			id: this.id,
			title: this.title,
			content: this.content,
			dateCreation: this.dateCreation,
			from_id: this.userFrom ? this.userFrom.id : 0,
			to_id: this.userTo.id,
			type: this.type,
			wasSend: this.wasSend,
			customData: this.customData,
		};
	}
}
