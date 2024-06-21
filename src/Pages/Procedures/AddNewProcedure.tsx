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
}

interface NewProcedureFormProps {
	visible: boolean;
	confirmLoading: boolean;
	onCreate: (values: any) => Promise<AxiosResponse | AxiosError>;
	onCancel: () => void;
}

const NewProcedureForm: FC<NewProcedureFormProps> = ({
	visible,
	confirmLoading,
	onCreate,
	onCancel,
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
			maskClosable={false}
			cancelText="Cancel"
			destroyOnClose={true}
			onCancel={() => {
				form.resetFields();
				onCancel();
			}}
			onOk={() => {
				form.validateFields()
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
							name="full_name"
							label="Full Name"
							rules={[{ required: true }]}
						>
							<Input />
						</Form.Item>
					</Col>
					<Col span={24}>
						<Form.Item
							name="designation"
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

const AddNewProcedure: FC<props> = ({ fetchData }: props) => {
	const [visible, setVisible] = useState(false);
	const [confirmLoading, setConfirmLoading] = useState(false);

	const onCreate = (values: any) => {
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			console.log("Received values of form: ", values);
			setConfirmLoading(true);
			apiCall({
				method: "POST",
				url: "clientemployees",
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
				Add Employee
			</Button>
			<NewProcedureForm
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

export default AddNewProcedure;
