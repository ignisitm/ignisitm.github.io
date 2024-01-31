import { Button, Form, Input, message, Modal, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { FC, useState, useContext } from "react";
import { SuperUserContext } from "../../Helpers/Context";
import { apiCall } from "../../axiosConfig";
import { AxiosError, AxiosResponse } from "axios";

interface props {
	fetchData: Function;
}

interface DeviceCreateFormProps {
	visible: boolean;
	confirmLoading: boolean;
	onCreate: (values: any) => Promise<AxiosResponse | AxiosError>;
	onCancel: () => void;
}

const DeviceCreateForm: FC<DeviceCreateFormProps> = ({
	visible,
	confirmLoading,
	onCreate,
	onCancel,
}) => {
	const [form] = Form.useForm();
	const contextVariables = useContext(SuperUserContext);

	return (
		<Modal
			visible={visible}
			title="Add Work"
			okText="Add Work"
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
			<Form
				form={form}
				layout="vertical"
				name="form_in_modal"
				initialValues={{ modifier: "public" }}
			>
				<Form.Item
					name="name"
					label="Work"
					rules={[
						{
							required: true,
							message: "Missing Field!",
						},
					]}
				>
					<Input />
				</Form.Item>
				<Form.Item
					name="activity"
					label="Activity"
					rules={[
						{
							required: true,
							message: "Missing Field!",
						},
					]}
				>
					<Select>
						<Select.Option value="Inspection">Inspection</Select.Option>
						<Select.Option value="Maintainance">Maintainance</Select.Option>
						<Select.Option value="Test">Test</Select.Option>
					</Select>
				</Form.Item>
				<Form.Item
					name="frequency"
					label="Frequency"
					rules={[
						{
							required: true,
							message: "Missing Field!",
						},
					]}
				>
					<Select>
						<Select.Option value="Daily">Daily</Select.Option>
						<Select.Option value="Weekly">Weekly</Select.Option>
						<Select.Option value="Every 2 weeks">Every 2 weeks</Select.Option>
						<Select.Option value="Monthly">Monthly</Select.Option>
						<Select.Option value="Quarterly">Quarterly</Select.Option>
						<Select.Option value="SemiAnnually">SemiAnnually</Select.Option>
						<Select.Option value="Annually">Annually</Select.Option>
						<Select.Option value="Every 2 years">Every 2 years</Select.Option>
						<Select.Option value="Every 5 years">Every 5 years</Select.Option>
						<Select.Option value="Every 10 years">Every 10 years</Select.Option>
						<Select.Option value="Others">Others</Select.Option>
					</Select>
				</Form.Item>
			</Form>
		</Modal>
	);
};

const AddNewDevice: FC<props> = ({ fetchData }: props) => {
	const [visible, setVisible] = useState(false);
	const [confirmLoading, setConfirmLoading] = useState(false);

	const onCreate = (values: any) => {
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			console.log("Received values of form: ", values);
			setConfirmLoading(true);
			apiCall({
				method: "POST",
				url: "/clients",
				data: { client: values },
				handleResponse: (res) => {
					resolve(res);
					setConfirmLoading(false);
					// info(values.clientId);
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
				Add Work
			</Button>
			<DeviceCreateForm
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

export default AddNewDevice;
