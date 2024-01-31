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
	Space,
	Tooltip,
	Checkbox,
	Typography,
} from "antd";
import { FC, Fragment, useEffect, useState } from "react";
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
import { useLoaderContext } from "../../../Components/Layout";

const { Search } = Input;
const { Text } = Typography;

const SystemsTable = () => {
	const { completeLoading } = useLoaderContext();
	const [data, setData] = useState();
	const [loading, setLoading] = useState(false);
	const [searchText, setSearchText] = useState("");
	const [showClose, setShowClose] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [fields_form] = Form.useForm();
	const [fieldsEditMode, setFieldsEditMode] = useState(false);
	const [editLoading, setEditLoading] = useState(false);
	const [selectedSystem, setSelectedSystem] = useState<any>();
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 10,
		total: 0,
	});

	const columns = [
		{
			title: "System Name",
			dataIndex: "name",
			// sorter: true,
		},
		{
			title: "General Fields",
			dataIndex: "id",
			render: (id: number, row: any) => {
				return (
					<span key={id}>
						<Button
							style={{ paddingLeft: 0 }}
							type="link"
							onClick={() => showModal(row)}
						>
							View / Edit
						</Button>
					</span>
				);
			},
			width: "200px",
		},
		{
			title: "Created By",
			dataIndex: "createdby",
			width: "20%",
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

	const deleteRow = (id: number) => {
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			apiCall({
				method: "DELETE",
				url: "/systemmaster",
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
			url: `/systemmaster?page=${curr_pagination.current}&limit=${
				curr_pagination.pageSize
			}&searchText=${search || ""}`,
			handleResponse: (res) => {
				setData(res.data.message);
				setLoading(false);
				completeLoading();
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
	}, []);

	const handleTableChange = (newPagination: any) => {
		fetchData(newPagination);
	};

	const showModal = (row: any) => {
		setIsModalOpen(true);
		setSelectedSystem(row);
	};

	const handleOk = () => {
		setIsModalOpen(false);
	};

	const handleCancel = () => {
		setIsModalOpen(false);
		setFieldsEditMode(false);
	};

	const ModalFooter = () => (
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
					<Button
						loading={editLoading}
						onClick={() => fields_form.submit()}
						type="primary"
					>
						Save
					</Button>
				</Space>
			) : (
				<Button onClick={() => setFieldsEditMode(true)}>Edit</Button>
			)}
		</>
	);

	const saveEditedData = (values: any, prevData: any) => {
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			console.log("Received values of form: ", values);
			setEditLoading(true);
			if (!values.hasOwnProperty("general_information"))
				values["general_information"] = prevData.general_information;
			apiCall({
				method: "PUT",
				url: "/systemmaster",
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
					<AddNewSystems fetchData={fetchData} />
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
			<Modal
				title="General Fields"
				destroyOnClose={true}
				width={"100%"}
				style={{ maxWidth: "800px", top: "20px" }}
				open={isModalOpen}
				onOk={handleOk}
				maskClosable={false}
				onCancel={handleCancel}
				footer={<ModalFooter />}
				afterOpenChange={(open) => {
					fields_form.resetFields();
				}}
			>
				<Form
					form={fields_form}
					layout="vertical"
					name="form_in_modal"
					initialValues={{
						general_information: selectedSystem?.general_information || [],
					}}
					onFinish={() => {
						fields_form
							.validateFields()
							.then((values) => {
								values["id"] = selectedSystem.id;
								saveEditedData(values, selectedSystem).then(() => {
									setSelectedSystem({ ...selectedSystem, ...values });
									setFieldsEditMode(false);
								});
							})
							.catch((info) => {
								console.log("Validate Failed:", info);
							});
					}}
				>
					<Form.List name="general_information">
						{(fields, { add, remove }) => (
							<PropertiesFields
								fields={fields}
								add={add}
								remove={remove}
								fieldsEditMode={fieldsEditMode}
							/>
						)}
					</Form.List>
					{/* <Tabs
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
					/> */}
				</Form>
			</Modal>
		</>
	);
};

const PropertiesFields: FC<any> = ({ fields, add, remove, fieldsEditMode }) => {
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
								<Select.Option value="longtext">Long Text</Select.Option>
								<Select.Option value="dropdown">Dropdown</Select.Option>
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
					<Col span={24}>
						<Form.Item
							noStyle
							shouldUpdate={(prevValues, currentValues) =>
								prevValues.general_information[name]?.type !==
								currentValues.general_information[name]?.type
							}
						>
							{({ getFieldValue }) =>
								getFieldValue(["general_information", name, "type"]) ===
								"dropdown" ? (
									<Row>
										<Col style={{ paddingLeft: "35px" }}>{"-"}</Col>
										<Col span={18} style={{ paddingLeft: "8px" }}>
											<Form.Item
												{...restField}
												name={[name, "data"]}
												rules={[
													{
														required: true,
														message: "No options added for dropdown",
													},
												]}
												noStyle
											>
												<Select
													className="selected-building"
													disabled={!fieldsEditMode}
													mode="tags"
													placeholder="Insert Dropdown Options"
													tokenSeparators={[","]}
													dropdownStyle={{ display: "none" }}
													style={{ width: "100%" }}
													suffixIcon={<></>}
												>
													{" "}
												</Select>
											</Form.Item>
											<Text type="secondary" italic>
												Use Comma(,) to separate values.
											</Text>
											<Form.Item
												{...restField}
												name={[name, "others"]}
												rules={[
													{
														required: true,
														message: "No options added for dropdown",
													},
												]}
												valuePropName="checked"
												initialValue={false}
											>
												<Checkbox disabled={!fieldsEditMode}>
													Include 'Others' in dropdown options
												</Checkbox>
											</Form.Item>
										</Col>
										<Col span={2} style={{ paddingLeft: "10px" }}>
											<Tooltip
												placement="right"
												title={
													<div style={{ margin: "10px" }}>
														If the dropdown options are:
														<br />
														Fire
														<br />
														Water
														<br />
														Air
														<br />
														<br />
														Then it has to be entered Like:
														<br />
														<Text style={{ color: "white" }} keyboard>
															Fire, Water, Air
														</Text>
													</div>
												}
											>
												<QuestionCircleOutlined className="form-item-icons" />
											</Tooltip>
										</Col>
									</Row>
								) : null
							}
						</Form.Item>
					</Col>
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

export default SystemsTable;
