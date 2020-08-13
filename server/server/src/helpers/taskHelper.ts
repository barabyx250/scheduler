import { TaskPeriod, Task } from "../types/task";
import { addMonths, addYears } from "date-fns";
import { TaskEntity } from "../entities/task.entity";

export function generatePeriodTasks(task: Task): Task[] {
	const periodTasks: Task[] = [];

	const periodStep = 30;

	for (var i = 1; i <= periodStep; i++) {
		let periodTask: Task = {
			...task,
			id: 0,
			startDate: addMonths(new Date(task.startDate), i),
			endDate: addMonths(new Date(task.endDate), i),
			periodParentId: task.id,
		};

		if (task.period === TaskPeriod.HALFYEAR) {
			periodTask.startDate = addMonths(new Date(task.startDate), i * 6);
			periodTask.endDate = addMonths(new Date(task.endDate), i * 6);
		} else if (task.period === TaskPeriod.YEAR) {
			periodTask.startDate = addYears(new Date(task.startDate), i);
			periodTask.endDate = addYears(new Date(task.endDate), i);
		}

		periodTask.startDate.setHours(1, 0, 0, 0);

		periodTasks.push(periodTask);
	}

	return periodTasks;
}

export function ifTaskBetweenDates(
	start: Date,
	end: Date,
	task: Task | TaskEntity
) {
	const oneStart = new Date(task.startDate) <= end;
	const twoStart = new Date(task.startDate) >= start;

	const oneEnd = new Date(task.endDate) <= end;
	const twoEnd = new Date(task.endDate) > start;

	const result: boolean = (oneStart && twoStart) || (oneEnd && twoEnd);
	return result;
}
