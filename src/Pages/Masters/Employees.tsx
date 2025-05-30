import {
	Table,
	Row,
	Col,
	Input,
	Button,
	Popconfirm,
	message,
	Space,
	Tooltip,
	Form,
	Modal,
	Select,
	InputNumber,
} from "antd";
import React, { FC, useEffect, useState } from "react";
import { apiCall } from "../../axiosConfig";
// import AddNewClient from "./AddNewClient";
import {
	SyncOutlined,
	CloseOutlined,
	DeleteOutlined,
	EditFilled,
} from "@ant-design/icons";
import { AxiosError, AxiosResponse } from "axios";
import AddNewUser from "./AddNewUser";
import AddNewEmployee from "./AddNewEmployee";
import { useLoaderContext } from "../../Components/Layoutv2";
const { Search } = Input;

const Employees: React.FC<any> = ({ systems }) => {
	const { completeLoading } = useLoaderContext();

	const [data, setData] = useState();
	const [loading, setLoading] = useState(false);
	const [searchText, setSearchText] = useState("");
	const [showClose, setShowClose] = useState(false);
	const [showEditModal, setShowEdit] = useState(false);
	const [editingData, setEditingData] = useState<any>({});
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 10,
		total: 0,
	});

	const columns = [
		{
			title: "Employee Id",
			dataIndex: "id",
			// sorter: true,
		},
		{
			title: "Full Name",
			dataIndex: "full_name",
		},
		{
			title: "Email",
			dataIndex: "email",
		},
		{
			title: "Contact No.",
			dataIndex: "phone",
		},
		{
			title: "Designation",
			dataIndex: "designation",
		},
		{
			title: "Action",
			dataIndex: "id",
			render: (id: number, row: any) => (
				<Space>
					<Tooltip title="Edit">
						<Button
							style={{ padding: 0, margin: 0, height: 0 }}
							type="link"
							onClick={() => {
								setEditingData({
									...row,
								});
								setShowEdit(true);
							}}
						>
							<EditFilled />
						</Button>
					</Tooltip>
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
				</Space>
			),
			width: "5%",
		},
	];

	const deleteRow = (id: number) => {
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			apiCall({
				method: "DELETE",
				url: "/clientemployees",
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
			url: `/clientemployees?page=${curr_pagination.current}&limit=${
				curr_pagination.pageSize
			}&searchText=${search || ""}`,
			handleResponse: (res) => {
				setData(res.data.message);
				setLoading(false);
				completeLoading();
				if (res.data.message.length > 0) {
					let total = res.data.message[0].full_count;
					setPagination({ ...curr_pagination, total });
				} else {
					setPagination({ ...curr_pagination, total: 0 });
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

	const EditEmp: FC<{ data: any; open: boolean }> = ({ data, open }) => {
		const [form] = Form.useForm();
		const [confirmLoading, setConfirmLoading] = useState(false);

		const onEdit = (values: any) => {
			return new Promise<any>((resolve, reject) => {
				apiCall({
					method: "PUT",
					url: `/clientemployees`,
					data: { data: { ...values }, id: data.id },
					handleResponse: (res) => {
						resolve(res);
					},
					handleError: (err) => reject(err),
				});
			});
		};
		return (
			<>
				<Modal
					open={open}
					title="Edit Employee Details"
					okText="Save Changes"
					maskClosable={false}
					cancelText="Cancel"
					destroyOnClose={true}
					onCancel={() => {
						form.resetFields();
						setShowEdit(false);
						setEditingData({});
					}}
					onOk={() => {
						form
							.validateFields()
							.then((values) => {
								setConfirmLoading(true);
								onEdit(values).then(() => {
									form.resetFields();
									setShowEdit(false);
									setEditingData({});
									setConfirmLoading(false);
									fetchData();
								});
							})
							.catch((info) => {
								console.log("Validate Failed:", info);
								setConfirmLoading(false);
							});
					}}
					confirmLoading={confirmLoading}
				>
					<Form
						form={form}
						preserve={false}
						name="editEqiupment"
						autoComplete="off"
						labelCol={{ span: 24, style: { paddingTop: 3 } }}
						wrapperCol={{ span: 24 }}
						size="small"
						initialValues={{ ...data }}
					>
						<Col span={24}>
							<Form.Item
								name="full_name"
								label="Full Name"
								rules={[{ required: true }]}
							>
								<Input />
							</Form.Item>
						</Col>
						<Col span={24}>
							<Form.Item
								name="designation"
								label="Designation"
								rules={[{ required: true }]}
							>
								<Input />
							</Form.Item>
						</Col>
						<Col span={24}>
							<Form.Item name="email" label="Email Address">
								<Input />
							</Form.Item>
						</Col>
						<Col span={24}>
							<Form.Item
								name="phone"
								label="Contact Number"
								rules={[
									{
										pattern: /^\d*$/,
										message: "Should contain only numbers",
									},
								]}
							>
								<Input />
							</Form.Item>
						</Col>
					</Form>
				</Modal>
			</>
		);
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
					{/* <AddNewClient fetchData={fetchData} /> */}
					<AddNewEmployee fetchData={fetchData} systems={systems} />
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
			<EditEmp data={editingData} open={showEditModal} />
		</>
	);
};

export default Employees;
