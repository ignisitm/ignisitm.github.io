import { Modal } from "antd";
import { FC } from "react";

interface props {
	visible: boolean;
}

const AddDefects: FC<props> = ({ visible }) => {
	const resetModal = () => {
		console.log("reset");
	};

	return (
		<Modal
			open={visible}
			style={{ top: "20px" }}
			width={900}
			title="Add a new Notification"
			okText="Add Notification"
			maskClosable={false}
			destroyOnClose={true}
			cancelText="Cancel"
			onCancel={() => {
				resetModal();
			}}
			onOk={() => {}}
		>
			AddDefects
		</Modal>
	);
};

export default AddDefects;
