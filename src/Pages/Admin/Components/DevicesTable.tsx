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
} from "@ant-design/icons";
import { AxiosError, AxiosResponse } from "axios";
import AddNewDevice from "./AddNewDevice";
import { ModalStaticFunctions } from "antd/es/modal/confirm";
const { Search } = Input;

const mockSystems = [
	{
		id: 1,
		name: "Fire Alarm",
	},
	{
		id: 2,
		name: "Fire Extinguiser",
	},
];

const DeviceTable = () => {
	const [data, setData] = useState();
	const [loading, setLoading] = useState(false);
	const [searchText, setSearchText] = useState("");
	const [showClose, setShowClose] = useState(false);
	const [systems, setSystems] = useState<any>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [fields_form] = Form.useForm();
	const [fieldsEditMode, setFieldsEditMode] = useState(false);
	const [editLoading, setEditLoading] = useState(false);
	const [selectedDevice, setSelectedDevice] = useState<any>();

	const showModal = (row: any) => {
		setIsModalOpen(true);
		setSelectedDevice(row);
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
			title: "Device Name",
			dataIndex: "name",
			// sorter: true,
		},
		{
			title: "System",
			dataIndex: "sysname",
			// sorter: true,
		},
		{
			title: "Fields",
			dataIndex: "id",
			render: (id: number, row: any) => {
				return (
					<span key={id}>
						<Button type="link" onClick={() => showModal(row)}>
							View Fields
						</Button>
					</span>
				);
			},
		},
		{
			title: "Created By",
			dataIndex: "username",
			width: "20%",
			render: (username: string, row: any) => `${row.uname} (${username})`,
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
			url: `/devicemaster?page=${curr_pagination.current}&limit=${
				curr_pagination.pageSize
			}&searchText=${search || ""}`,
			handleResponse: (res) => {
				setData(res.data.message);
				setLoading(false);
				if (res.data.message.length > 0) {
					let total = res.data.message[0].full_count;
					setPagination({ ...curr_pagination, total });
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
				data: { client: values },
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

	useEffect(() => {
		search();
		apiCall({
			method: "GET",
			url: "/dropdown/systemtypes",
			handleResponse: (res) => {
				setSystems(res.data.message);
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
				{fields.map(({ key, name, ...restField }: any, index: number) => (
					<Fragment key={key}>
						<Col className="field-list-number" span={1}>
							{index + 1}
						</Col>
						<Col span={8}>
							<Form.Item
								{...restField}
								name={[name, "name"]}
								rules={[{ required: true, message: "Missing Field" }]}
							>
								<Input
									className="selected-building"
									disabled={!fieldsEditMode}
									placeholder="Field name"
								/>
							</Form.Item>
						</Col>
						<Col span={6} style={{ paddingLeft: "10px" }}>
							<Form.Item
								{...restField}
								name={[name, "type"]}
								rules={[{ required: true, message: "Missing Type" }]}
							>
								<Select
									className="selected-building"
									disabled={!fieldsEditMode}
									placeholder="Field Type"
								>
									<Select.Option value="text">Text</Select.Option>
									<Select.Option value="number">Number</Select.Option>
									{parent_name !== "general_fields" ? (
										<Select.Option value="condition">Condition</Select.Option>
									) : null}
									<Select.Option value="boolean">Yes / No</Select.Option>
								</Select>
							</Form.Item>
						</Col>
						<Col span={6} style={{ paddingLeft: "10px" }}>
							<Form.Item
								{...restField}
								name={[name, "mandatory"]}
								rules={[{ required: true, message: "Enter a value" }]}
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
						<Col span={2} style={{ paddingLeft: "10px" }}>
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
										<Col style={{ paddingLeft: "35px" }}>{"-"}</Col>
										<Col span={7} style={{ paddingLeft: "8px" }}>
											<Form.Item
												{...restField}
												name={[name, "condition"]}
												rules={[{ required: true, message: "Missing Field" }]}
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
										<Col span={6} style={{ paddingLeft: "10px" }}>
											<Form.Item
												{...restField}
												name={[name, "value_1"]}
												rules={[{ required: true, message: "Missing Field" }]}
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
										<Col span={6} style={{ paddingLeft: "10px" }}>
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
														getFieldValue([parent_name, name, "condition"]) ===
															"not_between") ? (
														<Form.Item
															{...restField}
															name={[name, "value_2"]}
															rules={[
																{ required: true, message: "Missing Field" },
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
										<Col span={2} style={{ paddingLeft: "10px" }}>
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
					</Fragment>
				))}
				<Col span={24}>
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
				<Col span={18}>
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
				<Col span={6} className="table-button">
					<Button
						icon={<SyncOutlined />}
						style={{ marginRight: "5px" }}
						onClick={() => search()}
					>
						Refresh
					</Button>
					<AddNewDevice fetchData={fetchData} systems={systems} />
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
					<div className="table-result-label">{`Showing ${
						(pagination.current - 1) * 10 + 1
					} - ${
						pagination.total < (pagination.current - 1) * 10 + 10
							? pagination.total
							: (pagination.current - 1) * 10 + 10
					} out of ${pagination.total} records`}</div>
				</Col>
			</Row>
			{/* <FieldsModal row={selectedDevice} /> */}
			<Modal
				title="Fields"
				destroyOnClose={true}
				open={isModalOpen}
				onOk={handleOk}
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
						inspection_fields: selectedDevice?.inspection_fields || [],
						testing_fields: selectedDevice?.testing_fields || [],
						maintenance_fields: selectedDevice?.maintenance_fields || [],
					}}
					onFinish={() => {
						fields_form
							.validateFields()
							.then((values) => {
								values["id"] = selectedDevice.id;
								saveEditedData(values, selectedDevice).then(() => {
									setSelectedDevice({ ...selectedDevice, ...values });
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
								label: "General",
								children: <GeneralProperties />,
							},
							{
								key: "2",
								label: "Inspection",
								children: <InspectionProperties />,
							},
							{
								key: "3",
								label: "Testing",
								children: <TestingProperties />,
							},
							{
								key: "4",
								label: "Maintenance",
								children: <MaintenanceProperties />,
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
		</>
	);
};

export default DeviceTable;
