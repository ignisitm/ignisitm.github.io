import { Button, Form, Input, message, Modal, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { FC, useState, useContext } from "react";
import { TeamContext } from "../../Helpers/Context";
import { apiCall } from "../../axiosConfig";
import { AxiosError, AxiosResponse } from "axios";

interface props {
	fetchData: Function;
	id: any;
	assigned: any;
}

interface CollectionCreateFormProps {
	visible: boolean;
	confirmLoading: boolean;
	assigned: any;
	onCreate: (values: any) => Promise<AxiosResponse | AxiosError>;
	onCancel: () => void;
}

const CollectionCreateForm: FC<CollectionCreateFormProps> = ({
	visible,
	assigned,
	confirmLoading,
	onCreate,
	onCancel,
}) => {
	const [form] = Form.useForm();
	const contextVariables = useContext(TeamContext);

	return (
		<Modal
			style={{ top: "20px" }}
			open={visible}
			title="Edit Team"
			destroyOnClose={true}
			okText="Save"
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
				preserve={false}
				form={form}
				layout="vertical"
				name="form_in_modal"
				initialValues={{ assigned_users: assigned.map((x: any) => x.username) }}
			>
				<Form.Item
					name="assigned_users"
					label="Select Users:"
					rules={[{ required: true, message: "Please select a User" }]}
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

const EditTeam: FC<props> = ({ id, fetchData, assigned }: props) => {
	const [visible, setVisible] = useState(false);
	const [confirmLoading, setConfirmLoading] = useState(false);

	const onCreate = (values: any) => {
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			console.log("Received values of form: ", values);
			values["id"] = id;
			setConfirmLoading(true);
			apiCall({
				method: "PUT",
				url: "/clientcontrollers",
				data: values,
				handleResponse: (res) => {
					resolve(res);
					setConfirmLoading(false);
					setVisible(false);
					fetchData(id, false);
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
				onClick={() => {
					setVisible(true);
				}}
				style={{ float: "right" }}
			>
				Edit Members
			</Button>

			<CollectionCreateForm
				assigned={assigned}
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

export default EditTeam;
