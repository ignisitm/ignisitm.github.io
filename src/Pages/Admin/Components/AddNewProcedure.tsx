import { Button, Checkbox, Form, Input, message, Modal, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { FC, useState, useContext } from "react";
import { AHJFormContext, SuperUserContext } from "../../../Helpers/Context";
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
	selectedDevices: any;
}

const CollectionCreateForm: FC<CollectionCreateFormProps> = ({
	visible,
	devices,
	confirmLoading,
	setSelectedDevices,
	selectedDevices,
	onCreate,
	onCancel,
}) => {
	const [form] = Form.useForm();
	const cv = useContext(AHJFormContext);

	return (
		<Modal
			open={visible}
			destroyOnClose={true}
			title="Add a new Item"
			style={{ minWidth: "632px", top: "20px" }}
			okText="Add Item"
			maskClosable={false}
			cancelText="Cancel"
			onCancel={() => {
				form.resetFields();
				setSelectedDevices([]);
				onCancel();
			}}
			onOk={() => {
				form
					.validateFields()
					.then((values) => {
						onCreate(values).then(() => {
							form.resetFields();
							setSelectedDevices([]);
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
					label="Item"
					rules={[
						{
							required: true,
							message: "Please input the procedure!",
						},
					]}
				>
					<Input />
				</Form.Item>
				<Form.Item
					name="frequency"
					label="Select Frequency"
					rules={[
						{
							required: true,
							message: "Please select the frequency!",
						},
					]}
				>
					<Select
						placeholder="Select frequency"
						style={{ width: "100%" }}
						options={cv.frequencies.map((freq: any) => ({
							label: freq.name,
							value: freq.id,
						}))}
					/>
				</Form.Item>

				<h4>Select devices to be checked for this procedure : </h4>
				<DeviceTransferList
					devices={devices}
					setSelectedDevices={setSelectedDevices}
					selectedDevices={selectedDevices}
				/>
				<Form.Item
					name={"device_wise"}
					rules={[{ required: true, message: "Enter a value" }]}
					valuePropName="checked"
					initialValue={false}
				>
					<Checkbox>Perform check for each device seperately</Checkbox>
				</Form.Item>
				<Form.Item
					name="instructions"
					label="Procedure"
					rules={[
						{
							required: false,
							message: "Please input the instructions!",
						},
					]}
				>
					<Input.TextArea rows={3} />
				</Form.Item>
			</Form>
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
				Add Item
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
				selectedDevices={selectedDevices}
			/>
		</div>
	);
};

export default AddNewProcedure;
