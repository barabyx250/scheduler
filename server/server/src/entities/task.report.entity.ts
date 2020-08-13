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
import { Task, TaskReport } from "../types/task";

@Entity()
export class TaskReportEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ default: "" })
	content: string;

	@Column()
	dateCreation: Date;

	public ToRequestObject(): TaskReport {
		return {
			id: this.id,
			content: this.content,
			dateCreation: this.dateCreation,
		};
	}
}
