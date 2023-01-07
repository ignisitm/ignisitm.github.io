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
			title="Add a new Employee"
			okText="Add Employee"
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
							name="id"
							label="Employee Id"
							rules={[{ required: true }]}
						>
							<Input />
						</Form.Item>
					</Col>
					<Col span={24}>
						<Form.Item
							name="name"
							label="Full Name"
							rules={[{ required: true }]}
						>
							<Input />
						</Form.Item>
					</Col>
					<Col span={24}>
						<Form.Item
							name="role"
							label="Designation"
							rules={[{ required: true }]}
						>
							<Input />
						</Form.Item>
					</Col>
					<Col md={6} xs={0} style={{ paddingLeft: "10px" }} />
				</Row>

				<Row />
			</Form>
		</Modal>
	);
};

const AddNewEmployee: FC<props> = ({ fetchData, systems }: props) => {
	const [visible, setVisible] = useState(false);
	const [confirmLoading, setConfirmLoading] = useState(false);

	const onCreate = (values: any) => {
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			console.log("Received values of form: ", values);
			setConfirmLoading(true);
			apiCall({
				method: "POST",
				url: "auth/employee",
				data: { employeeInfo: values },
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
				Add Employee
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

export default AddNewEmployee;
