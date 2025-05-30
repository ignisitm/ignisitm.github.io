import {
	Table,
	Row,
	Col,
	Input,
	Button,
	Popconfirm,
	message,
	Tooltip,
	Tag,
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
import AddNewContract from "./AddNewContract";
import { Link } from "react-router-dom";
import Filter from "../../Components/Filter";
const { Search } = Input;

const statusColors = {
	ACTIVE: "green",
	INACTIVE: "orange",
	INVALID: "",
	EXPIRED: "red",
};

const ContractsTable = () => {
	const [data, setData] = useState();
	const [loading, setLoading] = useState(false);
	const [searchText, setSearchText] = useState("");
	const [showClose, setShowClose] = useState(false);
	const [filters, setFilters] = useState<object | null>(null);
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 10,
		total: 0,
	});

	const columns = [
		{
			title: "Contract No.",
			dataIndex: "id",
			// sorter: true,
			ellipsis: true,
			render: (text: any) => (
				<Tooltip title="View Contract" placement="left">
					<Link to={`../contract/${text}`}>
						<a type="link" style={{ textOverflow: "ellipsis" }}>
							{text}
						</a>
					</Link>
				</Tooltip>
			),
		},
		{
			title: "Title",
			dataIndex: "title",
			width: "40%",
			ellipsis: true,
		},
		{
			title: "Status",
			dataIndex: "status",
			render: (text: string) => (
				<Tag color={statusColors[text as keyof typeof statusColors]}>
					{text}
				</Tag>
			),
		},
		{
			title: "Action",
			dataIndex: "id",
			render: (id: number) => (
				<Tooltip title="Remove">
					<Popconfirm
						title="Are you sure you want remove to the Contract?"
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
				url: "/clientcontracts",
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
			url: `/clientfilters/contracts?page=${curr_pagination.current}&limit=${
				curr_pagination.pageSize
			}&searchText=${search || ""}`,
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

	useEffect(() => {
		search();
	}, []);

	useEffect(() => {
		fetchData();
	}, [filters]);

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
					key: "id",
					label: "Contract No",
					type: "search",
					group: "contract",
				},
				{
					key: "title",
					label: "Contract Title",
					type: "search",
					group: "contract",
				},
				{
					key: "status",
					group: "contract",
					label: "Contract Status",
					type: "checkbox",
					options: [
						{ label: "Active", value: "ACTIVE" },
						{ label: "Expired", value: "EXPIRED" },
					],
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
					<AddNewContract fetchData={fetchData} />
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
		</Filter>
	);
};

export default ContractsTable;
