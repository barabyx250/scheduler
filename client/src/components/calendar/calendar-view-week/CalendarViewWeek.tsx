import React from "react";
import "./calendar.style.css";
import { Task } from "../../../types/task";
import { Row, Col } from "antd";
import { RowStyle, ColStyle } from "./calendar.view.week.module.style";
import { addDays, format } from "date-fns/fp";
import { TagsFilled } from "@ant-design/icons";

export enum Type {
	WEEK,
	MONTH,
	HALF_YEAR,
}

class CalendarWeekColumnt extends React.Component<{
	date: Date;
	tasks?: Array<Task>;
}> {
	render() {
		if (this.props.tasks !== undefined && this.props.tasks.length > 0) {
			return (
				<Col style={{ width: "100%", maxWidth: "200px" }}>
					<div style={ColStyle}>
						{this.props.tasks?.map((task) => {
							return <div>{task.content}</div>;
						})}
					</div>
				</Col>
			);
		}
		return (
			<Col style={{ width: "100%", maxWidth: "200px" }}>
				<div style={ColStyle}></div>
			</Col>
		);
	}
}

export class CalendarWeek extends React.Component<{
	tasks: Array<Task>;
}> {
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

	buildCol(count: number): Array<JSX.Element> {
		let cols = Array<JSX.Element>();
		const startWeek: Date = this.startOfWeek(new Date());
		const dates = [
			startWeek,
			addDays(1, startWeek),
			addDays(2, startWeek),
			addDays(3, startWeek),
			addDays(4, startWeek),
			addDays(5, startWeek),
			addDays(6, startWeek),
		];

		for (var col = 0; col < count; col++) {
			cols.push(
				<CalendarWeekColumnt
					date={dates[col]}
					tasks={this.props.tasks.filter((item) => {
						debugger;
						return this.ifTaskInDate(dates[col], item);
					})}
				/>
			);
		}
		return cols;
	}

	buildRows(): Array<JSX.Element> {
		let raws = Array<JSX.Element>();
		for (var raw = 0; raw < this.props.tasks.length; raw++) {
			let cols = this.buildCol(7);
			raws.push(
				<Row gutter={[8, 8]} style={RowStyle}>
					{cols}
				</Row>
			);
		}
		return raws;
	}

	render() {
		return (
			<div style={{ width: "100%", height: "100%" }}>{this.buildRows()}</div>
		);
	}
}
