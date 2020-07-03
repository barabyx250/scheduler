import React, { useEffect } from "react";
import { Task } from "../../types/task";
import { Type, Calendar } from "../calendar/Calendar";
import { ConnectionManager } from "../../managers/connetion/connectionManager";
import {
	RequestType,
	ResponseMessage,
	ResponseCode,
	RequestMessage,
} from "../../types/requests";
import { useDispatch, useSelector } from "react-redux";
import { setTasks, selectMyTask } from "../../redux/slicers/taskSlice";
import {
	selectAccount,
	setUserData,
	AccountState,
} from "../../redux/slicers/accountSlice";
import { Empty } from "antd";

export const MyTasks: React.FC = () => {
	const dispatch = useDispatch();
	const accState = useSelector(selectAccount);
	ConnectionManager.getInstance().registerResponseHandler(
		RequestType.GET_MY_TASKS,
		(data) => {
			const dataMessage = data as ResponseMessage<Array<Task>>;
			if (dataMessage.requestCode == ResponseCode.RES_CODE_INTERNAL_ERROR) {
				console.log(`Error: ${dataMessage.requestCode}`);
				return;
			}
			console.log(data);
			dispatch(setTasks(dataMessage.data));
		}
	);
	useEffect(() => {
		setInterval(() => {
			ConnectionManager.getInstance().emit(
				RequestType.GET_MY_TASKS,
				{},
				accState.session
			);
		}, 3000);
	}, []);

	const myTaskState = useSelector(selectMyTask);

	if (myTaskState.length === 0) {
		return <Empty style={{ paddingTop: "10%" }} />;
	}

	return <Calendar type={Type.WEEK} tasks={myTaskState}></Calendar>;
};
