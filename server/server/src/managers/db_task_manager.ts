import { UserEntity } from "../entities/user.entity";
import { getConnection, getRepository } from "typeorm";
import { DEFAULT_NAME_DB_CONNECION } from "../types/constants";
import { UserSessionEntity } from "../entities/session.entity";
import { DBManager } from "./db_manager";
import { Task } from "../types/task";
import { TaskEntity } from "../entities/task.entity";
import { DBUserManager } from "./db_user_manager";

export class DBTaskManager {
	public static async CreateTask(task: Task): Promise<TaskEntity | undefined> {
		const author = await DBUserManager.GetUserById(task.authorId);
		const executer = await DBUserManager.GetUserById(task.executerId);

		const newTask = await (await DBManager.get())
			.getConnection()
			.getRepository(TaskEntity)
			.save({
				title: task.title,
				description: task.description,
				period: task.period,
				priority: task.priority,
				startDate: task.startDate,
				endDate: task.endDate,
				userAuthor: author,
				userExecuter: executer,
			});

		return this.GetTaskById(newTask.id);
	}

	public static async GetTaskById(id: number): Promise<TaskEntity | undefined> {
		const task = getRepository(TaskEntity)
			.createQueryBuilder("task")
			.leftJoinAndSelect("task.userAuthor", "userAuthor")
			.leftJoinAndSelect("task.userExecuter", "userExecuter")
			.where("task.id = :id", { id })
			.getOne();
		return task;
	}

	public static async GetTasksByExecuterId(
		executerId: number
	): Promise<TaskEntity[]> {
		const task = getRepository(TaskEntity)
			.createQueryBuilder("task")
			.leftJoinAndSelect("task.userAuthor", "userAuthor")
			.leftJoinAndSelect("task.userExecuter", "userExecuter")
			.where("userExecuter.id = :id", { id: executerId })
			.getMany();
		return task;
	}

	public static async GetTasksByAuthorId(
		authorId: number
	): Promise<TaskEntity[]> {
		const task = getRepository(TaskEntity)
			.createQueryBuilder("task")
			.leftJoinAndSelect("task.userAuthor", "userAuthor")
			.leftJoinAndSelect("task.userExecuter", "userExecuter")
			.where("userAuthor.id = :id", { id: authorId })
			.getMany();
		return task;
	}

	// public static async GetUserBySession(
	// 	session: string
	// ): Promise<UserEntity | undefined> {
	// 	const sessionEntity = await getRepository(UserSessionEntity)
	// 		.createQueryBuilder("session")
	// 		.where("user.session = :session", { session })
	// 		.getOne();

	// 	return getRepository(UserEntity)
	// 		.createQueryBuilder("user")
	// 		.where("user.id = :id", { id: sessionEntity?.user.id })
	// 		.getOne();
	// }
}
