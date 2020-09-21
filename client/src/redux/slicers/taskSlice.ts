import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { Task } from "../../types/task";

export interface TaskState {
	myTasks: Array<Task>;
	getTaskFrom: Date;
	getTaskTo: Date;
}

export const initialState: TaskState = {
	myTasks: [],
	getTaskFrom: new Date(),
	getTaskTo: new Date(),
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
		setGetTaskDateInterval: (
			state: TaskState,
			action: PayloadAction<{ from: Date; to: Date }>
		) => {
			console.log("setGetTaskDateInterval", action);

			return {
				...state,
				getTaskFrom: action.payload.from,
				getTaskTo: action.payload.to,
			};
		},
	},
});

export const { setTasks, setGetTaskDateInterval } = taskSlice.actions;

export const selectMyTask = (state: RootState) => {
	return state.task.myTasks;
};

export const selectTaskDateInterval = (state: RootState) => {
	return { from: state.task.getTaskFrom, to: state.task.getTaskTo };
};

export default taskSlice.reducer;
