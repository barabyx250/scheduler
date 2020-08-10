export enum TaskPeriod {
	ONCE,
	MONTH,
	HALFYEAR,
	YEAR,
}

export enum TaskPriority {
	RED = 1,
	YELLOW = 2,
	USUAL = 3,
}

export enum TaskStatus {
	IN_PROGRESS,
	COMPLITED,
}

export interface TaskDate {
	startDate: Date;
	endDate: Date;
	id: number;
}

export class Task {
	constructor(
		public id: number,
		public description: string,
		public title: string,
		public startDate: Date,
		public endDate: Date,
		public authorId: number,
		public executerId: number,
		public period: TaskPeriod,
		public priority: TaskPriority,
		public status: TaskStatus,
		public dateComplited: Date,
		public periodDates: TaskDate[]
	) {}
}
