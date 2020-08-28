import React from "react";
import { Drawer, Typography, Button, Modal, Input, Alert } from "antd";
import Title from "antd/lib/typography/Title";
import { User } from "../../types/user";
import { Task, TaskStatus, TaskReport } from "../../types/task";
import { CheckOutlined } from "@ant-design/icons";
import { ConnectionManager } from "../../managers/connetion/connectionManager";
import {
	RequestType,
	ResponseMessage,
	ResponseCode,
} from "../../types/requests";
import Store from "../../app/store";
import { ACCOUNT_STORAGE_KEY } from "../../types/constants";

const { Text, Paragraph } = Typography;

export interface TaskDrawerProps {
	visible: boolean;
	task?: Task;
	executer?: User;
	author?: User;
	onClose: () => void;
}

export class TaskDrawer extends React.Component<
	TaskDrawerProps,
	{
		showModalReportError: boolean;
	}
> {
	componentWillMount() {
		this.setState({ showModalReportError: false });
	}

	formatDate(date: Date | undefined) {
		if (date !== undefined) {
			let newDate = new Date(date);
			return newDate.toLocaleDateString();
		}

		return "";
	}

	onTaskFinish() {
		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.FINISH_TASK,
			(data) => {
				console.log(data);
				const dataMessage = data as ResponseMessage<Task>;
				if (dataMessage.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
			}
		);

		const report: TaskReport = {
			id: 0,
			content: "",
			dateCreation: new Date(),
		};

		if (this.props.task) {
			report.id = this.props.task?.report.id;
		}

		const onReportTextChange: (
			event: React.ChangeEvent<HTMLTextAreaElement>
		) => void = ({ target: { value } }) => {
			if (value !== "") {
				report.content = value;
			}
		};

		Modal.confirm({
			title: "Звіт про завершення завдання",
			centered: true,
			content: (
				<div>
					<Input.TextArea
						placeholder="Введіть ваш звіт"
						onChange={onReportTextChange.bind(this)}
					></Input.TextArea>
				</div>
			),
			onOk: () => {
				if (this.props.task !== undefined) {
					ConnectionManager.getInstance().emit(
						RequestType.FINISH_TASK,
						{ id: this.props.task.id, report: report },
						Store.getState().account.session
					);
				}
			},
		});
	}

	render() {
		return (
			<Drawer
				title={this.props?.task?.title}
				placement="right"
				closable={false}
				visible={this.props?.visible}
				onClose={this.props.onClose}
				width="40%"
			>
				<div>
					<Title level={2}>{this.props?.task?.title}</Title>
					{this.props.task?.isPrivate && (
						<Text>ПРИВАТНЕ ЗАВДАННЯ (БАЧИТЕ ТІЛЬКИ ВИ)</Text>
					)}
					<Paragraph ellipsis={{ rows: 2, expandable: true, symbol: "далі" }}>
						<Text strong>Опис: </Text>
						{this.props?.task?.description}
					</Paragraph>
					<p />
					<Text strong>Поставив: </Text>{" "}
					<Text>{User.GetUserPIB(this.props?.author)}</Text>
					<p />
					<Text strong>Виконує: </Text>{" "}
					<Text>{User.GetUserPIB(this.props?.executer)}</Text>
					<p />
					<Text strong>Терміни: </Text>
					<Text>
						{this.formatDate(this.props.task?.startDate)} -{" "}
						{this.props.task !== undefined &&
							this.formatDate(new Date(this.props.task?.endDate))}
					</Text>
					<p />
					{Store.getState().account.id === this.props.executer?.id && (
						<Button
							type="primary"
							icon={<CheckOutlined />}
							onClick={this.onTaskFinish.bind(this)}
						>
							Звітувати про виконання
						</Button>
					)}
				</div>
			</Drawer>
		);
	}
}
