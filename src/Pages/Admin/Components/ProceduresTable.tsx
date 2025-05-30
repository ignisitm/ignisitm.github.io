import {
	Table,
	Row,
	Col,
	Input,
	Button,
	Popconfirm,
	message,
	Popover,
	Checkbox,
	Card,
	Spin,
	Select,
	Tooltip,
	Space,
	List,
} from "antd";
import { FC, Fragment, useContext, useEffect, useState } from "react";
import { apiCall } from "../../../axiosConfig";
import {
	SyncOutlined,
	CloseOutlined,
	DeleteOutlined,
	LoadingOutlined,
	EditFilled,
} from "@ant-design/icons";
import { AxiosError, AxiosResponse } from "axios";
import AddNewProcedure from "./AddNewProcedure";
import DeviceTransferList from "./DeviceTransferList";
import { sortBy } from "lodash";
import { isEqual } from "lodash";
import { AHJFormContext } from "../../../Helpers/Context";
import EditProcedure from "./EditProcedures";
const { Search } = Input;

interface props {
	system: number;
	activity: string;
	ahj: number;
}

interface DeviceProps {
	selectedDevices: Array<number>;
	id: number;
	savingChanges: boolean;
}

const ProceduresTable: FC<props> = ({ system, activity, ahj }) => {
	const cv = useContext(AHJFormContext);
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [searchText, setSearchText] = useState("");
	const [showClose, setShowClose] = useState(false);
	const [savingChanges, setSavingChanges] = useState(false);
	const [editModal, setEditModal] = useState(false);
	const [editingData, setEditingData] = useState<any>(null);
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 10,
		total: 0,
	});
	const [devices, setDevices] = useState<any>([]);

	// REMOVED EDIT OPTION FROM DEVICELIST
	// const DeviceList: FC<DeviceProps> = ({
	// 	selectedDevices,
	// 	id,
	// 	savingChanges,
	// }) => {
	// 	const [newChangedDevices, setNewChangedDevices] =
	// 		useState<Array<number>>(selectedDevices);

	// 	useEffect(() => {
	// 		console.log("savingChanges");
	// 		// setNewChangedDevices(selectedDevices);
	// 	}, []);

	// 	return false ? (
	// 		<div style={{ height: "100px", width: "600px", paddingTop: "100px" }}>
	// 			<Spin tip="Loading">
	// 				<span />
	// 			</Spin>
	// 		</div>
	// 	) : (
	// 		<Fragment>
	// 			<DeviceTransferList
	// 				setSelectedDevices={setNewChangedDevices}
	// 				selectedDevices={newChangedDevices}
	// 				devices={devices}
	// 			/>
	// 			<div>
	// 				<Button
	// 					style={{ marginTop: 10 }}
	// 					type="primary"
	// 					disabled={isEqual(
	// 						sortBy(selectedDevices),
	// 						sortBy(newChangedDevices)
	// 					)}
	// 					onClick={
	// 						savingChanges
	// 							? () => console.log("saving Changes")
	// 							: () => {
	// 									setSavingChanges(true);
	// 									apiCall({
	// 										method: "PUT",
	// 										url: "/procedure",
	// 										data: { id, devices: newChangedDevices },
	// 										handleResponse: (res) => {
	// 											message.success(res.data.message);
	// 											fetchData();
	// 											setSavingChanges(false);
	// 										},
	// 										handleError: (err) => {
	// 											setSavingChanges(false);
	// 											console.log(err);
	// 										},
	// 									});
	// 							  }
	// 					}
	// 				>
	// 					{savingChanges ? (
	// 						<>
	// 							Saving Changes <LoadingOutlined />
	// 						</>
	// 					) : (
	// 						`Save Changes`
	// 					)}
	// 				</Button>
	// 			</div>
	// 		</Fragment>
	// 	);
	// };

	const columns = [
		{
			title: "Code",
			dataIndex: "code",
		},
		{
			title: "Item",
			dataIndex: "procedure",
			width: "50%",
		},
		{
			title: "Frequency",
			dataIndex: "frequency",
			render: (freq: any) =>
				cv.frequencies?.find((x: any) => x.id === freq)?.name,
		},
		{
			title: "Procedure",
			dataIndex: "instructions",
			render: (info: any) => (
				<Popover
					title={"Instructions :"}
					trigger={"click"}
					overlayStyle={{ width: "450px" }}
					content={<Input.TextArea readOnly rows={8} value={info} />}
				>
					<Button type="link">View Procedure</Button>
				</Popover>
			),
		},
		{
			title: "Devices",
			dataIndex: "id",
			render: (id: number, row: any) => (
				<Popover
					content={
						// <DeviceList
						// 	key={id}
						// 	selectedDevices={row.devices}
						// 	id={row.id}
						// 	savingChanges={savingChanges}
						// />
						<List
							size="small"
							dataSource={row.devices || []}
							renderItem={(item: any) => (
								<List.Item>
									{devices?.find((x: any) => x.id === item)?.name}
								</List.Item>
							)}
						/>
					}
					trigger="click"
					destroyTooltipOnHide={true}
					autoAdjustOverflow={false}
				>
					<Button type="link">View Devices</Button>
				</Popover>
			),
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
								setEditingData(row);
								setEditModal(true);
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
				url: "/procedure",
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
			url: `/procedure?ahj=${ahj}&system=${system}&activity=${activity}&page=${
				curr_pagination.current
			}&limit=${curr_pagination.pageSize}&searchText=${search || ""}`,
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

	useEffect(() => {
		search();
		apiCall({
			method: "GET",
			url: `/dropdown/devicetypes?system=${system}`,
			handleResponse: (res) => {
				setDevices(res.data.message);
			},
		});
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
					<AddNewProcedure
						system={system}
						activity={activity}
						fetchData={fetchData}
						devices={devices}
						ahj={ahj}
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
			<EditProcedure
				formData={editingData}
				visible={editModal}
				setVisible={setEditModal}
				system={system}
				activity={activity}
				fetchData={fetchData}
				devices={devices}
				ahj={ahj}
			/>
		</>
	);
};

export default ProceduresTable;
