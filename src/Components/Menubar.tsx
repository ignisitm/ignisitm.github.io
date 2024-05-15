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
				<div key={index} className="nlayout-menu-bar-icons">
					<div
						onClick={() => onMenuItemClick(item.key)}
						className={
							"nlayout-menu-icon-wrapper" +
							(selected === item.key ? "-selected" : "")
						}
					>
						{item.icon}
						<Typography.Text strong style={{ fontSize: 9.7 }}>
							{item.label}
						</Typography.Text>
					</div>
				</div>
			))}

			<div
				className="nlayout-menu-bar-icons"
				style={{ marginTop: "auto" }}
			>
				<div
					onClick={() => {
						resetUserSession();
						navigate("/login");
					}}
					className={"nlayout-menu-icon-wrapper"}
					style={{
						bottom: "0px",
						justifyContent: "end",
						padding: "3px 0px",
					}}
				>
					<PoweroffOutlined />
					<Typography.Text strong style={{ fontSize: 9.7 }}>
						Sign Out
					</Typography.Text>
				</div>
			</div>
		</>
	);
};

export default Menubar;
