import {
	Form,
	Button,
	Row,
	Col,
	Table,
	Modal,
	Select,
	Input,
	message,
	Rate,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { apiCall } from "../../axiosConfig";
import { FC, useState, useContext } from "react";
import { SuperUserContext } from "../../Helpers/Context";
import { AxiosError, AxiosResponse } from "axios";

interface props {
	fetchData: Function;
	systems: any;
}

interface NewUserFormProps {
	visible: boolean;
	confirmLoading: boolean;
	onCreate: (values: any) => Promise<AxiosResponse | AxiosError>;
	onCancel: () => void;
	systems: any;
}

const NewUserForm: FC<NewUserFormProps> = ({
	visible,
	confirmLoading,
	onCreate,
	onCancel,
	systems,
}) => {
	const [form] = Form.useForm();
	const [userLoading, setUserLoading] = useState(false);

	const onReset = () => {
		form.resetFields();
	};

	return (
		<Modal
			visible={visible}
			title="Add a new Equipment"
			okText="Add Equipment"
			maskClosable={false}
			cancelText="Cancel"
			destroyOnClose={true}
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
				preserve={false}
				name="createnewnotification"
				autoComplete="off"
				labelCol={{ span: 24, style: { paddingTop: 3 } }}
				wrapperCol={{ span: 24 }}
				size="small"
			>
				<Row>
					<Col span={24}>
						<Form.Item
							name="name"
							label="Equipment Name"
							rules={[{ required: true }]}
						>
							<Input />
						</Form.Item>
					</Col>
					<Col span={24}>
						<Form.Item
							name="type"
							label="Equipment Type"
							rules={[{ required: true }]}
						>
							<Select>
								<Select.Option value="Spare Parts">Spare Parts</Select.Option>
								<Select.Option value="Tools">Tools</Select.Option>
							</Select>
						</Form.Item>
					</Col>
					<Col span={24}>
						<Form.Item
							name="description"
							label="Description"
							rules={[{ required: false }]}
						>
							<Input.TextArea rows={4} />
						</Form.Item>
					</Col>
					<Col md={6} xs={0} style={{ paddingLeft: "10px" }} />
				</Row>

				<Row />
			</Form>
		</Modal>
	);
};

const AddNewEquipment: FC<props> = ({ fetchData, systems }: props) => {
	const [visible, setVisible] = useState(false);
	const [confirmLoading, setConfirmLoading] = useState(false);

	const onCreate = (values: any) => {
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			console.log("Received values of form: ", values);
			setConfirmLoading(true);
			apiCall({
				method: "POST",
				url: "clientresources",
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
				Add Equipment
			</Button>
			<NewUserForm
				systems={systems}
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

export default AddNewEquipment;
