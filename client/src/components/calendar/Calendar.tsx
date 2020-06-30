import { Alert } from "antd";
import React from "react";
import styles from "./error.module.css";
import { Task } from "../../types/task";
import { CalendarWeek } from "./calendar-view-week/CalendarViewWeek";

export enum Type {
	WEEK,
	MONTH,
	HALF_YEAR,
}

export class Calendar extends React.Component<{
	type: Type;
	tasks: Array<Task>;
}> {
	render() {
		let calendar = <CalendarWeek tasks={this.props.tasks}></CalendarWeek>;

		if (this.props.type === Type.HALF_YEAR) {
		} else if (this.props.type === Type.MONTH) {
		}

		return calendar;
	}
}
