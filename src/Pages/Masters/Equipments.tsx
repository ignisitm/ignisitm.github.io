import { Table, Row, Col, Input, Button, Popconfirm, message } from "antd";
import React, { useEffect, useState } from "react";
import { apiCall } from "../../axiosConfig";
// import AddNewClient from "./AddNewClient";
import { SyncOutlined, CloseOutlined, DeleteOutlined } from "@ant-design/icons";
import { AxiosError, AxiosResponse } from "axios";
import AddNewUser from "./AddNewUser";
import AddNewEquipment from "./AddNewEquipment";
const { Search } = Input;

const Equipments: React.FC<any> = ({ systems }) => {
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
			dataIndex: "name",
			ellipsis: true,
			// sorter: true,
		},
		{
			title: "Type",
			dataIndex: "type",
		},
		{
			title: "Description",
			dataIndex: "description",
			ellipsis: true,
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
				url: "/clientresources",
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
			url: `/clientresources?page=${curr_pagination.current}&limit=${
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
			<h3>Equipments</h3>
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
					{/* <AddNewClient fetchData={fetchData} /> */}
					<AddNewEquipment fetchData={fetchData} systems={systems} />
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

export default Equipments;
