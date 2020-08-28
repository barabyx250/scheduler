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
		public periodParentId: number,
		public report: TaskReport,
		public isPrivate: boolean
	) {}
}

export class TaskReport {
	constructor(
		public id: number,
		public content: string,
		public dateCreation: Date
	) {}
}
