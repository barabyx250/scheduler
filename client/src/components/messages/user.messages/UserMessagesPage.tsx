import React from "react";
import { useSelector } from "react-redux";
import { selectAccount } from "../../../redux/slicers/accountSlice";
import { AdminMessageDialog } from "../admin.dialog/AdminMessageDialog";

export const UserMessagesPage: React.FC = () => {
	const accState = useSelector(selectAccount);

	return (
		<div>
			<AdminMessageDialog
				chatWith={accState.id}
				style={{ height: "70vh" }}
			></AdminMessageDialog>
		</div>
	);
};
