import { Button, Form, Input, message, Modal, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { FC, useState, useContext } from "react";
import { SuperUserContext } from "../../../Helpers/Context";
import { apiCall } from "../../../axiosConfig";
import { AxiosError, AxiosResponse } from "axios";
import DeviceTransferList from "./DeviceTransferList";

interface props {
	fetchData: Function;
}

interface CollectionCreateFormProps {
	visible: boolean;
	confirmLoading: boolean;
	onCreate: (values: any) => Promise<AxiosResponse | AxiosError>;
	onCancel: () => void;
}

const CollectionCreateForm: FC<CollectionCreateFormProps> = ({
	visible,

	confirmLoading,

	onCreate,
	onCancel,
}) => {
	const [form] = Form.useForm();
	const contextVariables = useContext(SuperUserContext);

	return (
		<Modal
			open={visible}
			title="Add a new AHJ"
			style={{ minWidth: "632px", top: "20px" }}
			okText="Add AHJ"
			maskClosable={false}
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
					name="name"
					label="Name"
					rules={[
						{
							required: true,
							message: "Please input the name!",
						},
					]}
				>
					<Input />
				</Form.Item>
				<Form.Item
					name="country"
					label="Country"
					rules={[
						{
							required: true,
							message: "Please input the country!",
						},
					]}
				>
					<Select>
						<Select.Option value="qatar">Qatar</Select.Option>
					</Select>
				</Form.Item>
			</Form>
		</Modal>
	);
};

const AddNewAhj: FC<props> = ({ fetchData }: props) => {
	const [visible, setVisible] = useState(false);
	const [confirmLoading, setConfirmLoading] = useState(false);

	const onCreate = (values: any) => {
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			console.log("Received values of form: ", values);
			setConfirmLoading(true);
			apiCall({
				method: "POST",
				url: "/ahjform",
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
				Add AHJ
			</Button>
			<CollectionCreateForm
				visible={visible}
				onCreate={onCreate}
				onCancel={() => {
					setVisible(false);
				}}
				confirmLoading={confirmLoading}
			/>
		</div>
	);
};

export default AddNewAhj;
