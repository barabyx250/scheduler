import React from "react";
import { Task } from "../../types/task";
import { CalendarWeek } from "./calendar-view-week/CalendarViewWeek";
import { CalendarViewMonth } from "./calendar-view-month/CalendarViewMonth";
import { CalendarViewHalfYear } from "./calendar-view-half-year/CalendarViewHalfYear";
import { CSSTransition, SwitchTransition } from "react-transition-group";

import "./calendar_animations.css";

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

		return (
			<SwitchTransition mode="out-in">
				<CSSTransition
					key={this.props.type}
					timeout={400}
					classNames="calendar"
					onEnter={() => console.log("Enter")}
					onExited={() => console.log("Exit")}
					unmountOnExit
					addEndListener={(node, done) => {
						node.addEventListener("transitionend", done, false);
					}}
				>
					{calendar}
				</CSSTransition>
			</SwitchTransition>
		);
	}
}
