import { Button, Form, Input, message, Modal, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { FC, useState, useContext } from "react";
import { SuperUserContext } from "../../Helpers/Context";
import { apiCall } from "../../axiosConfig";
import { AxiosError, AxiosResponse } from "axios";

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
			title="Add a new Client"
			okText="Add Client"
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
					label="Client Name"
					rules={[
						{
							required: true,
							message: "Please input the name of client!",
						},
					]}
				>
					<Input />
				</Form.Item>
				<Form.Item
					name="clientId"
					label="URL Prefix"
					rules={[
						{
							required: true,
							message: "Please input the name of client!",
						},
					]}
				>
					<Input prefix="https//:www." suffix=".ignis.com" />
				</Form.Item>
				<Form.Item
					name="country"
					label="Country"
					rules={[{ required: true, message: "Please select a Country" }]}
				>
					<Select
						showSearch
						placeholder="Search to Select"
						optionFilterProp="children"
						filterOption={(input, option) =>
							(option!.children as unknown as string)
								.toLowerCase()
								.includes(input)
						}
						filterSort={(optionA, optionB) =>
							(optionA!.children as unknown as string)
								.toLowerCase()
								.localeCompare(
									(optionB!.children as unknown as string).toLowerCase()
								)
						}
					>
						{contextVariables.countries?.map(
							(item: { country_iso: object; name: string }, index: number) => (
								<Select.Option value={item.country_iso}>
									{item.name}
								</Select.Option>
							)
						)}
					</Select>
				</Form.Item>
				<Form.Item
					name="notification_frequency"
					label="Notification Frequency (No. of Days)"
					rules={[
						{
							required: true,
							message:
								"Please input the no. of days before which you would like to recieve the notification!",
						},
					]}
				>
					<Input type="number" />
				</Form.Item>
			</Form>
		</Modal>
	);
};

const AddNewClient: FC<props> = ({ fetchData }: props) => {
	const [visible, setVisible] = useState(false);
	const [confirmLoading, setConfirmLoading] = useState(false);

	const info = (clientId: string) => {
		Modal.info({
			title: "Client Successfully Added",
			content: (
				<div>
					<p>Log in to the following url using admin credentials:</p>
					<p>
						<a href={`http://${clientId}.localhost:3000/`}>
							www.{clientId}.ignis.com
						</a>
					</p>
				</div>
			),
			onOk() {},
		});
	};

	const onCreate = (values: any) => {
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			console.log("Received values of form: ", values);
			setConfirmLoading(true);
			values.notifiation_frequency = parseInt(values.notifiation_frequency);
			apiCall({
				method: "POST",
				url: "/clients",
				data: { client: values },
				handleResponse: (res) => {
					resolve(res);
					setConfirmLoading(false);
					info(values.clientId);
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
				Add Client
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

export default AddNewClient;
