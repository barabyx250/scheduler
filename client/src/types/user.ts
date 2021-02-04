import { UserPosition } from "./userPosition";

export enum UserRole {
	USER,
	ADMIN,
}

export class User {
	constructor(
		public id: number = 0,
		public session: string = "",
		public login: string = "",
		public password: string = "",
		public firstName: string = "",
		public secondName: string = "",
		public middleName: string = "",
		public role: UserRole = UserRole.USER,
		public position: UserPosition = {
			name: "",
			parent_id: 0,
			pos_id: 0,
		}
	) {}

	public static EmptyUser(): User {
		return new User();
	}

	public static GetUserPIB(u: User | undefined): string {
		if (u) return u.secondName + " " + u.firstName + " " + u.middleName;
		else return "";
	}
}
