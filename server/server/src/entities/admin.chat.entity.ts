import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	OneToOne,
	JoinColumn,
	OneToMany,
} from "typeorm";
import { UserEntity } from "./user.entity";
import { AdminMessage, AdminChat } from "../types/adminMessage";
import { TextMessageEntity } from "./text.message.entity";

@Entity()
export class AdminChatEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@OneToOne((type) => UserEntity)
	@JoinColumn()
	withUser: UserEntity;

	@OneToMany((type) => TextMessageEntity, (messages) => messages.chat)
	messages?: TextMessageEntity[];

	public ToRequestObject(): AdminChat {
		return {
			id: this.id,
			withUser: this.withUser.id,
			messages: this.messages
				? this.messages.map((ms) => ms.ToRequestObject())
				: [],
		};
	}
}
