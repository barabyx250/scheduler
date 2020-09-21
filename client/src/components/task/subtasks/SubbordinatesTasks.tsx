import React, { useEffect, useState } from "react";
import { Task } from "../../../types/task";
import { Type, Calendar } from "../../calendar/Calendar";
import { ConnectionManager } from "../../../managers/connetion/connectionManager";
import {
	RequestType,
	ResponseMessage,
	ResponseCode,
} from "../../../types/requests";
import { useSelector } from "react-redux";
import { selectTaskDateInterval } from "../../../redux/slicers/taskSlice";
import { selectAccount } from "../../../redux/slicers/accountSlice";
import { Radio, Select, Typography } from "antd";
import { RadioChangeEvent } from "antd/lib/radio";
import { User, UserRole } from "../../../types/user";
import { UserPosition } from "../../../types/userPosition";
import { CreateEmptyTaskFilter } from "../../../types/taskFilter";

export const SubbordinatesTasks: React.FC = () => {
	const accState = useSelector(selectAccount);
	const globalTaskState = useSelector(selectTaskDateInterval);
	const [calendarTypeState, setCalendarTypeState] = useState(Type.WEEK);
	const [subbordinatesState, setSubbordinatesState] = useState<User[]>([]);
	const [subbordinatesTasksState, setSubbordinatesTasksState] = useState<
		Task[]
	>([]);
	const [selectedSubbordinateIds, setSelectedSubbordinateIds] = useState<
		number[]
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
					dataMessage.data.filter(
						(u) => u.id !== accState.id && u.role !== UserRole.ADMIN
					)
				);
			}
		);

		ConnectionManager.getInstance().emit(
			RequestType.GET_MY_SUBORDINATE,
			{},
			accState.session
		);
	}, []);

	useEffect(() => {
		loadUsersTasks(selectedSubbordinateIds);
	}, [globalTaskState]);

	const onRadioChange = (e: RadioChangeEvent) => {
		setCalendarTypeState(e.target.value);
	};

	function loadUsersTasks(value: Array<number>) {
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
		const filters = CreateEmptyTaskFilter();
		filters.betweenDates = {
			start: globalTaskState.from,
			end: globalTaskState.to,
		};
		console.log("loadUsersTasks", filters);

		ConnectionManager.getInstance().emit(
			RequestType.GET_TASKS_SUBORDINATES,
			{ subsId: value, filterTask: filters },
			accState.session
		);
	}

	function handleChange(value: Array<number>) {
		loadUsersTasks(value);
		setSelectedSubbordinateIds(value);
	}

	const usersGroupExecuters: Map<UserPosition, Array<User>> = new Map<
		UserPosition,
		Array<User>
	>();

	subbordinatesState.forEach((u) => {
		const isContain =
			Array.from(usersGroupExecuters).findIndex(
				(value) => value[0].pos_id === u.position.pos_id
			) >= 0;

		if (isContain) {
			usersGroupExecuters.forEach((value, key) => {
				if (key.pos_id === u.position.pos_id) {
					value.push(u);
				}
			});
		} else {
			usersGroupExecuters.set(u.position, [u]);
		}
	});

	return (
		<div>
			<Typography.Title level={3}>Оберіть підлеглих</Typography.Title>
			<Select
				mode="multiple"
				style={{ width: "30%" }}
				onChange={handleChange}
				tokenSeparators={[","]}
				showSearch
				value={selectedSubbordinateIds}
			>
				{Array.from(usersGroupExecuters).map(
					(value: [UserPosition, User[]]) => {
						return (
							<Select.OptGroup label={value[0].name}>
								{value[1].map((v) => {
									if (v.id === accState.id) {
										return <Select.Option value={v.id}>Я</Select.Option>;
									}

									return (
										<Select.Option value={v.id}>
											{User.GetUserPIB(v)}
										</Select.Option>
									);
								})}
							</Select.OptGroup>
						);
					}
				)}
			</Select>

			{/* {subbordinatesTasksState.length === 0 ? (
				<Empty style={{ paddingTop: "10%" }} />
			) : ( */}
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
			{/* )} */}
		</div>
	);
};
