import { Layout } from "antd";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectAccount } from "../../redux/slicers/accountSlice";

export const FAQ: React.FC = () => {
	const dispatch = useDispatch();
	const accState = useSelector(selectAccount);

	return <div>FAQ</div>;
};
