import {
	CheckOutlined,
	CloseOutlined,
	DeleteOutlined,
	EditFilled,
	PlusOutlined,
	SaveOutlined,
} from "@ant-design/icons";
import {
	Button,
	Checkbox,
	Input,
	Modal,
	Popconfirm,
	Select,
	Space,
	Spin,
	Table,
	Tooltip,
	message,
} from "antd";
import React, { useEffect, useState } from "react";
import { apiCall } from "../../../axiosConfig";
import { AxiosError, AxiosResponse } from "axios";

const intializer = {
	newRow: {
		name: "",
		type: "",
		status: false,
		mandatory: false,
	},
};

const DeviceCommonFields = ({ type }: any) => {
	const [open, setOpen] = useState(false);
	const [data, setData] = useState<any>([]);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [newRow, setNewRow] = useState(intializer.newRow);
	const [orgData, setOrgData] = useState<any>([]);
	const [editingRow, setEditingRow] = useState(-1);

	useEffect(() => {
		fetchData();
	}, []);

	const columns = [
		{
			title: "Field",
			dataIndex: "name",
			width: "50%",
			render: (name: any, row: any) =>
				row.type === "NEW_ROW" ? (
					<Input
						style={{ width: "95%" }}
						size="small"
						placeholder="Enter Field name"
						onChange={changeNewRowName}
						value={newRow.name}
					/>
				) : (
					name
				),
		},
		{
			title: "Type",
			dataIndex: "type",
			width: "30%",
			render: (type: any) =>
				type === "NEW_ROW" ? (
					<Select
						style={{ width: "95%" }}
						onSelect={changeNewRowType}
						size="small"
						placeholder="Select type"
						value={newRow.type || null}
					>
						<Select.Option value="text">text</Select.Option>
						<Select.Option value="number">number</Select.Option>
					</Select>
				) : (
					type
				),
		},
		{
			title: "Required",
			dataIndex: "mandatory",
			render: (mandatory: any, row: any) =>
				row.type === "NEW_ROW" ? (
					<Checkbox
						checked={newRow.mandatory}
						onChange={changeNewRowReq}
					/>
				) : (
					<Checkbox checked={mandatory} />
				),
		},
		{
			title: "Action",
			dataIndex: "name",
			render: (id: any, row: any) =>
				row.type === "NEW_ROW" ? (
					<Space>
						<Button
							loading={saving}
							onClick={
								editingRow === -1 ? saveNewRow : saveEditedRow
							}
							size="small"
							icon={<SaveOutlined />}
						>
							Save
						</Button>
						<Button
							onClick={cancelNewRow}
							size="small"
							icon={<CloseOutlined />}
						>
							Cancel
						</Button>
					</Space>
				) : (
					<Space>
						<Tooltip title="Edit">
							<Button
								style={{ padding: 0, margin: 0, height: 0 }}
								type="link"
								onClick={() => {
									editRow(id);
								}}
							>
								<EditFilled />
							</Button>
						</Tooltip>
						<Popconfirm
							title="Are you sure to delete?"
							onConfirm={() => deleteField(id)}
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
		},
	];

	const editRow = (id: any) => {
		if (!newRow.status) {
			let ndata = [...data];
			let idx = ndata.findIndex((x: any) => x.name === id);
			setEditingRow(idx);
			setNewRow({ ...ndata[idx], status: true });
			ndata[idx].type = "NEW_ROW";
			setData([...ndata]);
			console.log(orgData);
		} else message.error("Unsaved Changes");
	};

	const cancelNewRow = () => {
		console.log(orgData);
		setData(getOrgDataCopy());
		setNewRow(intializer.newRow);
		setEditingRow(-1);
	};

	const saveEditedRow = () => {
		if (!newRow.name || !newRow.type) {
			message.error("Missing details!");
		} else {
			setSaving(true);
			let newData = getOrgDataCopy();
			newData[editingRow] = {
				name: newRow.name,
				type: newRow.type,
				mandatory: newRow.mandatory,
			};
			apiCall({
				method: "PUT",
				url: "/commonfields",
				data: { fields: newData },
				handleResponse: (res) => {
					setSaving(false);
					console.log(res);
					fetchData();
					setEditingRow(-1);
					setNewRow(intializer.newRow);
				},
				handleError: (err) => {
					setSaving(false);
				},
			});
		}
	};

	const saveNewRow = () => {
		if (!newRow.name || !newRow.type) {
			message.error("Missing details!");
		} else {
			setSaving(true);
			let newData = [
				...(getOrgDataCopy() || []),
				{
					name: newRow.name,
					type: newRow.type,
					mandatory: newRow.mandatory,
				},
			];
			apiCall({
				method: "PUT",
				url: "/commonfields",
				data: { fields: newData },
				handleResponse: (res) => {
					setSaving(false);
					console.log(res);
					fetchData();
					setNewRow(intializer.newRow);
				},
				handleError: (err) => {
					setSaving(false);
				},
			});
		}
	};

	const changeNewRowName = (e: any) => {
		let row = { ...newRow };
		row.name = e.target.value;
		setNewRow(row);
	};

	const changeNewRowType = (e: any) => {
		let row = { ...newRow };
		row.type = e;
		setNewRow(row);
	};

	const changeNewRowReq = (e: any) => {
		let row = { ...newRow };
		row.mandatory = e.target.checked;
		setNewRow(row);
	};

	const fetchData = () => {
		setLoading(true);
		apiCall({
			method: "GET",
			url: "/commonfields",
			handleResponse: (res) => {
				let response = [...res.data.message?.value] || [];
				let cloned_respponse = JSON.parse(JSON.stringify(response));
				setData(cloned_respponse);
				setOrgData(response);
				setLoading(false);
			},
			handleError: (err) => {
				setLoading(false);
			},
		});
	};

	const getOrgDataCopy = () => JSON.parse(JSON.stringify(orgData));

	const deleteField = (id: any) => {
		let newData = getOrgDataCopy().filter((x: any) => x.name !== id);
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			apiCall({
				method: "PUT",
				url: "/commonfields",
				data: { fields: newData },
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

	const closeModal = () => {
		setOpen(false);
		setData(getOrgDataCopy());
		setEditingRow(-1);
		setNewRow(intializer.newRow);
	};

	const addNewRow = () => {
		if (!newRow.status) {
			setData([...(data || []), { type: "NEW_ROW" }]);
			setNewRow({ ...newRow, status: true });
		} else message.error("Unsaved Changes");
	};

	const openModal = () => {
		fetchData();
		setOpen(true);
	};

	return (
		<>
			<Button onClick={openModal} type={type || "link"}>
				View Common Fields
			</Button>
			<Modal
				open={open}
				title="Common Fields for Devices"
				onCancel={closeModal}
				width={999}
				style={{ top: "20px" }}
				okText="Add New"
				okButtonProps={{ icon: <PlusOutlined /> }}
				onOk={addNewRow}
			>
				<Table
					loading={loading}
					dataSource={data}
					columns={columns}
					pagination={false}
				/>
			</Modal>
		</>
	);
};

export default DeviceCommonFields;
