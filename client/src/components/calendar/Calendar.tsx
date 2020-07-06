import React from "react";
import { Task } from "../../types/task";
import { CalendarWeek } from "./calendar-view-week/CalendarViewWeek";
import { CalendarViewMonth } from "./calendar-view-month/CalendarViewMonth";
import { CalendarViewHalfYear } from "./calendar-view-half-year/CalendarViewHalfYear";

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
			calendar = (
				<CalendarViewHalfYear tasks={this.props.tasks}></CalendarViewHalfYear>
			);
		} else if (this.props.type === Type.MONTH) {
			calendar = (
				<CalendarViewMonth tasks={this.props.tasks}></CalendarViewMonth>
			);
		}

		return calendar;
	}
}
