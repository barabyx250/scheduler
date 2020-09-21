import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	OneToOne,
	JoinColumn,
	ManyToOne,
} from "typeorm";
import { UserEntity } from "./user.entity";
import { AdminMessage } from "../types/adminMessage";
import { AdminChatEntity } from "./admin.chat.entity";

@Entity()
export class TextMessageEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	content: string;

	@Column()
	dateCreate: Date;

	@Column({ default: false })
	isRead: boolean;

	@ManyToOne((type) => UserEntity, (user) => user.messages)
	fromUser: UserEntity;

	@ManyToOne((type) => AdminChatEntity, (chat) => chat.messages)
	chat: AdminChatEntity;

	public ToRequestObject(): AdminMessage {
		return {
			id: this.id,
			content: this.content,
			dateCreate: this.dateCreate,
			fromUser: this.fromUser.id,
		};
	}
}
