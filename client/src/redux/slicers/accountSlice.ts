import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../../app/store";

export interface AccountState {
	id: number;
	login: string;
	session: string;
}

export const initialState: AccountState = {
	id: 0,
	login: "",
	session: "",
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
