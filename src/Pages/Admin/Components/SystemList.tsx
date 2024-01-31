import {
	CaretDownOutlined,
	ClusterOutlined,
	ContainerOutlined,
	DeleteOutlined,
	DownOutlined,
	LoadingOutlined,
} from "@ant-design/icons";
import { Dropdown, Popconfirm, Typography } from "antd";
import { FC, useState } from "react";

type props = {
	items: any;
	onClick?: Function;
	showModal: Function;
	deleteRow: Function;
};

const SystemList: FC<props> = ({ items, onClick, showModal, deleteRow }) => {
	const [selected, setSelected] = useState<any>(null);
	const [deleting, setDeleting] = useState(false);

	const dropdownitems = [
		{
			key: "1",
			label: (
				<Typography.Text style={{ fontSize: "11px" }}>
					View General Fields
				</Typography.Text>
			),
			icon: <ContainerOutlined />,
			onClick: () => showModal(selected),
		},
		{
			key: "3",
			type: "divider",
		},
		{
			key: "2",
			label: <label style={{ fontSize: "11px" }}>Delete System Type</label>,
			icon: <DeleteOutlined />,
			onClick: () => {
				setDeleting(true);
				deleteRow(selected.id).finally(() => {
					setDeleting(false);
				});
			},
			loading: true,
			danger: true,
		},
	];

	const clickOnList = (item: any) => {
		setSelected(item);
		onClick?.(item);
	};

	return (
		<>
			{items?.map((item: any, index: number) => (
				<>
					<div
						key={index}
						onClick={() => clickOnList(item)}
						className={
							"system-list-item" + (selected?.id === item.id ? "-selected" : "")
						}
					>
						<ClusterOutlined
							style={{
								...(selected?.id === item.id ? { color: "#f9992e" } : {}),
							}}
						/>{" "}
						<Typography.Text
							style={{ width: "80%" }}
							ellipsis={{
								tooltip: { title: item.name, placement: "bottomLeft" },
							}}
						>
							{item.name}
						</Typography.Text>
						{selected?.id === item.id && (
							<Dropdown trigger={["click"]} menu={{ items: dropdownitems }}>
								<Typography.Text type="secondary" style={{ float: "right" }}>
									{deleting ? <LoadingOutlined /> : <CaretDownOutlined />}
								</Typography.Text>
							</Dropdown>
						)}
					</div>
				</>
			))}
		</>
	);
};

export default SystemList;
