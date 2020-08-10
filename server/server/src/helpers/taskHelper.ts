import { TaskPeriod, TaskDate } from "../types/task";
import { addMonths, addYears } from "date-fns";

export function generateDatesByPeriod(
	startDate: Date,
	endDate: Date,
	period: TaskPeriod
): TaskDate[] {
	const dates: TaskDate[] = [];

	if (period === TaskPeriod.ONCE) return dates;

	let stepCount = 30; //month

	for (var i = 1; i <= stepCount; i++) {
		let date: TaskDate = {
			id: 0,
			startDate: addMonths(new Date(startDate), i),
			endDate: addMonths(new Date(endDate), i),
		};

		if (period === TaskPeriod.HALFYEAR) {
			date = {
				id: 0,
				startDate: addMonths(new Date(startDate), i * 6),
				endDate: addMonths(new Date(endDate), i * 6),
			};
		} else if (period === TaskPeriod.YEAR) {
			date = {
				id: 0,
				startDate: addYears(new Date(startDate), i),
				endDate: addYears(new Date(endDate), i),
			};
		}

		dates.push(date);
	}

	return dates;
}
