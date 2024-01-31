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
	userRoles: any;
	employees: any;
}

const { Option } = Select;

const options = [
	{
		id: 1,
		label: "Automatic Sprinkler",
		value: { label: "Automatic Sprinkler", value: "automaticSprinkler" },
	},
	{
		id: 2,
		label: "Fire Pump",
		value: { label: "Fire Pump", value: "firePump" },
	},
	{
		id: 3,
		label: "Water Supply System",
		value: { label: "Water Supply System", value: "waterSupplySystem" },
	},
	{
		id: 4,
		label: "Standpipe and Hose System",
		value: {
			label: "Standpipe and Hose System",
			value: "standpipeAndHoseSystem",
		},
	},
	{
		id: 5,
		label: "Fire Hydrants",
		value: { label: "Fire Hydrants", value: "fireHydrants" },
	},
	{
		id: 6,
		label: "Water Mist System",
		value: { label: "Water Mist System", value: "waterMistSystem" },
	},
	{
		id: 7,
		label: "Foam System",
		value: { label: "Foam System", value: "foamSystem" },
	},
	{
		id: 8,
		label: "Fixed Wet Chemical Extinguishing System",
		value: {
			label: "Fixed Wet Chemical Extinguishing System",
			value: "fixedWetChemicalExtinguishingSystem",
		},
	},
	{
		id: 9,
		label: "Clean Agent Fire Extinguishing System",
		value: {
			label: "Clean Agent Fire Extinguishing System",
			value: "cleanAgentFireExtinguishingSystem",
		},
	},
	{
		id: 10,
		label: "Fixed Aerosol System",
		value: { label: "Fixed Aerosol System", value: "fixedAerosoleSystem" },
	},
	{
		id: 11,
		label: "Portable Fire Extinguisher",
		value: {
			label: "Portable Fire Extinguisher",
			value: "portableFireExtinguisher",
		},
	},
	{
		id: 12,
		label: "Fire Detection And Alarm System",
		value: {
			label: "Fire Detection And Alarm System",
			value: "fireDetectionAndAlarmSystem",
		},
	},
	{
		id: 13,
		label: "Emergency Lighting & EPSS",
		value: {
			label: "Emergency Lighting & EPSS",
			value: "emergencyLightingEPSS",
		},
	},
	{
		id: 14,
		label: "Others",
		value: { label: "Others", value: "others" },
	},
];

const desc = ["1", "2", "3", "4", "5"];

interface NewUserFormProps {
	visible: boolean;
	confirmLoading: boolean;
	onCreate: (values: any) => Promise<AxiosResponse | AxiosError>;
	onCancel: () => void;
	systems: any;
	employees: any;
	userRoles: any;
}

const NewUserForm: FC<NewUserFormProps> = ({
	visible,
	confirmLoading,
	onCreate,
	onCancel,
	systems,
	employees,
	userRoles,
}) => {
	const [form] = Form.useForm();
	const [userLoading, setUserLoading] = useState(false);
	const [isTechnician, setIsTechnician] = useState(false);

	const onReset = () => {
		form.resetFields();
	};

	return (
		<Modal
			visible={visible}
			title="Add a new User"
			okText="Add User"
			maskClosable={false}
			cancelText="Cancel"
			destroyOnClose={true}
			onCancel={() => {
				setIsTechnician(false);
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
				initialValues={userRoles ? { role: userRoles[0].id } : {}}
				onValuesChange={(changedValues, AllValues) => {
					console.log(AllValues);

					if (changedValues.role === "technician") setIsTechnician(true);
					else if (changedValues.role) setIsTechnician(false);
				}}
			>
				<Row>
					<Col span={24}>
						<Form.Item
							name="role"
							label="User Type"
							rules={[{ required: true }]}
						>
							<Select>
								{userRoles?.map((row: any) => (
									<Option value={row.id}>{row.role}</Option>
								))}
							</Select>
						</Form.Item>
					</Col>
					<Col span={24}>
						{/* <Form.Item name="name" label="Name" rules={[{ required: true }]}>
							<Input />
						</Form.Item> */}
					</Col>
					<Col span={24}>
						<Form.Item
							name="username"
							label="Employee Id"
							rules={[{ required: true }]}
						>
							<Select
								className="selected-new-building"
								showSearch
								placeholder="Search to Select"
								optionFilterProp="children"
								filterOption={(input, option) =>
									(option!.children as unknown as number)
										.toString()
										.toLowerCase()
										.includes(input)
								}
								filterSort={(optionA, optionB) =>
									(optionA!.children as unknown as number)
										.toString()
										.toLowerCase()
										.localeCompare(
											(optionB!.children as unknown as number).toString()
										)
								}
							>
								{employees.map((emp: any) => (
									<Option value={JSON.stringify(emp)}>
										{emp.id} - {emp.full_name}
									</Option>
								))}
							</Select>
						</Form.Item>
					</Col>
					<Col md={6} xs={0} style={{ paddingLeft: "10px" }} />
				</Row>

				<Row />
				{isTechnician ? (
					<>
						<h4>Skillset:</h4>

						<Row>
							<Col span={24}>
								<Form.List name="system_rating">
									{(fields, { add, remove }) => (
										<>
											{fields.map(({ key, name, ...restField }) => (
												<>
													<Row>
														<Col span={10} style={{ marginRight: "10px" }}>
															<Form.Item
																{...restField}
																name={[name, "system"]}
																// label="System"
																rules={[
																	{
																		required: true,
																		message: "Missing System",
																	},
																]}
															>
																<Select placeholder="System">
																	{systems.map((option: any) => (
																		<Option value={option.id}>
																			{option.name}
																		</Option>
																	))}
																</Select>
															</Form.Item>
														</Col>
														<Col span={10}>
															<Form.Item
																{...restField}
																name={[name, "itm"]}
																// label="System"
																rules={[
																	{
																		required: true,
																		message: "Missing Type",
																	},
																]}
															>
																<Select
																	mode="multiple"
																	placeholder="ITM"
																	size="small"
																>
																	<Option value="Inspection">Inspection</Option>
																	<Option value="Testing">Testing</Option>
																	<Option value="Maintenance">
																		Maintenance
																	</Option>
																</Select>
															</Form.Item>
														</Col>

														<Col span={3} style={{ paddingLeft: "10px" }}>
															<MinusCircleOutlined
																onClick={() => remove(name)}
															/>
														</Col>
													</Row>
													<Row>
														<Col span={4}>
															<label>Rating:</label>
														</Col>

														<Col span={18} style={{ paddingLeft: "10px" }}>
															<Form.Item
																{...restField}
																name={[name, "rating"]}
																rules={[
																	{
																		required: true,
																		message: "Missing Rating",
																	},
																]}
															>
																<Rate
																	tooltips={desc}
																	style={{ marginTop: "-10px" }}
																/>
															</Form.Item>
														</Col>
													</Row>
												</>
											))}
											<Form.Item>
												<Button
													type="dashed"
													onClick={() => add()}
													block
													icon={<PlusOutlined />}
												>
													Add Skillset
												</Button>
											</Form.Item>
										</>
									)}
								</Form.List>
							</Col>
						</Row>
					</>
				) : null}
			</Form>
		</Modal>
	);
};

const AddNewUser: FC<props> = ({
	fetchData,
	systems,
	employees,
	userRoles,
}: props) => {
	const [visible, setVisible] = useState(false);
	const [confirmLoading, setConfirmLoading] = useState(false);

	const onCreate = (values: any) => {
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			let emp_data = JSON.parse(values.username);
			let data = { ...values, username: emp_data.id, name: emp_data.full_name };
			console.log("Received values of form: ", data);
			setConfirmLoading(true);
			apiCall({
				method: "POST",
				url: "/clientusers",
				data: data,
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
				Add User
			</Button>
			<NewUserForm
				systems={systems}
				visible={visible}
				onCreate={onCreate}
				onCancel={() => {
					setVisible(false);
				}}
				confirmLoading={confirmLoading}
				employees={employees}
				userRoles={userRoles}
			/>
		</div>
	);
};

export default AddNewUser;
