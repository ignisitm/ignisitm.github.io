import {
	Button,
	Form,
	Input,
	message,
	Modal,
	Select,
	Tooltip,
	DatePicker,
	Divider,
} from "antd";
import {
	PlusOutlined,
	FieldTimeOutlined,
	LoadingOutlined,
} from "@ant-design/icons";
import { FC, useState, useContext, useEffect } from "react";
import { SuperUserContext } from "../../Helpers/Context";
import { apiCall } from "../../axiosConfig";
import { AxiosError, AxiosResponse } from "axios";
import UserTransfer from "./Transfer";
import ResourceTransfer from "./ResourceTransfer";
const { RangePicker } = DatePicker;

interface props {
	fetchData: Function;
	record: any;
	disabled: boolean;
}

interface CollectionCreateFormProps {
	record: any;
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
	record,
}) => {
	const [form] = Form.useForm();
	const contextVariables = useContext(SuperUserContext);
	const [availableUsers, setAvailableUsers] = useState<any>([]);
	const [availableResources, setAvailableResources] = useState<any>([]);
	const [searchingTechnicians, setSearchingTechnicians] = useState(-1);
	const [enableSchedule, setEnableSchedule] = useState(true);
	const [assignedUsers, setAssignedUsers] = useState<any>([]);
	const [assignedResources, setAssignedResources] = useState<any>([]);

	useEffect(() => {
		console.log(record);
	}, []);

	const cancelModal = () => {
		form.resetFields();
		onCancel();
		setAvailableUsers([]);
		setAvailableResources([]);
		setSearchingTechnicians(-1);
	};

	return (
		<Modal
			visible={visible}
			title="Schedule Work Order"
			okButtonProps={{ disabled: enableSchedule }}
			okText="Schedule"
			style={{ top: "20px" }}
			cancelText="Cancel"
			onCancel={() => {
				cancelModal();
			}}
			onOk={() => {
				form
					.validateFields()
					.then((values) => {
						let total_assigned_resources = [
							...assignedUsers,
							...assignedResources,
						];
						values["assigned"] = total_assigned_resources;
						console.log(total_assigned_resources);
						onCreate(values).then(() => {
							cancelModal();
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
				initialValues={{}}
				onValuesChange={(cv, av) => {
					console.log(cv);
					if (cv.date && av.date.length > 1) {
						setSearchingTechnicians(0);
						let systems = record.map((item: any) => {
							return { system: item.system };
						});
						apiCall({
							method: "POST",
							url: "/assets/schedule",
							data: {
								values: { ...av, systems },
							},
							handleResponse: (res) => {
								console.log(res);
								let newAvailableUsers = res.data.message.employee;
								console.log(newAvailableUsers);
								newAvailableUsers = newAvailableUsers.map(
									(user: { id: number; name: string }) => ({
										key: user.id.toString(),
										...user,
									})
								);
								setAvailableUsers(newAvailableUsers);
								let newAvailableResources = res.data.message.resource;
								console.log(newAvailableResources);
								newAvailableResources = newAvailableResources.map(
									(user: { id: number; name: string }) => ({
										key: user.id.toString(),
										...user,
									})
								);
								setAvailableResources(newAvailableResources);
								setSearchingTechnicians(1);
							},
							handleError: (err) => {},
						});
					}
				}}
			>
				<Form.Item
					name="date"
					label="Select Start Date and End Date"
					rules={[
						{
							required: true,
							message: "Select Start and End Dates",
						},
					]}
				>
					<RangePicker
						style={{ width: "100%" }}
						format="DD/MM/YYYY  HH:mm"
						showTime={{ format: "HH:mm" }}
					/>
				</Form.Item>
				{searchingTechnicians === 1 ? (
					<>
						<h3>Employees</h3>
						<UserTransfer
							users={availableUsers}
							enable={setEnableSchedule}
							setAssignedUsers={setAssignedUsers}
						/>
						<h3>Equipments</h3>
						<ResourceTransfer
							users={availableResources}
							// enable={setEnableSchedule}
							setAssignedUsers={setAssignedResources}
						/>
					</>
				) : searchingTechnicians === 0 ? (
					<div style={{ width: "100%", textAlign: "center" }}>
						{" "}
						Searching for available Resources &nbsp; <LoadingOutlined />
					</div>
				) : null}
			</Form>
		</Modal>
	);
};

const Schedule: FC<props> = ({ fetchData, record, disabled }: props) => {
	const [visible, setVisible] = useState(false);
	const [confirmLoading, setConfirmLoading] = useState(false);

	const onCreate = (values: any) => {
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			console.log("Received values of form: ", values);
			console.log("Record values of form: ", record);
			setConfirmLoading(true);
			console.log({ ...values, record });
			apiCall({
				method: "POST",
				url: "/assets/workorders",
				data: {
					values: { ...values, record },
				},
				handleResponse: (res) => {
					resolve(res);
					// console.log(res);
					setConfirmLoading(false);
					message.success(res.data.message);
					// // info(values.clientId);
					setVisible(false);
					// fetchData();
				},
				handleError: (err) => {
					// reject(err);
					// setConfirmLoading(false);
				},
			});
		});
	};

	useEffect(() => {
		console.log(record);
	}, []);

	return (
		<>
			<div
				onClick={() => {
					setVisible(true);
				}}
				// style={{
				// 	display: "inline-block",
				// 	color: "blue",
				// }}
			>
				{/* <Tooltip title="Schedule">
					 <FieldTimeOutlined size={8} />
				</Tooltip> */}
				<Button disabled={disabled} icon={<FieldTimeOutlined />} type="primary">
					Create WO
				</Button>
			</div>

			<CollectionCreateForm
				record={record}
				visible={visible}
				onCreate={onCreate}
				onCancel={() => {
					setVisible(false);
				}}
				confirmLoading={confirmLoading}
			/>
		</>
	);
};

export default Schedule;
