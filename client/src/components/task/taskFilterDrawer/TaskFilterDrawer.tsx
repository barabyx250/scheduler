import React, { useState, useEffect } from "react";
import {
	Drawer,
	Typography,
	Button,
	Input,
	Select,
	Descriptions,
	DatePicker,
	Row,
	Switch,
} from "antd";
import { User } from "../../../types/user";
import { TaskStatus } from "../../../types/task";
import { ConnectionManager } from "../../../managers/connetion/connectionManager";
import {
	RequestType,
	ResponseMessage,
	ResponseCode,
} from "../../../types/requests";
import { TaskFilters, CreateEmptyTaskFilter } from "../../../types/taskFilter";
import { useSelector } from "react-redux";
import { selectAccount } from "../../../redux/slicers/accountSlice";
import DatePickerLocal from "antd/es/date-picker/locale/uk_UA";
import * as moment from "moment";

import { RangeValue } from "../../../../node_modules/rc-picker/lib/interface";

const { Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

moment.locale("uk");

export interface TaskFilterDrawerProps {
	onTaskFilter: Function;
	visible: boolean;
	onClose: () => void;
	constFilters?: TaskFilters;
}

export const TaskFilterDrawer: React.FC<TaskFilterDrawerProps> = (
	props: TaskFilterDrawerProps
) => {
	const [filters, setFilters] = useState<TaskFilters>(CreateEmptyTaskFilter());
	const [subbordinates, setSubbordinates] = useState<User[]>([]);
	const [chiefs, setChiefs] = useState<User[]>([]);
	const accState = useSelector(selectAccount);

	//if (props.constFilters !== undefined) setFilters(props.constFilters);

	const formatDate = (date: Date | undefined) => {
		if (date !== undefined) {
			let newDate = new Date(date);
			return newDate.toLocaleDateString();
		}

		return "";
	};

	useEffect(() => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_MY_SUBORDINATE,
			(data) => {
				const dataMessage = data as ResponseMessage<Array<User>>;
				if (dataMessage.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				console.log(RequestType.GET_MY_SUBORDINATE, data);
				setSubbordinates(dataMessage.data);
			}
		);

		ConnectionManager.getInstance().emit(
			RequestType.GET_MY_SUBORDINATE,
			{},
			accState.session
		);

		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_MY_CHIEF_INFO,
			(data) => {
				const dataMessage = data as ResponseMessage<Array<User>>;
				if (dataMessage.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				console.log(RequestType.GET_MY_CHIEF_INFO, data);
				setChiefs(dataMessage.data);
			}
		);

		ConnectionManager.getInstance().emit(
			RequestType.GET_MY_CHIEF_INFO,
			{},
			accState.session
		);
	}, []);

	const handleChangeAuthors = (value: number[]) => {
		console.log(`selected ${value}`);
		if (value.length > 0) {
			setFilters({
				...filters,
				authorIds: value,
			});
		} else {
			setFilters({
				...filters,
				authorIds: undefined,
			});
		}
	};

	const handleChangeExecuters = (value: number[]) => {
		console.log(`selected ${value}`);
		if (value.length > 0) {
			setFilters({
				...filters,
				executorIds: value,
			});
		} else {
			setFilters({
				...filters,
				executorIds: undefined,
			});
		}
	};

	const handleChangeStatus = (value: TaskStatus) => {
		console.log(`selected ${value}`);

		setFilters({
			...filters,
			status: value,
		});
	};

	const onChangeName: (event: React.ChangeEvent<HTMLInputElement>) => void = ({
		target: { value },
	}) => {
		setFilters({
			...filters,
			nameReg: value === "" ? undefined : value,
		});
	};

	const onChangePrivate: (value: boolean) => void = (value: boolean) => {
		setFilters({
			...filters,
			private: value ? true : undefined,
		});
	};

	const handleChangeDates = (values: RangeValue<moment.Moment>) => {
		console.log(`selected ${values}`);

		if (values !== null && values.length > 1 && values[0] && values[1]) {
			setFilters({
				...filters,
				betweenDates: {
					start: values[0].toDate(),
					end: values[1].toDate(),
				},
			});
		} else {
			setFilters({
				...filters,
				betweenDates: undefined,
			});
		}
	};
	const authors = subbordinates;
	chiefs.forEach((ch) => {
		if (authors.findIndex((au) => au.id === ch.id) < 0) {
			authors.push(ch);
		}
	});

	if (authors.findIndex((u) => u.id === accState.id) < 0) {
		authors.push(accState);
	}

	const executors = authors;
	const taskStatuses = [
		{ value: TaskStatus.COMPLITED, name: "Завершена" },
		{ value: TaskStatus.IN_PROGRESS, name: "В прогрессі" },
	];
	return (
		<Drawer
			title="Пошук завдання"
			placement="right"
			closable={false}
			visible={props?.visible}
			onClose={props.onClose}
			width="40%"
		>
			<div>
				<Descriptions title="Фільтри" bordered>
					<Descriptions.Item label="Назва" span={3}>
						<Input onChange={onChangeName}></Input>
					</Descriptions.Item>
					<Descriptions.Item label="Хто поставив завдання" span={3}>
						<div>
							<Select
								mode="multiple"
								style={{ width: "100%" }}
								onChange={handleChangeAuthors}
								tokenSeparators={[","]}
								showSearch
							>
								{authors.map((user) => {
									return (
										<Option key={user.id} value={user.id}>
											{user.secondName +
												" " +
												user.middleName +
												" " +
												user.firstName}
										</Option>
									);
								})}
							</Select>
						</div>
					</Descriptions.Item>
					<Descriptions.Item label="Кому поставлене завдання" span={3}>
						<div>
							<Select
								mode="multiple"
								style={{ width: "100%" }}
								onChange={handleChangeExecuters}
								tokenSeparators={[","]}
								showSearch
							>
								{executors.map((user) => {
									return (
										<Option key={user.id} value={user.id}>
											{user.secondName +
												" " +
												user.middleName +
												" " +
												user.firstName}
										</Option>
									);
								})}
							</Select>
						</div>
					</Descriptions.Item>
					<Descriptions.Item label="Виконувалися між датами" span={3}>
						<div>
							<RangePicker
								picker="date"
								locale={DatePickerLocal}
								style={{
									display: "flex",
									flexDirection: "row",
									justifyContent: "flex-start",
									width: "100%",
								}}
								onCalendarChange={handleChangeDates}
							/>
						</div>
					</Descriptions.Item>
					<Descriptions.Item label="Статус завдання" span={3}>
						<div>
							<Select
								style={{ width: "100%" }}
								onChange={handleChangeStatus}
								tokenSeparators={[","]}
								showSearch
								allowClear
							>
								{taskStatuses.map((st) => {
									return (
										<Option key={st.value} value={st.value}>
											{st.name}
										</Option>
									);
								})}
							</Select>
						</div>
					</Descriptions.Item>
					<Descriptions.Item label="Приватні завдання" span={3}>
						<div>
							<Switch onChange={onChangePrivate}></Switch>
						</div>
					</Descriptions.Item>
				</Descriptions>
				<br></br>
				<Row justify="center">
					<Button
						type="primary"
						onClick={() => {
							props.onTaskFilter(filters);
							props.onClose();
						}}
					>
						OK
					</Button>
				</Row>
			</div>
		</Drawer>
	);
};
