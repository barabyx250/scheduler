export class AdminChat {
	constructor(
		public id: number,
		public withUser: number,
		public messages: AdminMessage[]
	) {}
}

export class AdminMessage {
	constructor(
		public id: number,
		public content: string,
		public dateCreate: Date,
		public fromUser: number
	) {}
}
