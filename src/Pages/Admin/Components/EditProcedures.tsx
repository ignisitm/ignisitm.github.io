import { Button, Checkbox, Form, Input, message, Modal, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { FC, useState, useContext, useEffect } from "react";
import { AHJFormContext, SuperUserContext } from "../../../Helpers/Context";
import { apiCall } from "../../../axiosConfig";
import { AxiosError, AxiosResponse } from "axios";
import DeviceTransferList from "./DeviceTransferList";

interface props {
	formData: any;
	visible: boolean;
	setVisible: Function;
	fetchData: Function;
	devices: any[];
	system: number;
	activity: string;
	ahj: number;
}

interface CollectionCreateFormProps {
	formdata: any;
	visible: boolean;
	devices: any[];
	confirmLoading: boolean;
	onCreate: (values: any) => Promise<AxiosResponse | AxiosError>;
	onCancel: () => void;
	setSelectedDevices: Function;
	selectedDevices: any;
}

const CollectionCreateForm: FC<CollectionCreateFormProps> = ({
	formdata,
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

	useEffect(() => {
		if (formdata) form.setFieldsValue(formdata);
	}, [formdata]);

	return (
		<Modal
			open={visible}
			destroyOnClose={true}
			title="Edit Item"
			style={{ minWidth: "632px", top: "20px" }}
			okText="Save Changes"
			maskClosable={false}
			cancelText="Cancel"
			afterOpenChange={() => {
				setSelectedDevices(formdata.devices);
			}}
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
				key={formdata?.id || 0}
				initialValues={{ ...formdata }}
				preserve={false}
				layout="vertical"
				name="form_in_modal"
			>
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

const EditProcedure: FC<props> = ({
	formData,
	visible,
	setVisible,
	fetchData,
	system,
	activity,
	devices,
	ahj,
}: props) => {
	const [confirmLoading, setConfirmLoading] = useState(false);
	const [selectedDevices, setSelectedDevices] = useState(
		formData?.devices || []
	);

	useEffect(() => {
		setSelectedDevices(formData?.devices || []);
	}, [formData]);

	const onCreate = (values: any) => {
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			values = { ...values, system, activity, devices: selectedDevices, ahj };
			console.log("Received values of form: ", values);
			setConfirmLoading(true);
			if (selectedDevices.length <= 0) {
				message.error("select atleast one device");
				setConfirmLoading(false);
				reject("Select atleast one device");
			} else if (formData?.id)
				apiCall({
					method: "PUT",
					url: "/procedure",
					data: { id: formData?.id, ...values },
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
			else {
				message.error("Procedure Id Missing!");
				setConfirmLoading(false);
				reject("Procedure Id Missing!");
			}
		});
	};

	return (
		<div>
			<CollectionCreateForm
				formdata={formData}
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

export default EditProcedure;
