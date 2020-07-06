import React from "react";
import { Drawer, Typography } from "antd";
import Title from "antd/lib/typography/Title";
import { User } from "../../types/user";
import { Task } from "../../types/task";
import { addDays } from "date-fns/esm";

const { Text, Paragraph } = Typography;

export interface TaskDrawerProps {
	visible: boolean;
	task?: Task;
	executer?: User;
	author?: User;
	onClose: () => void;
}

export class TaskDrawer extends React.Component<TaskDrawerProps> {
	formatDate(date: Date | undefined) {
		if (date !== undefined) {
			let newDate = new Date(date);
			return newDate.toLocaleDateString();
		}

		return "";
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
					<Paragraph ellipsis={{ rows: 2, expandable: true, symbol: "далі" }}>
						<Text strong>Опис: </Text>
						{this.props?.task?.description}
					</Paragraph>
					<p />
					<Text strong>Поставив: </Text>{" "}
					<Text>{this.props?.author?.login}</Text>
					<p />
					<Text strong>Терміни: </Text>
					<Text>
						{this.formatDate(this.props.task?.startDate)} -{" "}
						{this.props.task !== undefined &&
							this.formatDate(addDays(new Date(this.props.task?.endDate), -1))}
					</Text>
				</div>
			</Drawer>
		);
	}
}
