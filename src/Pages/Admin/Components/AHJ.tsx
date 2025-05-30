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
	Spin,
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
} from "@ant-design/icons";
import { AxiosError, AxiosResponse } from "axios";
import AddNewAhj from "./AddNewAhj";
import AHJForms from "./AHJForms";
import { useLoaderContext } from "../../../Components/Layout";

const { Search } = Input;

const AHJ = () => {
	const [data, setData] = useState([]);
	const { completeLoading } = useLoaderContext();
	const [loading, setLoading] = useState(true);
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
			url: `/ahjform?page=${curr_pagination.current}&limit=${
				curr_pagination.pageSize
			}&searchText=${search || ""}`,
			handleResponse: (res) => {
				setData(res.data.message);
				completeLoading();
				setLoading(false);
				if (res.data.message.length > 0) {
					let total = res.data.message[0].full_count;
					setPagination({ ...curr_pagination, current: 1, total });
				}
			},
			handleError: () => {
				setLoading(false);
				completeLoading();
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
		<div style={{ paddingTop: "10px" }}>
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
					<AddNewAhj fetchData={fetchData} />
				</Col>
			</Row>
			<Row>
				<Col span={24}>
					{/* <Table
						columns={columns}
						rowKey={(record) => record.id}
						dataSource={data}
						pagination={pagination}
						loading={loading}
						onChange={handleTableChange}
						size="small"
						bordered
					/> */}
					{loading ? (
						<div className="loader-container transparent-load">
							<Spin tip="Loading">
								<span />
							</Spin>
						</div>
					) : null}
					<AHJForms forms={data} fetchData={fetchData} />
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
				</Col>
			</Row>
			<Modal
				title="General Fields"
				destroyOnClose={true}
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
		</div>
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
					<Col span={10}>
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
					<Col span={10} style={{ paddingLeft: "10px" }}>
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
								<Select.Option value="condition">Condition</Select.Option>
								<Select.Option value="boolean">Yes / No</Select.Option>
							</Select>
						</Form.Item>
					</Col>
					<Col span={2} style={{ paddingLeft: "10px" }}>
						{fieldsEditMode && (
							<MinusCircleOutlined onClick={() => remove(name)} />
						)}
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

export default AHJ;
