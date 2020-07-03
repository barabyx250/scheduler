import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Task, TaskPriority, TaskPeriod } from "../types/task";
import { UserEntity } from "./user.entity";

@Entity()
export class TaskEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	title: string;

	@Column()
	description: string;

	@Column()
	startDate: Date;

	@Column()
	endDate: Date;

	@Column({
		type: "enum",
		enum: TaskPriority,
		default: TaskPriority.USUAL,
	})
	priority: TaskPriority;

	@Column({
		type: "enum",
		enum: TaskPeriod,
		default: TaskPeriod.ONCE,
	})
	period: TaskPeriod;

	@ManyToOne((type) => UserEntity, (user) => user.tasksByMe)
	userAuthor: UserEntity;

	@ManyToOne((type) => UserEntity, (user) => user.myTasks)
	userExecuter: UserEntity;

	public ToRequestObject(): Task {
		return {
			id: this.id,
			title: this.title,
			description: this.description,
			authorId: this.userAuthor.id,
			executerId: this.userExecuter.id,
			period: this.period,
			priority: this.priority,
			startDate: this.startDate,
			endDate: this.endDate,
		};
	}
}
