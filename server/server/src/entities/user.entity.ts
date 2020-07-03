import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	OneToMany,
	ManyToOne,
} from "typeorm";
import { UserSessionEntity } from "./session.entity";
import { User } from "../types/user";
import { TaskEntity } from "./task.entity";

@Entity()
export class UserEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	login: string;

	@Column()
	password: string;

	@Column({ default: () => "CURRENT_TIMESTAMP" })
	dateCreation?: Date;

	@OneToMany((type) => UserSessionEntity, (session) => session.user)
	sessions?: UserSessionEntity[];

	@OneToMany((type) => TaskEntity, (task) => task.userAuthor)
	tasksByMe?: TaskEntity[];

	@OneToMany((type) => TaskEntity, (task) => task.userExecuter)
	myTasks?: TaskEntity[];

	public ToRequestObject(): User {
		return {
			id: this.id,
			login: this.login,
			password: this.password,
			session: "",
		};
	}
}
