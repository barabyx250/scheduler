import React from "react";
import "./calendar.style.css";
import { Task, TaskPriority } from "../../../types/task";
import { Row, Col, Drawer } from "antd";
import { RowStyle, ColStyle } from "./calendar.view.week.module.style";
import { addDays, format } from "date-fns/fp";
import { TagsFilled } from "@ant-design/icons";
import Timeline, {
	TimelineHeaders,
	DateHeader,
	SidebarHeader,
} from "react-calendar-timeline";
import "react-calendar-timeline/lib/Timeline.css";
import moment from "moment";

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

interface TaskDrawerState {
	visible: boolean;
	title: string;
}

export class CalendarWeek extends React.Component<
	{
		tasks: Array<Task>;
	},
	{
		taskDrawer: TaskDrawerState;
	}
> {
	constructor(props: any) {
		super(props);

		this.setState({
			taskDrawer: {
				visible: false,
				title: "",
			},
		});
	}
	startOfWeek(date: Date) {
		var diff = date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1);

		return new Date(date.setDate(diff));
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

	formatDateHeaderByDateString(date: string | undefined) {
		var days = [
			"Неділя",
			"Понеділок",
			"Вівторок",
			"Середа",
			"Четвер",
			"П'ятниця",
			"Субота",
		];

		if (date !== undefined) {
			const dateObject = new Date(date);
			const monthNum = dateObject.getMonth() + 1;
			const day: string =
				dateObject.getDate() < 10
					? "0" + dateObject.getDate().toString()
					: dateObject.getDate().toString();
			const month: string =
				monthNum < 10 ? "0" + monthNum.toString() : monthNum.toString();
			const year: string = dateObject.getFullYear().toString().substr(0, 2);

			return `${day}.${month}.${year}, ${days[dateObject.getDay()]}`;
		}

		return "";
	}

	formatDate(dateObject: Date) {
		const dayNum = dateObject.getDate();
		const monthNum = dateObject.getMonth() + 1;
		const yearNum = dateObject.getFullYear();
		const day: string =
			dayNum < 10 ? "0" + dayNum.toString() : dayNum.toString();
		const month: string =
			monthNum < 10 ? "0" + monthNum.toString() : monthNum.toString();
		const year: string = yearNum.toString().substr(0, 2);

		const lDate = new Date(`${month}.${day}.${year}`);
		return lDate;
	}

	onItemClicked(item: TimeLineItem) {
		console.log(item);
		this.setState({
			taskDrawer: {
				title: item.title,
				visible: true,
			},
		});
	}

	onItemDrawerClose() {
		this.setState({
			taskDrawer: {
				title: "",
				visible: false,
			},
		});
	}

	render() {
		const groups = this.props.tasks.map((task) => {
			return { id: task.id, title: task.title };
		});
		const currDate = this.getCurrDateDays();
		const items: TimeLineItem[] = this.props.tasks.map((task) => {
			const item: TimeLineItem = {
				id: task.id,
				group: task.id,
				title: task.title,
				start_time: this.formatDate(new Date(task.startDate)),
				end_time: this.formatDate(new Date(task.endDate)),
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
			item.itemProps = {
				style: { backgroundColor: backgroundColor, borderRadius: "50px" },
				onMouseDown: this.onItemClicked.bind(this, item),
			};
			return item;
		});
		console.log(items);

		const start = this.startOfWeek(currDate);
		return (
			<div>
				Rendered by react!
				<Timeline
					groups={groups}
					items={items}
					minZoom={86400000}
					canMove={false}
					visibleTimeStart={start}
					visibleTimeEnd={addDays(8, start)}
					itemRenderer={({
						item,
						itemContext,
						getItemProps,
						getResizeProps,
					}) => {
						const {
							left: leftResizeProps,
							right: rightResizeProps,
						} = getResizeProps();
						return (
							<div {...getItemProps(item.itemProps)}>
								{itemContext.useResizeHandle ? (
									<div {...leftResizeProps} />
								) : (
									""
								)}

								<div
									className="rct-item-content"
									style={{ maxHeight: `${itemContext.dimensions.height}` }}
								>
									{itemContext.title}
								</div>

								{itemContext.useResizeHandle ? (
									<div {...rightResizeProps} />
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
							labelFormat="MM.DD.YY"
							style={{
								height: 50,
								fontSize: 15,
								color: "#DFF0FF",
								backgroundColor: "#1890FF",
							}}
							intervalRenderer={(dateHeaderProps) => {
								return (
									<div {...dateHeaderProps?.getIntervalProps()}>
										{this.formatDateHeaderByDateString(
											dateHeaderProps?.intervalContext.intervalText
										)}
									</div>
								);
							}}
						/>
					</TimelineHeaders>
				</Timeline>
				<Drawer
					title={this.state?.taskDrawer.title}
					placement="right"
					closable={false}
					visible={this.state?.taskDrawer.visible}
					onClose={this.onItemDrawerClose.bind(this)}
				></Drawer>
			</div>
		);
	}
}
