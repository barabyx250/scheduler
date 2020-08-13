import { Table, Button, Empty, Typography } from "antd";
import React, { useState, useEffect } from "react";
import { Task, TaskStatus, TaskPriority } from "../../../types/task";
import { User } from "../../../types/user";
import { ConnectionManager } from "../../../managers/connetion/connectionManager";
import {
	RequestType,
	ResponseMessage,
	ResponseCode,
} from "../../../types/requests";
import { useSelector } from "react-redux";
import { selectAccount } from "../../../redux/slicers/accountSlice";
import { TaskSelector } from "../task-selector/TaskSelector";

const { Title } = Typography;

export const ComplitedTasks: React.FC = () => {
	const accState = useSelector(selectAccount);
	const [tasks, setTasks] = useState<Task[]>([]);

	useEffect(() => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_COMPLITED_TASKS_BY_ME,
			(data) => {
				const dataMessage = data as ResponseMessage<Array<Task>>;
				console.log("GOT RESPONSE", dataMessage);

				if (dataMessage.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				setTasks(dataMessage.data);
			}
		);

		ConnectionManager.getInstance().emit(
			RequestType.GET_COMPLITED_TASKS_BY_ME,
			{},
			accState.session
		);
	}, []);

	return (
		<div>
			<Title level={2}>
				Завершені задачі які поставили Вам и які поставили Ви
			</Title>
			{tasks.length !== 0 ? (
				<TaskSelector tasks={tasks}></TaskSelector>
			) : (
				<Empty></Empty>
			)}
		</div>
	);
};
