import React, { useEffect, useState } from "react";
import { Task } from "../../../types/task";
import { Type, Calendar } from "../../calendar/Calendar";
import { ConnectionManager } from "../../../managers/connetion/connectionManager";
import {
	RequestType,
	ResponseMessage,
	ResponseCode,
} from "../../../types/requests";
import { useDispatch, useSelector } from "react-redux";
import { setTasks, selectMyTask } from "../../../redux/slicers/taskSlice";
import { selectAccount } from "../../../redux/slicers/accountSlice";
import { Empty, Radio, Select } from "antd";
import { TimersManager } from "../../../managers/timersManager";
import { RadioChangeEvent } from "antd/lib/radio";
import { CALLBACK_UPDATE_MY_TASK } from "../../../types/constants";
import { User } from "../../../types/user";

const { Option } = Select;

export const SubbordinatesTasks: React.FC = () => {
	const accState = useSelector(selectAccount);
	const [calendarTypeState, setCalendarTypeState] = useState(Type.WEEK);
	const [subbordinatesState, setSubbordinatesState] = useState<User[]>([]);
	const [subbordinatesTasksState, setSubbordinatesTasksState] = useState<
		Task[]
	>([]);

	useEffect(() => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_MY_SUBORDINATE,
			(data) => {
				const dataMessage = data as ResponseMessage<Array<User>>;
				if (dataMessage.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				setSubbordinatesState(
					dataMessage.data.filter((u) => u.id !== accState.id)
				);
			}
		);

		ConnectionManager.getInstance().emit(
			RequestType.GET_MY_SUBORDINATE,
			{},
			accState.session
		);

		return () => {
			TimersManager.getInstance().clearCallback(CALLBACK_UPDATE_MY_TASK);
		};
	}, []);

	const onRadioChange = (e: RadioChangeEvent) => {
		setCalendarTypeState(e.target.value);
	};

	function handleChange(value: Array<number>) {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_TASKS_SUBORDINATES,
			(data) => {
				const dataMessage = data as ResponseMessage<Array<Task>>;
				if (dataMessage.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				setSubbordinatesTasksState(dataMessage.data);
			}
		);
		ConnectionManager.getInstance().emit(
			RequestType.GET_TASKS_SUBORDINATES,
			value,
			accState.session
		);
	}
	// if (myTaskState.length === 0) {
	// 	return <Empty style={{ paddingTop: "10%" }} />;
	// }

	return (
		<div>
			<Select
				mode="multiple"
				style={{ width: "30%" }}
				onChange={handleChange}
				tokenSeparators={[","]}
				showSearch
			>
				{subbordinatesState.map((user) => {
					return (
						<Option key={user.id} value={user.id}>
							{user.secondName + " " + user.middleName + " " + user.firstName}
						</Option>
					);
				})}
			</Select>

			{subbordinatesTasksState.length === 0 ? (
				<Empty style={{ paddingTop: "10%" }} />
			) : (
				<div>
					<Radio.Group
						defaultValue={Type.WEEK}
						size="small"
						style={{ marginTop: 16 }}
						onChange={onRadioChange}
					>
						<Radio.Button value={Type.WEEK}>Тиждень</Radio.Button>
						<Radio.Button value={Type.MONTH}>Місяць</Radio.Button>
						<Radio.Button value={Type.HALF_YEAR}>Півріччя</Radio.Button>
					</Radio.Group>
					<Calendar
						type={calendarTypeState}
						tasks={subbordinatesTasksState}
					></Calendar>
				</div>
			)}
		</div>
	);
};
