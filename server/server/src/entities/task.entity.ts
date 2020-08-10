import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	OneToOne,
	JoinColumn,
	OneToMany,
} from "typeorm";
import {
	Task,
	TaskPriority,
	TaskPeriod,
	TaskStatus,
	TaskDate,
} from "../types/task";
import { UserEntity } from "./user.entity";
import { TaskFlagsEntity } from "./task.flags.entity";

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

	@Column({
		type: "enum",
		enum: TaskStatus,
		default: TaskStatus.IN_PROGRESS,
	})
	status: TaskStatus;

	@Column({ default: () => "CURRENT_TIMESTAMP" })
	dateComplited: Date;

	@ManyToOne((type) => UserEntity, (user) => user.tasksByMe)
	userAuthor: UserEntity;

	@ManyToOne((type) => UserEntity, (user) => user.myTasks)
	userExecuter: UserEntity;

	@OneToMany((type) => TaskPeriodDataEntity, (taskDate) => taskDate.task)
	periodDates: TaskPeriodDataEntity[];

	@OneToOne((type) => TaskFlagsEntity)
	@JoinColumn()
	flags: TaskFlagsEntity;

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
			dateComplited: this.dateComplited,
			status: this.status,
			periodDates: this.periodDates.map((pd) => {
				const date: TaskDate = {
					id: pd.id,
					endDate: pd.endDate,
					startDate: pd.startDate,
				};
				return date;
			}),
		};
	}
}

@Entity()
export class TaskPeriodDataEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	startDate: Date;

	@Column()
	endDate: Date;

	@ManyToOne((type) => TaskEntity, (task) => task.periodDates)
	task?: TaskEntity;
}
