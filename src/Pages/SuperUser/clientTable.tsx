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
} from "antd";
import { useEffect, useState } from "react";
import { apiCall } from "../../axiosConfig";
import AddNewClient from "./AddNewClient";
import { SyncOutlined, CloseOutlined, DeleteOutlined } from "@ant-design/icons";
import { AxiosError, AxiosResponse } from "axios";
const { Search } = Input;
const { Text } = Typography;

const ClientTable = () => {
	const [data, setData] = useState();
	const [loading, setLoading] = useState(false);
	const [searchText, setSearchText] = useState("");
	const [showClose, setShowClose] = useState(false);
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 10,
		total: 0,
	});
	const [modal, contextHolder] = Modal.useModal();
	const [changeNameLoading, setChangeNameLoading] = useState(false);

	const columns = [
		{
			title: "Name",
			dataIndex: "name",
			// sorter: true,
			render: (name: string, row: any) => {
				return (
					<Text
						editable={{
							onChange: (val) => {
								let renameConfirmationModal = modal.info({
									icon: null,
									footer: null,
									content: (
										<>
											Are you sure you want to rename client <b>{name}</b> to{" "}
											<b>{val}</b> {"?"}
											<div style={{ height: "24px" }} />
											<Space align="end" style={{ float: "right" }}>
												<Button
													loading={changeNameLoading}
													type="primary"
													onClick={() => {
														setChangeNameLoading(true);
														changeClientName(
															row.id,
															val,
															row.notification_frequency
														)
															.then((res) => {
																renameConfirmationModal.destroy();
																fetchData();
															})
															.finally(() => {
																setChangeNameLoading(false);
															});
													}}
												>
													Yes
												</Button>
												<Button
													type="default"
													onClick={() => renameConfirmationModal.destroy()}
												>
													No
												</Button>
											</Space>
										</>
									),
								});
							},
						}}
					>
						{name}
					</Text>
				);
			},
		},
		{
			title: "Client Portal",
			dataIndex: "client_id",
			render: (id: string) => (
				<Button
					style={{ paddingLeft: 0 }}
					type="link"
					onClick={() =>
						window.open(`https://${id}.staging.ignisitm.com`, "_blank")
					}
				>
					www.{id}.staging.ignisitm.com
				</Button>
			),
		},
		{
			title: "Notification Frequency",
			dataIndex: "notification_frequency",
			width: "20%",
			render: (name: any, row: any) => {
				return (
					<Text
						editable={{
							onChange: (val) => {
								let nf = parseInt(val);
								if (!nf) {
									message.error("Invalid Format");
								} else {
									let renameConfirmationModal = modal.info({
										icon: null,
										footer: null,
										content: (
											<>
												Are you sure you want to change notification frequency
												to <b>{nf}</b> {" days ?"}
												<div style={{ height: "24px" }} />
												<Space align="end" style={{ float: "right" }}>
													<Button
														loading={changeNameLoading}
														type="primary"
														onClick={() => {
															setChangeNameLoading(true);
															changeClientName(row.id, row.name, nf)
																.then((res) => {
																	renameConfirmationModal.destroy();
																	fetchData();
																})
																.finally(() => {
																	setChangeNameLoading(false);
																});
														}}
													>
														Yes
													</Button>
													<Button
														type="default"
														onClick={() => renameConfirmationModal.destroy()}
													>
														No
													</Button>
												</Space>
											</>
										),
									});
								}
							},
						}}
					>
						{name}
					</Text>
				);
			},
		},
		{
			title: "Country",
			dataIndex: "country",
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

	const changeClientName = (id: number, val: string, nf: number) => {
		return new Promise((resolve, reject) => {
			apiCall({
				method: "PUT",
				url: "/clients",
				data: { id: id, name: val, notification_frequency: nf },
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
				url: "/clients",
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
			url: `/clients?page=${curr_pagination.current}&limit=${
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
					<AddNewClient fetchData={fetchData} />
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
			{contextHolder}
		</>
	);
};

export default ClientTable;
