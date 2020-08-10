import { Task, TaskPriority } from "../types/task";
import { addDays } from "date-fns/esm";
import { TimeLineItem } from "../components/calendar/calendar-view-week/CalendarViewWeek";

export function formatDateForDisplayTasks(dateObject: Date) {
	// const dayNum = dateObject.getDate() + 1;
	// const monthNum = dateObject.getMonth() + 1;
	// const yearNum = dateObject.getFullYear();
	// const day: string = dayNum < 10 ? "0" + dayNum.toString() : dayNum.toString();
	// const month: string =
	// 	monthNum < 10 ? "0" + monthNum.toString() : monthNum.toString();
	// const year: string = yearNum.toString().substr(2, 4);

	//const lDate = new Date(`${month}.${day}.${year}`);
	const lDate = new Date(dateObject);
	lDate.setHours(0);
	return lDate;
}

export function formatDateTaskForDisplay(startDate: Date, endDate: Date) {
	return {
		start_time: formatDateForDisplayTasks(new Date(startDate)),
		end_time: formatDateForDisplayTasks(addDays(new Date(endDate), 1)),
	};
}

export function ifTaskBetweenDates(start: Date, end: Date, task: Task) {
	const oneStart = new Date(task.startDate) <= end;
	const twoStart = new Date(task.startDate) >= start;

	const oneEnd = new Date(task.endDate) <= end;
	const twoEnd = new Date(task.endDate) > start;

	const result: boolean = (oneStart && twoStart) || (oneEnd && twoEnd);
	return result || isTaskPeriodDateBetweenDates(start, end, task);
}

export function isTaskPeriodDateBetweenDates(
	start: Date,
	end: Date,
	task: Task
) {
	for (var date of task.periodDates) {
		const oneStart = new Date(date.startDate) <= end;
		const twoStart = new Date(date.startDate) >= start;

		const oneEnd = new Date(date.endDate) <= end;
		const twoEnd = new Date(date.endDate) > start;

		const result: boolean = (oneStart && twoStart) || (oneEnd && twoEnd);
		if (result) return result;
	}
	return false;
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

export function generateTimelineItemsByTaskPeriodDates(
	task: Task,
	filterStartDate: Date,
	filterEndDate: Date,
	onMouseDown: any
): TimeLineItem[] {
	const items: TimeLineItem[] = [];

	for (var date of task.periodDates) {
		const oneStart = new Date(date.startDate) <= filterEndDate;
		const twoStart = new Date(date.startDate) >= filterStartDate;

		const oneEnd = new Date(date.endDate) <= filterEndDate;
		const twoEnd = new Date(date.endDate) > filterStartDate;

		const result: boolean = (oneStart && twoStart) || (oneEnd && twoEnd);
		if (!result) continue;

		const item: TimeLineItem = {
			id: date.id,
			group: task.id,
			title: task.title,
			...formatDateTaskForDisplay(date.startDate, date.endDate),
			canMove: false,
			canResize: false,
			canChangeGroup: false,
			data: {
				...task,
			},
		};

		const backgroundColor =
			task.priority === TaskPriority.RED
				? "#ff4d4f"
				: task.priority === TaskPriority.YELLOW
				? "#ffec3d"
				: "#52c41a";
		const textColor =
			task.priority === TaskPriority.YELLOW ? "#262626" : "#fafafa";
		item.itemProps = {
			style: {
				backgroundColor: backgroundColor,
				borderRadius: "50px",
				color: textColor,
			},
			onMouseDown: onMouseDown,
		};

		items.push(item);
	}

	return items;
}
