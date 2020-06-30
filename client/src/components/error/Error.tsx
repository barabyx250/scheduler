import { Alert } from "antd";
import React from "react";
import styles from "./error.module.css";

export class ErrorBox extends React.Component<{
	description: string;
}> {
	render() {
		return (
			<div className={styles.error}>
				<Alert
					message="Error"
					description={this.props.description}
					type="error"
					showIcon
					closable
				/>
			</div>
		);
	}
}
