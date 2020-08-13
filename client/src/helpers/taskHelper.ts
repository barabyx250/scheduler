import { Task } from "../types/task";
import { addDays } from "date-fns/esm";

export function formatDateForDisplayTasks(dateObject: Date) {
	// const dayNum = dateObject.getDate() + 1;
	// const monthNum = dateObject.getMonth() + 1;
	// const yearNum = dateObject.getFullYear();
	// const day: string = dayNum < 10 ? "0" + dayNum.toString() : dayNum.toString();
	// const month: string =
	// 	monthNum < 10 ? "0" + monthNum.toString() : monthNum.toString();
	// const year: string = yearNum.toString().substr(0, 2);

	//const lDate = new Date(`${month}.${day}.${year}`);
	const lDate = new Date(dateObject);
	lDate.setHours(0, 1, 1, 1);
	return lDate;
}

export function formatDateTaskForDisplay(task: Task) {
	return {
		start_time: formatDateForDisplayTasks(new Date(task.startDate)),
		end_time: formatDateForDisplayTasks(addDays(new Date(task.endDate), 1)),
	};
}

export function ifTaskBetweenDates(start: Date, end: Date, task: Task) {
	const oneStart = new Date(task.startDate) <= end;
	const twoStart = new Date(task.startDate) >= start;

	const oneEnd = new Date(task.endDate) <= end;
	const twoEnd = new Date(task.endDate) > start;

	const result: boolean = (oneStart && twoStart) || (oneEnd && twoEnd);
	return result;
}

export function formatDateForStartDate(date: Date): Date {
	const newDate = new Date(date);

	return newDate;
}

export function formatDateForEndDate(date: Date): Date {
	const newDate = new Date(date);
	newDate.setHours(20, 0, 0, 0);
	return newDate;
}
