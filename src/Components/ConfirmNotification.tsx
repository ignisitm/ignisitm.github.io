import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
import { FC, ReactChildren, ReactNode, ReactElement } from "react";

const { confirm } = Modal;

interface props {
	buttonSpec: ReactNode;
	func: Promise<any>;
}

const ConfirmNotification: FC<props> = ({ buttonSpec, func }) => {
	const showPromiseConfirm = () => {
		confirm({
			title: "Do you want to delete these items?",
			icon: <ExclamationCircleOutlined />,
			content:
				"When clicked the OK button, this dialog will be closed after 1 second",
			onOk: async () => {
				return new Promise((resolve, reject) => {
					setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
				}).catch(() => console.log("Oops errors!"));
			},
			onCancel: () => {},
		});
	};

	return <span>{buttonSpec}</span>;
};

export default ConfirmNotification;
