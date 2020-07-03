import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";
import accountReducer from "../redux/slicers/accountSlice";
import taskReducer from "../redux/slicers/taskSlice";

const store = configureStore({
	reducer: {
		counter: counterReducer,
		account: accountReducer,
		task: taskReducer,
	},
	devTools: true,
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
	ReturnType,
	RootState,
	unknown,
	Action<string>
>;
