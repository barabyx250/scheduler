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
	Space,
	Typography,
	Divider,
} from "antd";
import { Store } from "antd/lib/form/interface";
import FormLocale from "antd/es/locale/uk_UA";
import DatePickerLocal from "antd/es/date-picker/locale/uk_UA";
import moment from "moment";
import "moment/locale/uk";
import {
	Task,
	TaskPriority,
	TaskPeriod,
	TaskStatus,
} from "../../../types/task";
import { ConnectionManager } from "../../../managers/connetion/connectionManager";
import {
	ResponseMessage,
	ResponseCode,
	RequestType,
} from "../../../types/requests";
import { useSelector } from "react-redux";
import { selectAccount } from "../../../redux/slicers/accountSlice";
import { User } from "../../../types/user";
import Title from "antd/lib/typography/Title";
import { CSSTransition, SwitchTransition } from "react-transition-group";

import "./animations.css";

const { TextArea } = Input;
const { RangePicker } = DatePicker;

moment.locale("uk");

interface ModalProps {
	visible: boolean;
	title: string;
	content: string;
}

interface Props {}
export const EditTask: React.FC<Props> = () => {
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
	const [tasksState, setTasksState] = useState<Task[]>([]);
	const [currentTask, setCurrentTask] = useState<Task | undefined>(undefined);
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

		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_MY_PARENT_TASK,
			(data) => {
				const dataMessage = data as ResponseMessage<Array<Task>>;
				if (dataMessage.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				console.log(RequestType.GET_MY_PARENT_TASK, data);
				setTasksState(dataMessage.data);
			}
		);

		ConnectionManager.getInstance().emit(
			RequestType.GET_MY_PARENT_TASK,
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
		let currTask = Object.assign({}, currentTask);
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.UPDATE_TASK,
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
					content: "Задача була успішно обновлена",
				});
			}
		);
		const task: Task = {
			id: currTask.id,
			authorId: currTask.authorId,
			description: data.description,
			title: data.title,
			executerId: data.executer,
			period: data.period,
			priority: data.priority,
			startDate: data.termin[0].toDate(),
			endDate: data.termin[1].toDate(),
			status: currTask.status,
			dateComplited: currTask.dateComplited,
			periodParentId: currTask.periodParentId,
			report: currTask.report,
		};

		ConnectionManager.getInstance().emit(
			RequestType.UPDATE_TASK,
			task,
			accState.session
		);
	};

	const handleModalOk = () => {
		setModalState({ visible: false, content: "", title: "" });
	};

	const onTaskSelect = (t_id: number) => {
		const task = tasksState.find((t) => t.id === t_id);
		const store: Store = {
			description: task?.description,
			executer: task?.executerId,
			period: task?.period,
			priority: task?.priority,
			termin: [moment(task?.startDate), moment(task?.endDate)],
			title: task?.title,
		};
		form.setFieldsValue(store);
		setCurrentTask(task);
	};

	const onTitleChange = (value: any) => {};

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
			<Space direction="vertical" style={{ width: "100%" }} size="small">
				<Typography.Text>
					Оберіть задачу, яку бажаєте відреагувати
				</Typography.Text>
				<Select
					style={{
						width: "30%",
					}}
					onSelect={onTaskSelect}
				>
					{tasksState.map((task) => {
						return <Select.Option value={task.id}>{task.title}</Select.Option>;
					})}
				</Select>
				<Divider style={{ borderColor: "#8c8c8c" }}></Divider>
				<SwitchTransition mode="out-in">
					<CSSTransition
						key={currentTask ? currentTask?.id : -1}
						timeout={400}
						classNames="task"
						unmountOnExit
						addEndListener={(node, done) => {
							node.addEventListener("transitionend", done, false);
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
								style={{ visibility: currentTask ? "visible" : "hidden" }}
							>
								<Form.Item label="Назва задачі" name="title">
									<Input onChange={onTitleChange} />
								</Form.Item>
								<Form.Item label="Опис задачі" name="description">
									<TextArea rows={4} />
								</Form.Item>
								<Form.Item label="Виконавець" name="executer">
									<Select>
										{usersExecuters.map((user) => {
											return (
												<Select.Option value={user.id}>
													{user.name}
												</Select.Option>
											);
										})}
									</Select>
								</Form.Item>
								<Form.Item label="Термін виконання" name="termin">
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

								<Form.Item label="Періодичність" name="period">
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
								<Form.Item label="Пріоритетність" name="priority">
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
											return (
												<Radio.Button value={tp.value}>{tp.name}</Radio.Button>
											);
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
					</CSSTransition>
				</SwitchTransition>
			</Space>
		</div>
	);
};
