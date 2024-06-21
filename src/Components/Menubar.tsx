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

const Menubar: FC<props> = ({ items, defaultValue, onClick }) => {
	const [selected, setSelected] = useState(defaultValue || "/");
	let navigate = useNavigate();

	const onMenuItemClick = (key: string) => {
		setSelected(key);
		onClick?.(key);
	};
	return (
		<>
			{items.map((item: any, index: any) => (
				<Tooltip title={item.label} placement="right">
					<div key={index} className="nlayout-menu-bar-icons-v1">
						<div
							onClick={() => onMenuItemClick(item.key)}
							className={
								"nlayout-menu-icon-wrapper-v1" +
								(selected === item.key ? "-selected" : "")
							}
						>
							{item.icon}
						</div>
					</div>
				</Tooltip>
			))}
			<Tooltip title={"Sign Out"} placement="right">
				<div
					className="nlayout-menu-bar-icons-v1"
					style={{ marginTop: "auto" }}
				>
					<div
						onClick={() => {
							resetUserSession();
							navigate("/login");
						}}
						className={"nlayout-menu-icon-wrapper-v1"}
						style={{
							bottom: "0px",
						}}
					>
						<PoweroffOutlined />
					</div>
				</div>
			</Tooltip>
		</>
	);
};

export default Menubar;
