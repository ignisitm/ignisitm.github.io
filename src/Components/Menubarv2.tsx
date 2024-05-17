import {
	DownOutlined,
	FormOutlined,
	NodeExpandOutlined,
	PoweroffOutlined,
} from "@ant-design/icons";
import { Divider, Space, Tooltip, Typography } from "antd";
import { FC, useState } from "react";
import { resetUserSession } from "../Auth/Auth";
import { useNavigate } from "react-router-dom";

type props = {
	items: any;
	defaultValue?: string;
	onClick?: Function;
};

const items = [
	{ label: "Assets Types", key: "asset_types", icon: <NodeExpandOutlined /> },
	{ label: "AHJ Forms", key: "ahj_forms", icon: <FormOutlined /> },
];

const Menubar: FC<props> = ({ items, defaultValue, onClick }) => {
	const [selected, setSelected] = useState(defaultValue || "/");
	let navigate = useNavigate();

	const onMenuItemClick = (key: string) => {
		setSelected(key);
		onClick?.(key);
	};
	return (
		<>
			{items.map((item: any, index: any) =>
				item.type === "group" ? (
					<div key={index} className="hide-text-overflow">
						<Typography.Text
							style={{
								display: "inline-block",
								whiteSpace: "nowrap",
								color: "unset",
							}}
						>
							{item.label}
						</Typography.Text>
					</div>
				) : item.type === "divider" ? (
					<div key={index} style={{ padding: " 6px 10px" }}>
						<Divider style={{ margin: 0 }} />
					</div>
				) : (
					<div key={index} className="nlayout-menu-bar-icons">
						<div
							onClick={() => onMenuItemClick(item.key)}
							className={
								"nlayout-menu-icon-wrapper" +
								(selected === item.key ? "-selected" : "")
							}
						>
							<div
								style={{
									width: "30px",
									maxWidth: "30px",
									minWidth: "30px",
									textAlign: "center",
								}}
							>
								{item.icon}
							</div>
							<span
								style={{
									wordBreak: "unset",
									whiteSpace: "nowrap",
									overflow: "hidden",
									fontSize: "11px",
									color: "black",
								}}
							>
								{item.label}
							</span>
						</div>
					</div>
				)
			)}
		</>
	);
};

export default Menubar;
