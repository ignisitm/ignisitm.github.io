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
} from "antd";
import { useEffect, useState } from "react";
import { apiCall } from "../../axiosConfig";
import { SyncOutlined, CloseOutlined, DeleteOutlined } from "@ant-design/icons";
import { AxiosError, AxiosResponse } from "axios";
import AddNewBuildingController from "./AddNewBuildingController";
import { useLoaderContext } from "../../Components/Layout";
import { BCcontext } from "../../Helpers/Context";
const { Search } = Input;

const BuildingControllers = () => {
	const [data, setData] = useState();
	const [loading, setLoading] = useState(false);
	const [searchText, setSearchText] = useState("");
	const [showClose, setShowClose] = useState(false);
	const [users, setUsers] = useState([]);
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 10,
		total: 0,
	});

	const columns = [
		{
			title: "Controller ID",
			dataIndex: "id",
		},
		{
			title: "Assigned User Ids",
			dataIndex: "assigned_users",
			render: (users: any) => (
				<>
					{users.map((user: string) => (
						<Tag>{user}</Tag>
					))}
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

	const changeClientName = (id: number, val: string) => {
		return new Promise((resolve, reject) => {
			apiCall({
				method: "PUT",
				url: "/clientcontrollers",
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

	const deleteRow = (id: number) => {
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			apiCall({
				method: "DELETE",
				url: "/clientcontrollers",
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
			url: `/clientcontrollers?page=${curr_pagination.current}&limit=${
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

	const getContextVariables = () => {
		apiCall({
			method: "GET",
			url: "/dropdown/users",
			handleResponse: (res) => {
				console.log(res);
				setUsers(res.data.message);
			},
		});
	};

	useEffect(() => {
		search();
		getContextVariables();
	}, []);

	const handleTableChange = (newPagination: any) => {
		fetchData(newPagination);
	};

	return (
		<BCcontext.Provider value={{ users }}>
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
					<AddNewBuildingController fetchData={fetchData} />
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
		</BCcontext.Provider>
	);
};

export default BuildingControllers;
