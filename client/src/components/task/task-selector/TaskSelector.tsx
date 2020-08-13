import { Table, Button, Tag, Space, Modal, Typography } from "antd";
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
import { title } from "process";

const { Text, Link } = Typography;

const columns = [
	{
		title: "Назва",
		dataIndex: "title",
		render: (title: string) => <a>{title}</a>,
	},
	{
		title: "Пріоритет",
		dataIndex: "priority",
		render: (priority: TaskPriority) => {
			const text =
				priority === TaskPriority.USUAL
					? "Звичайний"
					: priority === TaskPriority.YELLOW
					? "Важливий"
					: "Терміновий";
			const color =
				priority === TaskPriority.RED
					? "#ff4d4f"
					: priority === TaskPriority.YELLOW
					? "#ffec3d"
					: "#52c41a";
			const textColor =
				priority === TaskPriority.YELLOW ? "#262626" : "#fafafa";
			return (
				<>
					<Tag color={color} style={{ color: textColor }}>
						{text.toUpperCase()}
					</Tag>
				</>
			);
		},
	},
	{
		title: "Хто поставив",
		dataIndex: "author",
	},
	{
		title: "Хто виконав",
		dataIndex: "executer",
	},
	{
		title: "Дата завершення",
		dataIndex: "dateComplited",
		sorter: {
			compare: (a: TaskTableData, b: TaskTableData) =>
				a.dateComplited.getTime() - b.dateComplited.getTime(),
			multiple: 1,
		},
		render: (date: Date) => (
			<>
				{date.toLocaleDateString("uk", {
					year: "numeric",
					month: "long",
					day: "numeric",
					hour: "numeric",
					minute: "numeric",
				})}
			</>
		),
	},
	{
		title: "Чи вже виконана",
		dataIndex: "isComplited",
	},
	{
		title: "Інфо",
		key: "action",
		render: (text: any, record: TaskTableData) => {
			return (
				<Space size="middle">
					<Button
						onClick={() => {
							Modal.info({
								title: "Звіт",
								content: (
									<>
										<Link target="_blank">
											Звіт від: {User.GetUserPIB(record.taskExecuter)}
										</Link>{" "}
										<br></br>
										{record.task.report.content}
									</>
								),
							});
						}}
						type="link"
					>
						Звіт
					</Button>
					<Button
						onClick={() => {
							Modal.info({
								title: "Опис",
								content: <>{record.task.description}</>,
							});
						}}
						type="link"
					>
						Опис
					</Button>
				</Space>
			);
		},
	},
];

interface TaskTableData {
	title: string;
	priority: TaskPriority;
	dateComplited: Date;
	executer: string;
	author: string;
	isComplited: string;
	task: Task;
	taskExecuter?: User;
	taskAuthor?: User;
}

interface TaskSelectorProps {
	tasks: Task[];
}

export const TaskSelector: React.FC<TaskSelectorProps> = (
	props: TaskSelectorProps
) => {
	const accState = useSelector(selectAccount);
	const [tableData, setTableData] = useState<TaskTableData[]>([]);
	useEffect(() => {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_USERS_INFO,
			(data) => {
				const dataMessage = data as ResponseMessage<Array<User>>;
				if (dataMessage.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				console.log("GOT USERS", data);
				const getUserPIB = (id: number) => {
					const user = dataMessage.data.find((u) => u.id === id);
					return User.GetUserPIB(user);
				};

				setTableData(
					props.tasks.map((element) => {
						return {
							title: element.title,
							author: getUserPIB(element.authorId),
							executer: getUserPIB(element.executerId),
							dateComplited: new Date(element.dateComplited),
							isComplited:
								element.status === TaskStatus.COMPLITED ? "Так" : "Ні",
							priority: element.priority,
							task: element,
							taskAuthor: dataMessage.data.find(
								(u) => u.id === element.authorId
							),
							taskExecuter: dataMessage.data.find(
								(u) => u.id === element.executerId
							),
						};
					})
				);
			}
		);

		const userId: number[] = [];
		props.tasks.forEach((element) => {
			userId.push(element.executerId);
			userId.push(element.authorId);
		});

		ConnectionManager.getInstance().emit(
			RequestType.GET_USERS_INFO,
			userId.filter(function (elem, pos, arr) {
				return arr.indexOf(elem) === pos;
			}),
			accState.session
		);
	}, []);

	return (
		<div>
			<Table columns={columns} dataSource={tableData} />
		</div>
	);
};
