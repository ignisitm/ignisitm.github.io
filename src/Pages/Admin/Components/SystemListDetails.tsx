import { FC, useEffect, useState } from "react";
import DevicesTable from "./DevicesTable";
import { Button, Popconfirm, Table, Typography } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

type props = {
	info: any;
	showModal: Function;
	deleteRow: Function;
};

const SystemListDetails: FC<props> = ({ info, showModal, deleteRow }) => {
	const columns = [
		{
			title: "System Name",
			dataIndex: "name",
			// sorter: true,
		},
		{
			title: "General Fields",
			dataIndex: "id",
			render: (id: number, row: any) => {
				return (
					<span key={id}>
						<Button
							style={{ paddingLeft: 0 }}
							type="link"
							onClick={() => showModal(row)}
						>
							View / Edit
						</Button>
					</span>
				);
			},
			width: "200px",
		},
		{
			title: "Created By",
			dataIndex: "createdby",
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

	return (
		<>
			{/* <Typography.Text strong>System Name: </Typography.Text>
			<Typography.Text>{info.name}</Typography.Text>
			<br />
			<Typography.Text strong>General Fields: </Typography.Text>
			<Typography.Text>
				<Button
					style={{ paddingLeft: 0 }}
					type="link"
					onClick={() => showModal(info)}
				>
					View / Edit
				</Button>
			</Typography.Text> */}

			<DevicesTable key={info.id} system_id={info.id} />
		</>
	);
};

export default SystemListDetails;
