import { Button, Form, Input, message, Modal, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { FC, useState, useContext } from "react";
import { SuperUserContext } from "../../../Helpers/Context";
import { apiCall } from "../../../axiosConfig";
import { AxiosError, AxiosResponse } from "axios";
import DeviceTransferList from "./DeviceTransferList";

interface props {
	fetchData: Function;
	devices: any[];
	system: number;
	activity: string;
	ahj: number;
}

interface CollectionCreateFormProps {
	visible: boolean;
	devices: any[];
	confirmLoading: boolean;
	onCreate: (values: any) => Promise<AxiosResponse | AxiosError>;
	onCancel: () => void;
	setSelectedDevices: Function;
}

const CollectionCreateForm: FC<CollectionCreateFormProps> = ({
	visible,
	devices,
	confirmLoading,
	setSelectedDevices,
	onCreate,
	onCancel,
}) => {
	const [form] = Form.useForm();
	const contextVariables = useContext(SuperUserContext);

	return (
		<Modal
			open={visible}
			title="Add a new Procedure"
			style={{ minWidth: "632px" }}
			okText="Add Procedure"
			cancelText="Cancel"
			onCancel={() => {
				form.resetFields();
				onCancel();
			}}
			onOk={() => {
				form
					.validateFields()
					.then((values) => {
						onCreate(values).then(() => {
							form.resetFields();
						});
					})
					.catch((info) => {
						console.log("Validate Failed:", info);
					});
			}}
			confirmLoading={confirmLoading}
		>
			<Form form={form} layout="vertical" name="form_in_modal">
				<Form.Item
					name="code"
					label="Code"
					rules={[
						{
							required: true,
							message: "Please input the code!",
						},
					]}
				>
					<Input />
				</Form.Item>
				<Form.Item
					name="procedure"
					label="Procedure"
					rules={[
						{
							required: true,
							message: "Please input the procedure!",
						},
					]}
				>
					<Input />
				</Form.Item>
			</Form>
			<h4>Select devices to be checked for this procedure : </h4>
			<DeviceTransferList
				devices={devices}
				setSelectedDevices={setSelectedDevices}
			/>
		</Modal>
	);
};

const AddNewProcedure: FC<props> = ({
	fetchData,
	system,
	activity,
	devices,
	ahj,
}: props) => {
	const [visible, setVisible] = useState(false);
	const [confirmLoading, setConfirmLoading] = useState(false);
	const [selectedDevices, setSelectedDevices] = useState([]);

	const onCreate = (values: any) => {
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			values = { ...values, system, activity, devices: selectedDevices, ahj };
			console.log("Received values of form: ", values);
			setConfirmLoading(true);
			if (selectedDevices.length <= 0) {
				message.error("select atleast one device");
				setConfirmLoading(false);
				reject("Select atleast one device");
			} else
				apiCall({
					method: "POST",
					url: "/procedure",
					data: values,
					handleResponse: (res) => {
						resolve(res);
						setConfirmLoading(false);
						message.success(res.data.message);
						setVisible(false);
						fetchData();
					},
					handleError: (err) => {
						reject(err);
						setConfirmLoading(false);
					},
				});
		});
	};

	return (
		<div>
			<Button
				icon={<PlusOutlined />}
				onClick={() => {
					setVisible(true);
				}}
				type="primary"
			>
				Add Procedure
			</Button>
			<CollectionCreateForm
				setSelectedDevices={setSelectedDevices}
				visible={visible}
				devices={devices}
				onCreate={onCreate}
				onCancel={() => {
					setVisible(false);
				}}
				confirmLoading={confirmLoading}
			/>
		</div>
	);
};

export default AddNewProcedure;
