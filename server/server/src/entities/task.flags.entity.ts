import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	OneToOne,
	JoinColumn,
} from "typeorm";
import { UserEntity } from "./user.entity";
import { TaskEntity } from "./task.entity";
import { Task } from "../types/task";

@Entity()
export class TaskFlagsEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	isFifteenPrecentProgress: boolean;

	@Column()
	isTwentyFivePrecentProgress: boolean;

	@Column()
	isTenPrecentProgress: boolean;
}
