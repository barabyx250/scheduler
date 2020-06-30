import React from "react";
import "./calendar.style.css";
import { Task } from "../../../types/task";
import { Row, Col } from "antd";
import { RowStyle, ColStyle } from "./calendar.view.week.module.style";

export enum Type {
	WEEK,
	MONTH,
	HALF_YEAR,
}

export class CalendarWeek extends React.Component<{
	tasks: Array<Task>;
}> {
	buildCol(count: number): Array<JSX.Element> {
		let cols = Array<JSX.Element>();
		for (var col = 0; col < count; col++) {
			cols.push(
				<Col style={{ width: "14%" }}>
					<div style={ColStyle}>col + {col.toString()}</div>
				</Col>
			);
		}
		return cols;
	}

	buildRows(count: number): Array<JSX.Element> {
		let raws = Array<JSX.Element>();
		for (var raw = 0; raw < count; raw++) {
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
			<div style={{ width: "100%", height: "100%" }}>{this.buildRows(50)}</div>
		);
	}
}
