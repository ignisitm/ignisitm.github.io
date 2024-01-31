import { Table, Row, Col, Input, Button, Popconfirm, message, Tag } from "antd";
import React, { useEffect, useState } from "react";
import { apiCall } from "../../axiosConfig";
// import AddNewClient from "./AddNewClient";
import { SyncOutlined, CloseOutlined, DeleteOutlined } from "@ant-design/icons";
import { AxiosError, AxiosResponse } from "axios";
import AddNewUser from "./AddNewUser";
const { Search } = Input;

interface props {
	systems: any;
}

const ClientTable: React.FC<props> = ({ systems }) => {
	const [data, setData] = useState();
	const [employees, setEmployees] = useState([]);
	const [loading, setLoading] = useState(false);
	const [searchText, setSearchText] = useState("");
	const [showClose, setShowClose] = useState(false);
	const [userRoles, setUserRoles] = useState();
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 10,
		total: 0,
	});

	const columns = [
		{
			title: "Name",
			dataIndex: "name",
			// sorter: true,
		},
		{
			title: "Username",
			dataIndex: "username",
		},
		{
			title: "Role",
			dataIndex: "rolename",
		},
		{
			title: "Status",
			dataIndex: "status",
			render: (status: string) => (
				<Tag color={status === "ACTIVE" ? "green" : "red"}>{status}</Tag>
			),
		},
		{
			title: "Action",
			dataIndex: "username",
			render: (id: string, row: any) => (
				<>
					<Popconfirm
						title="Are you sure you want to reset this user?"
						onConfirm={() => resetRow(id)}
						// onCancel={cancel}
						okText="Reset"
						cancelText="Cancel"
						placement="left"
					>
						<Button type="link">Reset</Button>
					</Popconfirm>
					<Popconfirm
						title={`Are you sure you want to ${
							row.status === "ACTIVE" ? "deactivate" : "activate"
						} this user?`}
						onConfirm={() => deleteRow(id, row.status)}
						// onCancel={cancel}
						okText={row.status === "ACTIVE" ? "deactivate" : "activate"}
						cancelText="Cancel"
						placement="left"
					>
						<Button danger={row.status === "ACTIVE"} type="link">
							{row.status === "ACTIVE" ? "Deactivate" : "Activate"}
						</Button>
					</Popconfirm>
				</>
			),
		},
	];

	const deleteRow = (username: any, status: any) => {
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			apiCall({
				method: "DELETE",
				url: "/clientusers",
				data: {
					data: {
						username,
						status: status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
					},
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

	const resetRow = (username: any) => {
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			apiCall({
				method: "PUT",
				url: "/clientusers",
				data: { username },
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
			url: `/clientusers?page=${curr_pagination.current}&limit=${
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

	const getAllEmployeeID = () => {
		apiCall({
			method: "GET",
			url: "/dropdown/employees",
			handleResponse: (res) => {
				setEmployees(res.data.message);
			},
		});
	};

	useEffect(() => {
		search();
		getAllEmployeeID();
		getAllRoles();
	}, []);

	const getAllRoles = () => {
		apiCall({
			method: "GET",
			url: "/dropdown/clientRoles",
			handleResponse: (res) => {
				console.log(res);
				setUserRoles(res.data.message);
			},
		});
	};

	const handleTableChange = (newPagination: any) => {
		fetchData(newPagination);
	};

	return (
		<>
			<h3>Users</h3>
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
					<AddNewUser
						employees={employees}
						fetchData={fetchData}
						systems={systems}
						userRoles={userRoles}
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
		</>
	);
};

export default ClientTable;
