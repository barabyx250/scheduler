import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { User, UserRole } from "../../types/user";

export interface AccountState extends User {}

export const initialState: AccountState = {
	id: 0,
	login: "",
	session: "",
	firstName: "",
	middleName: "",
	password: "",
	role: UserRole.USER,
	secondName: "",
	position: {
		name: "",
		parent_id: 0,
		pos_id: 0,
	},
};

export const accountSlice = createSlice({
	name: "account",
	initialState,
	reducers: {
		setUserData: (state: AccountState, action: PayloadAction<AccountState>) => {
			console.log(action.payload);
			return {
				...state,
				...action.payload,
			};
		},
	},
});

export const { setUserData } = accountSlice.actions;

export const selectAccount = (state: RootState) => state.account;

export default accountSlice.reducer;
