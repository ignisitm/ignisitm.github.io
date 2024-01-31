import {
	CaretDownOutlined,
	ClusterOutlined,
	ContainerOutlined,
	DeleteOutlined,
	DownOutlined,
	LoadingOutlined,
} from "@ant-design/icons";
import { Dropdown, Popconfirm, Typography } from "antd";
import { FC, useEffect, useState } from "react";

type props = {
	items: any;
	onClick?: Function;
};

const AHJSystemList: FC<props> = ({ items, onClick }) => {
	const [selected, setSelected] = useState<any>(null);
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		console.log(items);
	}, []);

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
							"system-list-item" +
							(selected?.key === item.key ? "-selected" : "")
						}
					>
						<ClusterOutlined
							style={{
								...(selected?.key === item.key ? { color: "#f9992e" } : {}),
							}}
						/>{" "}
						<Typography.Text
							style={{ width: "80%" }}
							ellipsis={{
								tooltip: { title: item.label, placement: "bottomLeft" },
							}}
						>
							{item.label}
						</Typography.Text>
					</div>
				</>
			))}
		</>
	);
};

export default AHJSystemList;
