import {
	Table,
	Row,
	Col,
	Input,
	Button,
	Popconfirm,
	message,
	Typography,
	Modal,
	Form,
	Tag,
	Select,
	Popover,
	Drawer,
	Space,
} from "antd";
import { useContext, useEffect, useState } from "react";
import { apiCall } from "../../axiosConfig";
import { SyncOutlined, CloseOutlined, DeleteOutlined } from "@ant-design/icons";
import { AxiosError, AxiosResponse } from "axios";
import { SystemContext } from "../../Helpers/Context";
import AddNewProcedure from "./AddNewProcedure";
import Filter from "../../Components/Filter";
const { Search } = Input;
const { Text } = Typography;

const statusColors = {
	ACTIVE: "green",
	INACTIVE: "orange",
	INVALID: "",
	EXPIRED: "red",
	"NO CONTRACT": "gold",
};

const ProcedureTable = () => {
	const contextVariables = useContext(SystemContext);
	const [data, setData] = useState();
	const [loading, setLoading] = useState(false);
	const [searchText, setSearchText] = useState("");
	const [openContract, setOpenContract] = useState(false);
	const [selectedSystem, setSelectedSystem] = useState<any>(null);
	const [drawerFields, setDrawerFields] = useState<any>(null);
	const [drawerInfo, setDrawerInfo] = useState<any>(null);
	const [confirmLoading, setConfirmLoading] = useState(false);
	const [showClose, setShowClose] = useState(false);
	const [drawerVisible, setDrawerVisible] = useState(false);
	const [form] = Form.useForm();
	const [GI_form] = Form.useForm();
	const [filters, setFilters] = useState<object | null>(null);
	const [editMode, setEditMode] = useState(false);
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 10,
		total: 0,
	});

	const openDrawer = () => {
		setDrawerVisible(true);
	};

	const closeDrawer = () => {
		setDrawerVisible(false);
	};

	const openEditMode = () => {
		setEditMode(true);
	};

	const closeEditMode = () => {
		setEditMode(false);
	};

	const columns = [
		{
			title: "Code",
			dataIndex: "code",
			render: (text: string) => <b>{text}</b>,
		},
		{
			title: "Procedure",
			dataIndex: "procedure",
		},
		{
			title: "System",
			dataIndex: "system_id",
		},

		{
			title: "Frequency",
			dataIndex: "frequency_name",
		},
		{
			title: "AHJ",
			dataIndex: "name",
		},
		{
			title: "Last Service",
			dataIndex: "last_service",
			render: (date: string) => <>{formatDate(date)}</>,
		},
		{
			title: "Next Service",
			dataIndex: "next_service",
			render: (date: string) => <>{formatDate(date)}</>,
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

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);

		// Extract day, month, and year
		const day = String(date.getDate()).padStart(2, "0");
		const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
		const year = date.getFullYear();

		// Format as dd-mm-yyyy
		return `${day}-${month}-${year}`;
	};

	const deleteRow = (id: number) => {
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			apiCall({
				method: "DELETE",
				url: "/clientsystems",
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
			method: "POST",
			url: `/clientfilters/procedures?page=${curr_pagination.current}&limit=${
				curr_pagination.pageSize
			}&searchText=${search || ""}`,
			handleResponse: (res) => {
				setData(res.data.message);
				setLoading(false);
				if (res.data.message.length > 0) {
					let total = res.data.message[0].full_count;
					setPagination({ ...curr_pagination, total });
				} else {
					setPagination({ ...curr_pagination, total: 0 });
				}
			},
			handleError: () => {
				setLoading(false);
			},
			...(filters ? { data: filters } : {}),
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

	const onCreate = (values: any) => {
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			console.log("Received values of form: ", values);
			let responseData;
			if (values?.contract_id) {
				responseData = { ...values, id: selectedSystem };
			} else {
				responseData = {
					general_information: { ...values },
					id: selectedSystem,
				};
			}
			setConfirmLoading(true);
			apiCall({
				method: "PUT",
				url: "/clientsystems",
				data: responseData,
				handleResponse: (res) => {
					resolve(res);
					setConfirmLoading(false);
					setOpenContract(false);
					fetchData();
					message.success(res.data.message);
				},
				handleError: (err) => {
					reject(err);
					setConfirmLoading(false);
				},
			});
		});
	};

	useEffect(() => {
		search();
	}, []);

	const onCancel = () => {
		setOpenContract(false);
	};

	const handleTableChange = (newPagination: any) => {
		fetchData(newPagination);
	};

	return (
		<Filter
			onApply={(filterValues: any) => {
				setFilters(filterValues);
				console.log(filterValues);
			}}
			items={[
				{
					key: "name",
					label: "System Name",
					placeholder: "Filter by System Name",
					type: "search",
					group: "system",
				},
				{
					key: "tag",
					label: "System Tag",
					type: "search",
					group: "system",
				},
			]}
		>
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
					<AddNewProcedure fetchData={fetchData} />
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
				open={openContract}
				title="Assign Contract"
				okText="Assign"
				maskClosable={false}
				cancelText="Cancel"
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
				<Form form={form} layout="vertical" name="form_in_modal">
					<Form.Item
						name="contract_id"
						label="Select Contract"
						rules={[
							{
								required: true,
								message: "Please select a Contract",
							},
						]}
					>
						<Select
							showSearch
							placeholder="Search to Select"
							optionFilterProp="children"
							filterOption={(input, option) =>
								(option!.children as unknown as string)
									.toLowerCase()
									.includes(input)
							}
							filterSort={(optionA, optionB) =>
								(optionA!.children as unknown as string)
									.toLowerCase()
									.localeCompare(
										(optionB!.children as unknown as string).toLowerCase()
									)
							}
						>
							{contextVariables.contracts?.map(
								(item: { id: object; title: string }, index: number) => (
									<Select.Option
										value={item.id}
									>{`${item.id} - ${item.title}`}</Select.Option>
								)
							)}
						</Select>
					</Form.Item>
				</Form>
			</Modal>
			<Drawer
				destroyOnClose={true}
				title="General Information"
				placement="right"
				onClose={closeDrawer}
				open={drawerVisible}
				extra={
					editMode ? (
						<Space>
							<Button
								onClick={() => {
									closeEditMode();
									GI_form.resetFields();
								}}
							>
								Cancel
							</Button>
							<Button
								loading={confirmLoading}
								onClick={() => {
									GI_form.submit();
								}}
								type="primary"
							>
								Save
							</Button>
						</Space>
					) : (
						<Button onClick={openEditMode}>Edit</Button>
					)
				}
			></Drawer>
		</Filter>
	);
};

export default ProcedureTable;
