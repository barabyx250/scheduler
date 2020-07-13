import React, { useState, useEffect } from "react";
import {
	Form,
	Input,
	Button,
	Radio,
	Select,
	DatePicker,
	ConfigProvider,
	Modal,
	Result,
} from "antd";
import { Store } from "antd/lib/form/interface";
import FormLocale from "antd/es/locale/uk_UA";
import DatePickerLocal from "antd/es/date-picker/locale/uk_UA";
import * as moment from "moment";
import "moment/locale/uk";
import { Task, TaskPriority, TaskPeriod } from "../../types/task";
import { ConnectionManager } from "../../managers/connetion/connectionManager";
import {
	ResponseMessage,
	ResponseCode,
	RequestType,
} from "../../types/requests";
import { useSelector } from "react-redux";
import { selectAccount } from "../../redux/slicers/accountSlice";
import { addDays } from "date-fns";
import { User } from "../../types/user";

const { TextArea } = Input;
const { RangePicker } = DatePicker;

moment.locale("uk");

interface ModalProps {
	visible: boolean;
	title: string;
	content: string;
}

interface Props {}
export const CreateTask: React.FC<Props> = () => {
	//////HOOKS
	const accState = useSelector(selectAccount);
	const [modalState, setModalState] = useState<ModalProps>({
		visible: false,
		title: "",
		content: "",
	});
	const [subordinatesState, setSubordinatesState] = useState<User[]>([
		accState,
	]);
	const [form] = Form.useForm();

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
				setSubordinatesState(dataMessage.data);
			}
		);

		ConnectionManager.getInstance().emit(
			RequestType.GET_MY_SUBORDINATE,
			{},
			accState.session
		);
	}, []);
	//////VARIABLES
	const layout = {
		labelCol: { span: 8 },
		wrapperCol: { span: 16 },
	};
	const usersExecuters = subordinatesState.map((u) => {
		if (u.id === accState.id) {
			return { id: accState.id, name: "Я" };
		}
		return {
			id: u.id,
			name: u.secondName + " " + u.middleName + " " + u.firstName,
		};
	});
	const taskPriorities = [
		{ value: TaskPriority.USUAL, name: "Звичайний" },
		{ value: TaskPriority.YELLOW, name: "Важливий" },
		{ value: TaskPriority.RED, name: "Терміновий" },
	];
	const taskPeriod = [
		{ value: TaskPeriod.ONCE, name: "Одноразова задача" },
		{ value: TaskPeriod.MONTH, name: "Щомісяца" },
		{ value: TaskPeriod.HALFYEAR, name: "Кожні півроку" },
		{ value: TaskPeriod.YEAR, name: "Щорічна задача" },
	];

	//////CALLBACKS
	const onFinish = (data: Store) => {
		console.log(data);
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.CREATE_TASK,
			(data) => {
				console.log(data);
				const dataMessage = data as ResponseMessage<Task>;
				if (dataMessage.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				setModalState({
					visible: true,
					title: "Система",
					content: "Задача була успішно створена",
				});
				form.resetFields();
			}
		);
		const task: Task = {
			id: 0,
			authorId: accState.id,
			description: data.taskDescription,
			title: data.taskName,
			executerId: data.taskExecutor,
			period: data.period,
			priority: data.priority,
			startDate: data.taskDuration[0].toDate(),
			endDate: addDays(data.taskDuration[1].toDate(), 1),
		};

		ConnectionManager.getInstance().emit(
			RequestType.CREATE_TASK,
			task,
			accState.session
		);
	};

	const handleModalOk = () => {
		setModalState({ visible: false, content: "", title: "" });
	};

	return (
		<div
			style={{
				paddingTop: "2%",
				width: "100%",
				maxWidth: "1000px",
				margin: 0,
				textAlign: "center",
				display: "inline-block",
			}}
		>
			<ConfigProvider locale={FormLocale}>
				<Form
					{...layout}
					form={form}
					labelCol={{ span: 4 }}
					wrapperCol={{ span: 14 }}
					layout="horizontal"
					initialValues={{ size: "middle" }}
					onFinish={onFinish}
				>
					<Form.Item
						label="Назва задачі"
						name="taskName"
						rules={[
							{
								required: true,
								message: "Будь-ласка, введіть назву задачі!",
							},
						]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						label="Опис задачі"
						name="taskDescription"
						rules={[
							{ required: true, message: "Будь-ласка, введіть опис задачі!" },
						]}
					>
						<TextArea rows={4} />
					</Form.Item>
					<Form.Item
						label="Виконавець"
						name="taskExecutor"
						rules={[
							{ required: true, message: "Будь-ласка, оберіть виконавця!" },
						]}
					>
						<Select>
							{usersExecuters.map((user) => {
								return (
									<Select.Option value={user.id}>{user.name}</Select.Option>
								);
							})}
						</Select>
					</Form.Item>
					<Form.Item
						label="Термін виконання"
						name="taskDuration"
						rules={[
							{
								required: true,
								message: "Будь-ласка, оберіть термін виконання!",
							},
						]}
					>
						<RangePicker
							picker="date"
							locale={DatePickerLocal}
							style={{
								display: "flex",
								flexDirection: "row",
								justifyContent: "flex-start",
								width: "50%",
							}}
						/>
					</Form.Item>

					<Form.Item
						label="Періодичність"
						name="period"
						rules={[
							{
								required: true,
								message: "Будь-ласка, оберіть періодичність!",
							},
						]}
					>
						<Radio.Group
							buttonStyle="solid"
							style={{
								display: "flex",
								flexDirection: "row",
								justifyContent: "flex-start",
								width: "auto",
							}}
						>
							{taskPeriod.map((period) => {
								return (
									<Radio.Button value={period.value}>
										{period.name}
									</Radio.Button>
								);
							})}
						</Radio.Group>
					</Form.Item>
					<Form.Item
						label="Пріоритетність"
						name="priority"
						rules={[
							{
								required: true,
								message: "Будь-ласка, оберіть пріоритет виконання!",
							},
						]}
					>
						<Radio.Group
							buttonStyle="solid"
							style={{
								display: "flex",
								flexDirection: "row",
								justifyContent: "flex-start",
								width: "auto",
							}}
						>
							{taskPriorities.map((tp) => {
								return <Radio.Button value={tp.value}>{tp.name}</Radio.Button>;
							})}
						</Radio.Group>
					</Form.Item>
					<Form.Item
						style={{
							display: "flex",
							flexDirection: "column",
							justifyContent: "center",
							alignItems: "center",
							width: "auto",
						}}
					>
						<Button
							type="primary"
							htmlType="submit"
							style={{
								display: "flex",
								flexDirection: "column",
								justifyContent: "center",
								alignItems: "center",
								width: "auto",
							}}
						>
							СТВОРИТИ
						</Button>
					</Form.Item>
				</Form>
				<Modal
					title={modalState.title}
					visible={modalState.visible}
					onOk={handleModalOk}
					footer={[
						<Button key="submit" type="primary" onClick={handleModalOk}>
							OK
						</Button>,
					]}
				>
					<Result status="success" title={modalState.content} />
				</Modal>
			</ConfigProvider>
		</div>
	);
};
