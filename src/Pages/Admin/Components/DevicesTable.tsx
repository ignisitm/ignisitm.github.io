import {
	Table,
	Row,
	Col,
	Input,
	Button,
	Popconfirm,
	message,
	Modal,
	Form,
	Select,
	Tabs,
	Space,
	ModalFuncProps,
	Tooltip,
	Checkbox,
	Divider,
	Avatar,
} from "antd";
import { FC, Fragment, ReactElement, useEffect, useRef, useState } from "react";
import { apiCall } from "../../../axiosConfig";
import AddNewSystems from "./AddNewSystems";
import {
	SyncOutlined,
	CloseOutlined,
	DeleteOutlined,
	MinusCircleOutlined,
	PlusOutlined,
	LoadingOutlined,
	QuestionCircleOutlined,
	EditOutlined,
	UserOutlined,
} from "@ant-design/icons";
import { AxiosError, AxiosResponse } from "axios";
import AddNewDevice from "./AddNewDevice";
import { ModalStaticFunctions } from "antd/es/modal/confirm";
import { useLoaderContext } from "../../../Components/Layout";
import DeviceCommonFields from "./DeviceCommonFields";
const { Search } = Input;

type props = {
	system_id: number;
};

const DevicesTable: FC<props> = ({ system_id }) => {
	const { completeLoading } = useLoaderContext();
	const [data, setData] = useState();
	const [loading, setLoading] = useState(false);
	const [searchText, setSearchText] = useState("");
	const [showClose, setShowClose] = useState(false);
	const [systems, setSystems] = useState<any>([]);
	const [frequency, setFrequency] = useState<any>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [fields_form] = Form.useForm();
	const [fieldsEditMode, setFieldsEditMode] = useState(false);
	const [editLoading, setEditLoading] = useState(false);
	const [selectedDevice, setSelectedDevice] = useState<any>();
	const [frequencyModal, setFrequencyModal] = useState(false);
	const [newFrequency, setNewFrequency] = useState<number>();
	const [savingFrequency, setSavingFrequency] = useState(false);

	//FREQUENCY MODAL OPERATIONS
	const showFrequencyModal = (id: number, row: any) => {
		setNewFrequency(id);
		setFrequencyModal(true);
		setSelectedDevice(row);
	};

	const closeFrequencyModal = () => {
		setNewFrequency(0);
		setSelectedDevice(null);
		setFrequencyModal(false);
	};

	const showModal = (row: any) => {
		setIsModalOpen(true);
		setSelectedDevice(row);
		fields_form.setFieldsValue(row);
	};

	const handleOk = () => {
		setIsModalOpen(false);
	};

	const handleCancel = () => {
		setIsModalOpen(false);
		setFieldsEditMode(false);
	};

	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 10,
		total: 0,
	});

	const columns = [
		{
			title: "Component",
			dataIndex: "name",
			// sorter: true,
		},
		// {
		// 	title: "System",
		// 	dataIndex: "sysname",
		// 	// sorter: true,
		// },
		{
			title: "Descriptions",
			dataIndex: "id",
			render: (id: number, row: any) => {
				return (
					<span key={id}>
						<Button type="link" onClick={() => showModal(row)}>
							View/Edit Descriptions
						</Button>
					</span>
				);
			},
		},
		// {
		// 	title: "Frequency",
		// 	dataIndex: "frequency",
		// 	render: (id: number, row: any) => (
		// 		<>
		// 			{frequency?.find((x: any) => x.id === id)?.name || "nil"}{" "}
		// 			<Tooltip title="Edit frequency">
		// 				<Button
		// 					style={{ float: "right" }}
		// 					size="small"
		// 					shape="circle"
		// 					icon={<EditOutlined />}
		// 					onClick={() => showFrequencyModal(id, row)}
		// 				></Button>
		// 			</Tooltip>
		// 		</>
		// 	),
		// },
		{
			title: "Created By",
			dataIndex: "createdby",
			width: "20%",
			render: (username: string, row: any) => (
				<>
					<Avatar size="small" icon={<UserOutlined />} />
					&nbsp;
					{username}
				</>
			),
		},
		{
			title: "Action",
			dataIndex: "id",
			render: (id: number) => (
				<Popconfirm
					title="Are you sure to delete?"
					onConfirm={() => deleteRow(id)}
					// onCancel={cancel}
					okText="Delete"
					cancelText="Cancel"
					placement="left"
				>
					<div className="delete-table-action">
						<DeleteOutlined />
					</div>
				</Popconfirm>
			),
			width: "5%",
		},
	];

	interface fieldsProps {
		row: any;
	}

	const deleteRow = (id: number) => {
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			apiCall({
				method: "DELETE",
				url: "/devicemaster",
				data: { data: { id } },
				handleResponse: (res) => {
					message.success(res.data.message);
					fetchData();
					resolve(res);
				},
				handleError: (err) => {
					reject(err);
				},
			});
		});
	};

	const fetchData = (
		curr_pagination: any = pagination,
		search: string = searchText
	) => {
		setLoading(true);
		setShowClose(search ? true : false);
		apiCall({
			method: "GET",
			url: `/devicemaster?system_id=${system_id}&page=${
				curr_pagination.current
			}&limit=${curr_pagination.pageSize}&searchText=${search || ""}`,
			handleResponse: (res) => {
				setData(res.data.message);
				setLoading(false);
				if (res.data.message.length > 0) {
					let total = res.data.message[0].full_count;
					setPagination({ ...curr_pagination, current: 1, total });
				}
			},
			handleError: () => {
				setLoading(false);
			},
		});
	};

	const saveEditedData = (values: any, prevData: any) => {
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			console.log("Received values of form: ", values);
			setEditLoading(true);
			if (!values.hasOwnProperty("general_fields"))
				values["general_fields"] = prevData.general_fields;
			if (!values.hasOwnProperty("inspection_fields"))
				values["inspection_fields"] = prevData.inspection_fields;
			if (!values.hasOwnProperty("testing_fields"))
				values["testing_fields"] = prevData.testing_fields;
			if (!values.hasOwnProperty("maintenance_fields"))
				values["maintenance_fields"] = prevData.maintenance_fields;
			apiCall({
				method: "PUT",
				url: "/devicemaster",
				data: values,
				handleResponse: (res) => {
					resolve(res);
					setEditLoading(false);
					message.success(res.data.message);
					// setVisible(false);
					fetchData();
				},
				handleError: (err) => {
					reject(err);
					setEditLoading(false);
				},
			});
		});
	};

	const search = (clear: boolean = false) => {
		let text = clear ? "" : searchText;
		if (clear) setSearchText("");
		fetchData(
			{
				pageSize: 10,
				current: 1,
			},
			text
		);
	};

	const saveFrequency = () => {
		setSavingFrequency(true);
		let {
			id,
			general_fields,
			inspection_fields,
			testing_fields,
			maintenance_fields,
		} = selectedDevice;
		apiCall({
			method: "PUT",
			url: "/devicemaster",
			data: {
				id,
				frequency: newFrequency,
				general_fields,
				inspection_fields,
				testing_fields,
				maintenance_fields,
			},
			handleResponse: (res) => {
				fetchData();
				setSavingFrequency(false);
				message.success(res.data.message);
				setFrequencyModal(false);
				setNewFrequency(0);
			},
			handleError: (err) => {
				setSavingFrequency(false);
			},
		});
	};

	useEffect(() => {
		search();
		apiCall({
			method: "GET",
			url: "/dropdown/systemtypes",
			handleResponse: (res) => {
				setSystems(res.data.message);
			},
		});
		apiCall({
			method: "GET",
			url: "/dropdown/frequency",
			handleResponse: (res) => {
				setFrequency(res.data.message);
			},
		});
	}, []);

	const handleTableChange = (newPagination: any) => {
		fetchData(newPagination);
	};

	const PropertiesFields: FC<any> = ({
		fields,
		add,
		remove,
		parent_name,
	}: any) => {
		return (
			<Row>
				<Col span={24}>
					{fields.map(({ key, name, ...restField }: any, index: number) => (
						<Row key={key}>
							<Col className="field-list-number" span={1}>
								{index + 1}
							</Col>
							<Col span={14}>
								<Form.Item
									{...restField}
									name={[name, "name"]}
									rules={[
										{
											required: true,
											message: "Missing Field",
										},
									]}
								>
									<Input
										className="selected-building"
										disabled={!fieldsEditMode}
										placeholder="Name"
									/>
								</Form.Item>
							</Col>
							<Col span={4} style={{ paddingLeft: "10px" }}>
								<Form.Item
									{...restField}
									name={[name, "type"]}
									rules={[
										{
											required: true,
											message: "Missing Type",
										},
									]}
								>
									<Select
										className="selected-building"
										disabled={!fieldsEditMode}
										placeholder="Field Type"
									>
										<Select.Option value="text">Text</Select.Option>
										<Select.Option value="number">Number</Select.Option>

										<Select.Option value="boolean">Yes / No</Select.Option>
									</Select>
								</Form.Item>
							</Col>
							<Col span={3} style={{ paddingLeft: "10px" }}>
								<Form.Item
									{...restField}
									name={[name, "mandatory"]}
									rules={[
										{
											required: true,
											message: "Enter a value",
										},
									]}
									valuePropName="checked"
									initialValue={false}
								>
									{/* <Select
								className="selected-building"
								disabled={!fieldsEditMode}
								placeholder="Optional/Required"
							>
								<Select.Option value={1}>Required</Select.Option>
								<Select.Option value={0}>Optional</Select.Option>
							</Select> */}
									<Checkbox
										className="selected-building"
										disabled={!fieldsEditMode}
									>
										Required
									</Checkbox>
								</Form.Item>
							</Col>
							<Col span={1} style={{ paddingLeft: "10px" }}>
								{fieldsEditMode && (
									<MinusCircleOutlined
										className="form-item-icons"
										onClick={() => remove(name)}
									/>
								)}
							</Col>
							<Form.Item
								noStyle
								shouldUpdate={(prevValues, currentValues) =>
									prevValues[parent_name][name]?.type !==
									currentValues[parent_name][name]?.type
								}
							>
								{({ getFieldValue }) =>
									getFieldValue([parent_name, name, "type"]) === "condition" ? (
										<>
											<Col
												style={{
													paddingLeft: "35px",
												}}
											>
												{"-"}
											</Col>
											<Col
												span={7}
												style={{
													paddingLeft: "8px",
												}}
											>
												<Form.Item
													{...restField}
													name={[name, "condition"]}
													rules={[
														{
															required: true,
															message: "Missing Field",
														},
													]}
												>
													<Select
														disabled={!fieldsEditMode}
														className="selected-building"
														placeholder="Condition"
													>
														<Select.Option value="in_between">
															In Between
														</Select.Option>
														<Select.Option value="not_between">
															Not Between
														</Select.Option>
														<Select.Option value="equals_to">
															Equals To
														</Select.Option>
														<Select.Option value="not_equals_to">
															Not Equals To
														</Select.Option>
														<Select.Option value="greater_than">
															Greater Than
														</Select.Option>
														<Select.Option value="lesser_than">
															Lesser Than
														</Select.Option>
													</Select>
												</Form.Item>
											</Col>
											<Col
												span={6}
												style={{
													paddingLeft: "10px",
												}}
											>
												<Form.Item
													{...restField}
													name={[name, "value_1"]}
													rules={[
														{
															required: true,
															message: "Missing Field",
														},
													]}
												>
													<Select
														disabled={!fieldsEditMode}
														className="selected-building"
														placeholder="Value 1"
													>
														{getFieldValue("general_fields").map((row: any) =>
															row?.type && row?.type === "number" ? (
																<Select.Option value={row.name}>
																	{row.name}
																</Select.Option>
															) : null
														)}
													</Select>
												</Form.Item>
											</Col>
											<Col
												span={6}
												style={{
													paddingLeft: "10px",
												}}
											>
												<Form.Item
													noStyle
													shouldUpdate={(prevValues, currentValues) =>
														prevValues[parent_name][name]?.condition !==
														currentValues[parent_name][name]?.condition
													}
												>
													{({ getFieldValue }) =>
														getFieldValue([parent_name, name, "condition"]) &&
														(getFieldValue([parent_name, name, "condition"]) ===
															"in_between" ||
															getFieldValue([
																parent_name,
																name,
																"condition",
															]) === "not_between") ? (
															<Form.Item
																{...restField}
																name={[name, "value_2"]}
																rules={[
																	{
																		required: true,
																		message: "Missing Field",
																	},
																]}
															>
																<Select
																	disabled={!fieldsEditMode}
																	className="selected-building"
																	placeholder="Value 2"
																>
																	{getFieldValue("general_fields").map(
																		(row: any) =>
																			row?.type && row?.type === "number" ? (
																				<Select.Option value={row.name}>
																					{row.name}
																				</Select.Option>
																			) : null
																	)}
																</Select>
															</Form.Item>
														) : null
													}
												</Form.Item>
											</Col>
											<Col
												span={2}
												style={{
													paddingLeft: "10px",
												}}
											>
												{fieldsEditMode ? (
													<Tooltip
														placement="right"
														title="Define atleast one numerical field before adding a condition in General Fields Section"
													>
														<QuestionCircleOutlined className="form-item-icons" />
													</Tooltip>
												) : null}
											</Col>
										</>
									) : null
								}
							</Form.Item>
						</Row>
					))}

					{fieldsEditMode && (
						<Form.Item>
							<Button
								type="dashed"
								onClick={() => add()}
								block
								icon={<PlusOutlined />}
								disabled={!fieldsEditMode}
							>
								Add field
							</Button>
						</Form.Item>
					)}
				</Col>
			</Row>
		);
	};

	const GeneralProperties: FC = () => {
		const parent_name = "general_fields";
		return (
			<Form.List name={parent_name}>
				{(fields, { add, remove }) => (
					<PropertiesFields
						fields={fields}
						add={add}
						remove={remove}
						parent_name={parent_name}
					/>
				)}
			</Form.List>
		);
	};

	const InspectionProperties: FC = () => {
		const parent_name = "inspection_fields";
		return (
			<Form.List name={parent_name}>
				{(fields, { add, remove }) => (
					<PropertiesFields
						fields={fields}
						add={add}
						remove={remove}
						parent_name={parent_name}
					/>
				)}
			</Form.List>
		);
	};

	const TestingProperties: FC = () => {
		const parent_name = "testing_fields";
		return (
			<Form.List name={parent_name}>
				{(fields, { add, remove }) => (
					<PropertiesFields
						fields={fields}
						add={add}
						remove={remove}
						parent_name={parent_name}
					/>
				)}
			</Form.List>
		);
	};

	const MaintenanceProperties: FC = () => {
		const parent_name = "maintenance_fields";
		return (
			<Form.List name={parent_name}>
				{(fields, { add, remove }) => (
					<PropertiesFields
						fields={fields}
						add={add}
						remove={remove}
						parent_name={parent_name}
					/>
				)}
			</Form.List>
		);
	};

	return (
		<>
			<Row style={{ marginBottom: 10 }}>
				<Col span={12}>
					<Search
						className="table-search"
						placeholder="Search using Column Values"
						onChange={(e) => setSearchText(e.target.value)}
						onSearch={() => search()}
						value={searchText}
					/>
					{showClose && (
						<Button onClick={() => search(true)} icon={<CloseOutlined />} />
					)}
				</Col>
				<Col span={12} className="table-button">
					<DeviceCommonFields />
					<Button
						icon={<SyncOutlined />}
						style={{ marginRight: "5px" }}
						onClick={() => search()}
					>
						Refresh
					</Button>
					<AddNewDevice
						fetchData={fetchData}
						systems={systems}
						frequency={frequency}
						system_id={system_id}
					/>
				</Col>
			</Row>
			<Row>
				<Col span={24}>
					<Table
						columns={columns}
						rowKey={(record) => record.id}
						dataSource={data}
						pagination={pagination}
						loading={loading}
						onChange={handleTableChange}
						size="small"
						bordered
					/>
					{/* <div className="table-result-label">{`Showing ${
						(pagination.current - 1) * (pagination.pageSize || 10) + 1
					} - ${
						pagination.total <
						(pagination.current - 1) * (pagination.pageSize || 10) +
							(pagination.pageSize || 10)
							? pagination.total
							: (pagination.current - 1) * (pagination.pageSize || 10) +
							  (pagination.pageSize || 10)
					} out of ${pagination.total} records`}</div> */}
					<div className="table-result-label">{`Showing ${
						(pagination.current - 1) * (pagination.pageSize || 10) + 1
					} - ${
						pagination.total <
						(pagination.current - 1) * (pagination.pageSize || 10) +
							(pagination.pageSize || 10)
							? pagination.total
							: (pagination.current - 1) * (pagination.pageSize || 10) +
							  (pagination.pageSize || 10)
					} out of ${pagination.total} records`}</div>
				</Col>
			</Row>
			{/* <FieldsModal row={selectedDevice} /> */}
			<Modal
				title="Component Descriptions"
				width={"100%"}
				style={{ maxWidth: "800px", top: "20px" }}
				destroyOnClose={true}
				open={isModalOpen}
				onOk={handleOk}
				maskClosable={false}
				onCancel={handleCancel}
				footer={null}
				afterOpenChange={(open) => {
					fields_form.resetFields();
				}}
			>
				<Form
					form={fields_form}
					layout="vertical"
					name="form_in_modal"
					initialValues={{
						general_fields: selectedDevice?.general_fields || [],
					}}
					onFinish={() => {
						fields_form
							.validateFields()
							.then((values) => {
								values["id"] = selectedDevice.id;
								saveEditedData(values, selectedDevice).then(() => {
									setSelectedDevice({
										...selectedDevice,
										...values,
									});
									setFieldsEditMode(false);
								});
							})
							.catch((info) => {
								console.log("Validate Failed:", info);
							});
					}}
				>
					<Tabs
						style={{ marginTop: "10px" }}
						type="card"
						items={[
							{
								key: "1",
								label: "General Descriptions",
								children: <GeneralProperties />,
							},
						]}
						tabBarExtraContent={
							<>
								{fieldsEditMode ? (
									<Space size={3}>
										<Button
											onClick={() => {
												setFieldsEditMode(false);
												fields_form.resetFields();
											}}
										>
											Cancel
										</Button>
										<Button htmlType="submit" type="primary">
											Save {editLoading && <LoadingOutlined />}
										</Button>
									</Space>
								) : (
									<Button onClick={() => setFieldsEditMode(true)}>Edit</Button>
								)}
							</>
						}
					/>
				</Form>
			</Modal>
			<Modal
				open={frequencyModal}
				onCancel={closeFrequencyModal}
				title="Change Frequency"
				okText="Save"
				onOk={saveFrequency}
				confirmLoading={savingFrequency}
			>
				<Divider />
				<h4>Frequency</h4>
				<Select
					onChange={(e) => setNewFrequency(e)}
					value={newFrequency}
					style={{ width: "100%" }}
				>
					{frequency.map((f: any) => (
						<Select.Option value={f.id}>{f.name}</Select.Option>
					))}
				</Select>
				<br />
			</Modal>
		</>
	);
};

export default DevicesTable;
