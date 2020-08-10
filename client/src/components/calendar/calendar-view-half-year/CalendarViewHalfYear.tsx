import React from "react";
import { Task, TaskPriority, TaskStatus } from "../../../types/task";
import { Typography, Empty, Col, Row, Button } from "antd";
import Timeline, {
	TimelineHeaders,
	DateHeader,
	SidebarHeader,
	TodayMarker,
	CustomMarker,
} from "react-calendar-timeline";
import "react-calendar-timeline/lib/Timeline.css";
import { ConnectionManager } from "../../../managers/connetion/connectionManager";
import {
	RequestType,
	ResponseMessage,
	ResponseCode,
} from "../../../types/requests";
import Store from "../../../app/store";
import { User } from "../../../types/user";
import { addMonths, addDays } from "date-fns";
import { TaskDrawer, TaskDrawerProps } from "../../task/TaskDrawer";
import {
	formatDateForDisplayTasks,
	formatDateTaskForDisplay,
	ifTaskBetweenDates,
} from "../../../helpers/taskHelper";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface TimeLineItem {
	id: number;
	group: number;
	title: string;
	start_time: Date;
	end_time: Date;
	canMove: boolean;
	canResize: boolean;
	canChangeGroup: boolean;
	data: any;
	itemProps?: any;
}

export class CalendarViewHalfYear extends React.Component<
	{
		tasks: Array<Task>;
	},
	{
		taskDrawer: TaskDrawerProps;
		start: Date;
		end: Date;
	}
> {
	getStartEndHalfOfYear(): Date[] {
		const date = new Date();
		date.setDate(1);
		date.setHours(0);

		if (date.getMonth() < 6) {
			const startYear = new Date(date.getFullYear(), 0, 1, 0, 0, 0, 1);
			return [startYear, addMonths(startYear, 4)];
		} else {
			const halfYear = new Date(date.getFullYear(), 6, 1, 0, 0, 0, 1);
			return [halfYear, addMonths(halfYear, 5)];
		}

		return [addMonths(date, -3), addMonths(date, 3)];
	}
	ifTaskInDate(date: Date, task: Task): boolean {
		const one = date <= task.endDate;
		const two = date >= task.startDate;
		const result: boolean = one && two;
		return result;
	}

	getCurrDateDays() {
		const currDate = new Date();

		return new Date(
			currDate.getFullYear(),
			currDate.getMonth(),
			currDate.getDate()
		);
	}

	getNameOfMonth(dateStr: string | undefined) {
		if (dateStr !== undefined) {
			const date = new Date(dateStr);
			return date.toLocaleString("uk", { month: "long" });
		}
		return "undefined";
	}

	onItemClicked(item: TimeLineItem) {
		const taskData = item.data as Task;

		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_USERS_INFO,
			(data) => {
				const dataMessage = data as ResponseMessage<Array<User>>;
				if (dataMessage.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				let executer = dataMessage.data[0];
				let author = dataMessage.data[1];
				if (
					dataMessage.data[0].id === taskData.authorId &&
					executer.id !== author.id
				) {
					executer = dataMessage.data[1];
					author = dataMessage.data[0];
				}

				this.setState({
					taskDrawer: {
						...this.state.taskDrawer,
						executer: executer,
						author: author,
					},
				});
			}
		);

		ConnectionManager.getInstance().emit(
			RequestType.GET_USERS_INFO,
			[taskData.executerId, taskData.authorId],
			Store.getState().account.session
		);

		this.setState({
			taskDrawer: {
				visible: true,
				task: taskData,
				onClose: this.onItemDrawerClose.bind(this),
			},
		});
	}

	onItemDrawerClose() {
		this.setState({
			taskDrawer: {
				visible: false,
				onClose: this.onItemDrawerClose.bind(this),
			},
		});
	}

	generateCustomsMarkers(start: Date, end: Date) {
		let markers: JSX.Element[] = [];
		let currDate: Date = new Date(start);
		markers.push(
			<CustomMarker date={currDate}>
				{({ styles, date }) => {
					styles.backgroundColor = "#BBBBBB";
					return <div style={styles} />;
				}}
			</CustomMarker>
		);
		while (currDate < end) {
			currDate = addDays(currDate, 1);

			let bgColor = "#bfbfbf";
			let width = "1px";
			if (currDate.getDate() === 1) {
				bgColor = "#1f1f1f";
				width = "2px";
			}

			markers.push(
				<CustomMarker date={currDate}>
					{({ styles, date }) => {
						styles.backgroundColor = bgColor;
						styles.width = width;
						return <div style={styles}></div>;
					}}
				</CustomMarker>
			);
		}
		return markers;
	}

	onLeftArrowClick() {
		this.setState(({ start, end }, props: any) => ({
			start: addMonths(start, -6),
			end: addMonths(end, -6),
		}));
	}

	onRightArrowClick() {
		this.setState(({ start, end }, props: any) => ({
			start: addMonths(start, 6),
			end: addMonths(end, 6),
		}));
	}

	componentWillMount() {
		const [start, end] = this.getStartEndHalfOfYear();
		this.setState({
			taskDrawer: {
				visible: false,
				onClose: this.onItemDrawerClose.bind(this),
			},
			start: start,
			end: end,
		});
	}

	render() {
		console.log(this.state);

		if (this.state === null) return <div></div>;

		//const [start, end] = this.getStartEndHalfOfYear();
		console.log("Months: ", this.state.start, this.state.end);

		const items: TimeLineItem[] = this.props.tasks
			.filter((item) => {
				return (
					item.status !== TaskStatus.COMPLITED &&
					ifTaskBetweenDates(this.state.start, this.state.end, item)
				);
			})
			.map((task) => {
				const item: TimeLineItem = {
					id: task.id,
					group: task.id,
					title: task.title,
					...formatDateTaskForDisplay(task),
					canMove: true,
					canResize: false,
					canChangeGroup: false,
					data: {
						...task,
					},
				};
				const backgroundColor =
					task.priority === TaskPriority.RED
						? "#ff4d4f"
						: task.priority === TaskPriority.YELLOW
						? "#ffec3d"
						: "#52c41a";
				const textColor =
					task.priority === TaskPriority.YELLOW ? "#262626" : "#fafafa";
				item.itemProps = {
					style: {
						backgroundColor: backgroundColor,
						borderRadius: "50px",
						color: textColor,
					},
					onMouseDown: this.onItemClicked.bind(this, item),
				};
				return item;
			});

		const groups = items.map((task) => {
			return { id: task.id, title: task.title };
		});

		return (
			<div>
				<Row>
					<Col flex="33%">
						<Button
							type="primary"
							shape="circle"
							size="small"
							icon={<ArrowLeftOutlined />}
							onClick={this.onLeftArrowClick.bind(this)}
						></Button>
					</Col>
					<Col flex="33%">
						<Text strong>
							{this.state.start.toLocaleString("uk", {
								year: "numeric",
								month: "numeric",
							})}
							-
							{this.state.end.toLocaleString("uk", {
								year: "numeric",
								month: "numeric",
							})}
						</Text>
					</Col>
					<Col flex="33%">
						<Button
							type="primary"
							shape="circle"
							size="small"
							icon={<ArrowRightOutlined />}
							onClick={this.onRightArrowClick.bind(this)}
						></Button>
					</Col>
				</Row>
				{items.length === 0 ? (
					<Empty></Empty>
				) : (
					<Timeline
						groups={groups}
						items={items}
						// minZoom={604800}
						// maxZoom={604800 * 4}
						canMove={false}
						visibleTimeStart={this.state.start}
						visibleTimeEnd={this.state.end}
						// defaultTimeStart={start}
						// defaultTimeEnd={end}
						itemRenderer={({
							item,
							itemContext,
							getItemProps,
							getResizeProps,
						}) => {
							const { left: leftResizeProps } = getResizeProps();
							return (
								<div {...getItemProps(item.itemProps)}>
									{itemContext.useResizeHandle ? (
										<div {...leftResizeProps} />
									) : (
										""
									)}
								</div>
							);
						}}
						groupRenderer={({ group }) => {
							return (
								<div
									style={{
										textAlign: "left",
									}}
								>
									<span
										style={{
											fontSize: 16,
										}}
									>
										{group.title}
									</span>
								</div>
							);
						}}
					>
						<TimelineHeaders className="sticky">
							<SidebarHeader>
								{({ getRootProps }) => {
									const style = getRootProps();
									style.style.backgroundColor = "#1890FF";
									return <div {...style}></div>;
								}}
							</SidebarHeader>
							<DateHeader
								labelFormat="MM"
								style={{
									height: 50,
									fontSize: 15,
									color: "#DFF0FF",
									backgroundColor: "#1890FF",
								}}
								intervalRenderer={(dateHeaderProps) => {
									return (
										<div {...dateHeaderProps?.getIntervalProps()}>
											{this.getNameOfMonth(
												dateHeaderProps?.intervalContext.intervalText
											).toUpperCase()}
										</div>
									);
								}}
							/>
						</TimelineHeaders>
						<TodayMarker interval={2000} date={new Date()}>
							{({ styles, date }) => {
								styles.backgroundColor = "#722ed1";
								return <div style={styles}></div>;
							}}
						</TodayMarker>
						{this.generateCustomsMarkers(this.state.start, this.state.end)}
					</Timeline>
				)}
				<TaskDrawer {...this.state?.taskDrawer}></TaskDrawer>
			</div>
		);
	}
}
