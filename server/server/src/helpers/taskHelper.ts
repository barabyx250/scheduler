import { TaskPeriod, Task } from "../types/task";
import { addMonths, addYears } from "date-fns";
import { TaskEntity } from "../entities/task.entity";
import { TaskFilters } from "../types/taskFilter";
import { fi } from "date-fns/locale";
import { LoggerInstanse } from "../logger/config";

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
	const newStartDate = new Date(task.startDate);
	const newEndDate = new Date(task.endDate);
	const newStart = new Date(start);
	const endStart = new Date(end);

	const oneStart = newStartDate <= endStart;
	const twoStart = newStartDate >= newStart;

	const oneEnd = newEndDate <= endStart;
	const twoEnd = newEndDate > newStart;

	const result: boolean = (oneStart && twoStart) || (oneEnd && twoEnd);
	return result;
}

export function filterTask(filter: TaskFilters, task: Task): boolean {
	if (filter.status !== undefined && filter.status !== task.status) {
		return false;
	}

	if (filter.nameReg !== undefined && !task.title.match(filter.nameReg)) {
		return false;
	}

	if (
		filter.authorIds !== undefined &&
		filter.authorIds.findIndex((aid) => aid === task.authorId) < 0
	) {
		return false;
	}

	if (
		filter.executorIds !== undefined &&
		filter.executorIds.findIndex((eid) => eid === task.executerId) < 0
	) {
		return false;
	}

	if (filter.private !== undefined && filter.private !== task.isPrivate) {
		return false;
	}

	if (
		filter.betweenDates !== undefined &&
		!ifTaskBetweenDates(
			filter.betweenDates.start,
			filter.betweenDates.end,
			task
		)
	) {
		LoggerInstanse.linfo("BROKE GETING TASK BY DATES", {
			task,
			dates: filter.betweenDates,
		});
		return false;
	}

	if (
		filter.getOriginalTask !== undefined &&
		filter.getOriginalTask &&
		task.periodParentId !== task.id
	) {
		return false;
	}

	return true;
}
