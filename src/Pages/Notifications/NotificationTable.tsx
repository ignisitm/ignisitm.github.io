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
	Space,
	Tag,
	Tabs,
	Drawer,
} from "antd";
import { useEffect, useState } from "react";
import { apiCall } from "../../axiosConfig";
import AddNewNotification from "./AddNewNotification";
import {
	SyncOutlined,
	CloseOutlined,
	DeleteOutlined,
	ToolOutlined,
	LoadingOutlined,
	PlusOutlined,
} from "@ant-design/icons";
import { AxiosError, AxiosResponse } from "axios";
import CreateNewWorkOrder from "./CreateNewWorkOrder";
import AddNotification from "./AddNotification";
const { Search } = Input;
const { Text } = Typography;

const statusColors = {
	OPEN: "gold",
	CLOSED: "blue",
	"WO CREATED": "green",
};

const NotificationTable = () => {
	const [page, setPage] = useState("Notifications");
	const [data, setData] = useState();
	const [loading, setLoading] = useState(false);
	const [searchText, setSearchText] = useState("");
	const [showClose, setShowClose] = useState(false);
	const [runningMC, setRunningMC] = useState(false);
	const [openDrawer, setOpenDrawer] = useState(false);
	const [status, setStatus] = useState("ALL");
	const [drawerDetails, setDrawerDetails] = useState<any>(null);
	const [loadingDrawer, setLoadingDrawer] = useState(false);
	const [drawerTitle, setDrawerTitle] = useState("Procedure");
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 10,
		total: 0,
	});

	const columns = [
		{
			title: "Notification #",
			dataIndex: "id",
		},
		{
			title: "Description",
			dataIndex: "description",
		},
		{
			title: "Type",
			dataIndex: "type",
		},
		{
			title: "System Name",
			dataIndex: "system_name",
		},
		{
			title: "Tag",
			dataIndex: "system_tag",
		},
		{
			title: "Building",
			dataIndex: "building_name",
		},
		{
			title: "Status",
			dataIndex: "status",
			render: (text: any) => (
				<Tag color={statusColors[text as keyof typeof statusColors]}>
					{text}
				</Tag>
			),
		},
		{
			title: "Details",
			dataIndex: "id",
			render: (id: any, row: any) => (
				<Button
					type="link"
					onClick={() => {
						getDrawerDetails(id, row.type);
					}}
				>
					View {row.type === "ITM" ? "Procedures" : "Assets"}
				</Button>
			),
		},
		{
			title: "Action",
			dataIndex: "id",
			render: (id: number, row: any) => (
				<Space>
					{row.status === "OPEN" && (
						<>
							<CreateNewWorkOrder
								pending_procedures={row.procedure_ids}
								fetchData={fetchData}
								notification_id={id}
							/>
							<Popconfirm
								title="Are you sure to delete?"
								onConfirm={() => deleteRow(id, row)}
								// onCancel={cancel}
								okText="Delete"
								cancelText="Cancel"
								placement="left"
							>
								<div className="delete-table-action">
									<DeleteOutlined />
								</div>
							</Popconfirm>
						</>
					)}
				</Space>
			),
		},
	];

	const getDrawerDetails = (id: any, type: string) => {
		setDrawerTitle(
			type === "ITM" ? "Procedures" : type === "Corrective" ? "Asset" : ""
		);
		setOpenDrawer(true);
		setLoadingDrawer(true);
		setDrawerDetails(null);
		apiCall({
			method: "GET",
			url: `/clientnotifications/${id}`,
			handleResponse: (res) => {
				setDrawerDetails({ data: res.data.message.procedures, type });
				setLoadingDrawer(false);
			},
			handleError: (err) => {
				setLoadingDrawer(false);
			},
		});
	};

	const closeDrawer = () => {
		setDrawerTitle("");
		setOpenDrawer(false);
		setDrawerDetails(null);
	};

	const DrawerRender = () => {
		if (loadingDrawer)
			return (
				<>
					<LoadingOutlined /> Loading Data...
				</>
			);
		if (!drawerDetails) return <>No data</>;

		let { data, type } = drawerDetails;
		let columns;

		if (type === "ITM")
			columns = [
				{
					title: "Code",
					dataIndex: "code",
				},
				{
					title: "Procedure",
					dataIndex: "procedure",
				},
				{
					title: "Activity",
					dataIndex: "activity",
				},
				{
					title: "AHJ",
					dataIndex: "ahj",
				},
				{
					title: "Frequency",
					dataIndex: "frequency_name",
				},
			];
		else if (type === "Corrective")
			columns = [
				{
					title: "Tag",
					dataIndex: "tag",
				},
				{
					title: "Asset",
					dataIndex: "name",
				},
				{
					title: "Description",
					dataIndex: "description",
				},
			];
		else return <>No data</>;

		console.log(data, columns);
		return <Table dataSource={data} columns={columns} />;
	};

	const changeClientName = (id: number, val: string) => {
		return new Promise((resolve, reject) => {
			apiCall({
				method: "PUT",
				url: "/clientnotifications",
				data: { id: id, name: val },
				handleResponse: (res) => {
					resolve(res);
				},
				handleError: (err) => {
					reject(err);
				},
			});
		});
	};

	const deleteRow = (id: number, row: any) => {
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			apiCall({
				method: "DELETE",
				url: "/clientnotifications",
				data: {
					data: { id, type: row.type, procedure_ids: row.procedure_ids },
				},
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
		search: string = searchText,
		n_status: string = status
	) => {
		setLoading(true);
		setShowClose(search ? true : false);
		apiCall({
			method: "GET",
			url: `/clientnotifications?status=${n_status}&page=${
				curr_pagination.current
			}&limit=${curr_pagination.pageSize}&searchText=${search || ""}`,
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

	const runManualCheck = () => {
		setRunningMC(true);
		apiCall({
			method: "GET",
			url: "/ClientNotificationCheck",
			handleResponse: (res) => {
				console.log(res);
				search();
				setRunningMC(false);
			},
			handleError: (err) => {
				setRunningMC(false);
			},
		});
	};

	const onTabChange = (key: string) => {
		setStatus(key);
		fetchData({ ...pagination, current: 1 }, searchText, key);
	};

	return page === "newNotification" ? (
		<AddNotification
			goHome={() => setPage("Notifications")}
			fetchData={fetchData}
		/>
	) : (
		<>
			<Row style={{ marginBottom: 10 }}>
				<Col span={15}>
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
				<Col span={9} className="table-button">
					<Button
						icon={<SyncOutlined />}
						style={{ marginRight: "5px" }}
						onClick={() => search()}
					>
						Refresh
					</Button>
					<Button
						type="default"
						icon={<ToolOutlined />}
						style={{ marginRight: "5px" }}
						onClick={() => runManualCheck()}
						loading={runningMC}
					>
						Run Manual Check
					</Button>
					{/* <AddNewNotification fetchData={fetchData} /> */}
					<Button
						icon={<PlusOutlined />}
						style={{ marginRight: "5px" }}
						onClick={() => setPage("newNotification")}
						type="primary"
					>
						Add Notification
					</Button>
				</Col>
			</Row>
			<Row>
				<Col span={24}>
					<Tabs
						defaultActiveKey={status}
						onChange={onTabChange}
						items={[
							{
								label: `ALL`,
								key: "ALL",
							},
							{
								label: `OPEN`,
								key: "OPEN",
							},
							{
								label: `WO CREATED`,
								key: "WO CREATED",
							},
							{
								label: `CLOSED`,
								key: "CLOSED",
							},
						]}
					/>
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
			<Drawer
				size="large"
				title={`${drawerTitle} Details`}
				onClose={closeDrawer}
				open={openDrawer}
			>
				<DrawerRender />
			</Drawer>
		</>
	);
};

export default NotificationTable;
