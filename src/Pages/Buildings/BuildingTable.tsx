import {
	Table,
	Row,
	Col,
	Input,
	Button,
	Popconfirm,
	message,
	Tooltip,
} from "antd";
import { useEffect, useState } from "react";
import { apiCall } from "../../axiosConfig";
import {
	SyncOutlined,
	CloseOutlined,
	DeleteOutlined,
	EyeOutlined,
	ArrowRightOutlined,
} from "@ant-design/icons";
import { AxiosError, AxiosResponse } from "axios";
import AddNewBuilding from "./AddNewBuilding";
import { Link } from "react-router-dom";
const { Search } = Input;

const BuildingTable = () => {
	const [data, setData] = useState();
	const [loading, setLoading] = useState(false);
	const [searchText, setSearchText] = useState("");
	const [showClose, setShowClose] = useState(false);
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 10,
		total: 0,
	});

	const columns = [
		{
			title: "Name",
			dataIndex: "building_name",
			// sorter: true,
			width: "65%",
			ellipsis: true,
			render: (text: any, record: any) => (
				<Tooltip title="View Building" placement="left">
					<Link to={`../building/${record.id}`}>
						<a type="link" style={{ textOverflow: "ellipsis" }}>
							{text}
						</a>
					</Link>
				</Tooltip>
			),
		},
		{
			title: "Area",
			dataIndex: "building_area",
			ellipsis: true,
		},
		{
			title: "Certificate No.",
			dataIndex: "building_completion_certificate_number",
			ellipsis: true,
		},
		{
			title: "Action",
			dataIndex: "id",
			render: (id: number) => (
				<Tooltip title="Remove">
					<Popconfirm
						title="Are you sure you want remove to the building?"
						onConfirm={() => deleteRow(id)}
						// onCancel={cancel}
						okText="Remove"
						cancelText="Cancel"
						placement="left"
					>
						<div className="delete-table-action">
							<DeleteOutlined />
						</div>
					</Popconfirm>
				</Tooltip>
			),
			width: "5%",
		},
		// {
		// 	title: "Action",
		// 	dataIndex: "id",
		// 	render: (id: number) => (
		// 		<>
		// 			<Tooltip title="View" color="black">
		// 				<div className="default-table-action">
		// 					<Link to={`../building/${id}`}>
		// 						<ArrowRightOutlined />
		// 					</Link>
		// 				</div>
		// 			</Tooltip>
		// 		</>
		// 	),
		// 	width: "70px",
		// },
	];

	const deleteRow = (id: number) => {
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			apiCall({
				method: "DELETE",
				url: "/clientbuildings",
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
			url: `/clientbuildings?page=${curr_pagination.current}&limit=${
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
					<AddNewBuilding fetchData={fetchData} />
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
						(pagination.current - 1) * pagination.pageSize + 1
					} - ${
						pagination.total <
						(pagination.current - 1) * pagination.pageSize + pagination.pageSize
							? pagination.total
							: (pagination.current - 1) * pagination.pageSize +
							  pagination.pageSize
					} out of ${pagination.total} records`}</div>
				</Col>
			</Row>
		</>
	);
};

export default BuildingTable;
