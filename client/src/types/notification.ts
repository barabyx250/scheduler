export enum NotificationType {
	SYSTEM = "notification_system",
	TASK_CREATE = "notification_task_create",
	ADMIN_SMS = "admin_sms",
}

export class NotificationItem {
	public constructor(
		public id: number,
		public title: string,
		public content: string,
		public dateCreation: Date,
		public customData: any,
		public type: NotificationType,
		public from_id: number,
		public to_id: number,
		public wasSend: boolean
	) {}
}
