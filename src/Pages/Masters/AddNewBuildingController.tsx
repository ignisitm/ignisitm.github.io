import { Button, Form, Input, message, Modal, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { FC, useState, useContext } from "react";
import { BCcontext } from "../../Helpers/Context";
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
	const contextVariables = useContext(BCcontext);

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
					name="id"
					label="Controller ID"
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
					name="assigned_users"
					label="Select Users:"
					rules={[{ required: true, message: "Please select a Country" }]}
				>
					<Select
						showSearch
						mode="multiple"
						allowClear
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
						{contextVariables.users?.map(
							(item: { username: object; name: string }, index: number) => (
								<Select.Option value={item.username}>{item.name}</Select.Option>
							)
						)}
					</Select>
				</Form.Item>
			</Form>
		</Modal>
	);
};

const AddNewBuildingController: FC<props> = ({ fetchData }: props) => {
	const [visible, setVisible] = useState(false);
	const [confirmLoading, setConfirmLoading] = useState(false);

	const onCreate = (values: any) => {
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			console.log("Received values of form: ", values);
			setConfirmLoading(true);
			apiCall({
				method: "POST",
				url: "/clientcontrollers",
				data: values,
				handleResponse: (res) => {
					resolve(res);
					setConfirmLoading(false);
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
				Add New
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

export default AddNewBuildingController;
