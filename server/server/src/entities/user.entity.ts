import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	OneToMany,
	ManyToOne,
	JoinColumn,
} from "typeorm";
import { UserSessionEntity } from "./session.entity";
import { User, UserRole } from "../types/user";
import { TaskEntity } from "./task.entity";
import { UserPositionEntity } from "./userPosition.entity";

@Entity()
export class UserEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	login: string;

	@Column()
	password: string;

	@Column({ default: "" })
	firstName: string;

	@Column({ default: "" })
	middleName: string;

	@Column({ default: "" })
	secondName: string;

	@Column({
		type: "enum",
		enum: UserRole,
		default: UserRole.USER,
	})
	role: UserRole;

	@ManyToOne((type) => UserPositionEntity, (userPos) => userPos.users)
	position?: UserPositionEntity;

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
			password: "",
			session: "",
			firstName: this.firstName,
			middleName: this.middleName,
			role: this.role,
			secondName: this.secondName,
			position: this.position
				? this.position?.ToRequestObject()
				: {
						name: "",
						parent_id: 0,
						pos_id: 0,
				  },
		};
	}
}
