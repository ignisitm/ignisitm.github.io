import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
import { FC } from "react";

const confirmButton: any = ({ modal, onClick, message, title }: any) => {
	modal.confirm({
		title: title,
		icon: <ExclamationCircleOutlined />,
		content: message,
		onOk: onClick,
		onCancel: () => {},
	});
};

export default confirmButton;
