import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../../app/store";
import { Task } from "../../types/task";

export interface TaskState {
	myTasks: Array<Task>;
}

export const initialState: TaskState = {
	myTasks: [],
};

export const taskSlice = createSlice({
	name: "task",
	initialState,
	reducers: {
		setTasks: (state: TaskState, action: PayloadAction<Array<Task>>) => {
			return {
				...state,
				...{
					myTasks: action.payload,
				},
			};
		},
	},
});

export const { setTasks } = taskSlice.actions;

export const selectMyTask = (state: RootState) => {
	return state.task.myTasks;
};

export default taskSlice.reducer;
