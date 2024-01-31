import {
	DownOutlined,
	FormOutlined,
	NodeExpandOutlined,
	PoweroffOutlined,
} from "@ant-design/icons";
import { Space, Tooltip, Typography } from "antd";
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

const Menubarv2: FC<props> = ({ items, defaultValue, onClick }) => {
	const [selected, setSelected] = useState(defaultValue || "/");
	let navigate = useNavigate();

	const onMenuItemClick = (key: string) => {
		setSelected(key);
		onClick?.(key);
	};
	return (
		<>
			{items.map((item: any, index: any) => (
				<Tooltip
					key={index}
					mouseEnterDelay={0}
					mouseLeaveDelay={0}
					title={item.label}
					placement="right"
				>
					<div className="nlayout-menu-bar-icons">
						<div
							onClick={() => onMenuItemClick(item.key)}
							className={
								"nlayout-menu-icon-wrapper" +
								(selected === item.key ? "-selected" : "")
							}
						>
							{item.icon}
						</div>
					</div>
				</Tooltip>
			))}
			<Tooltip
				key={"logout"}
				mouseEnterDelay={0}
				mouseLeaveDelay={0}
				title={"Sign Out"}
				placement="right"
			>
				<div
					className="nlayout-menu-bar-icons"
					style={{ position: "absolute", bottom: "0px" }}
				>
					<div
						onClick={() => {
							resetUserSession();
							navigate("/login");
						}}
						className={"nlayout-menu-icon-wrapper"}
					>
						<PoweroffOutlined />
					</div>
				</div>
			</Tooltip>
		</>
	);
};

export default Menubarv2;
