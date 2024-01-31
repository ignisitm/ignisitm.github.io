import {
	AppstoreOutlined,
	BarChartOutlined,
	CloudOutlined,
	ShopOutlined,
	TeamOutlined,
	UploadOutlined,
	UserOutlined,
	VideoCameraOutlined,
	PartitionOutlined,
	UserSwitchOutlined,
	UsergroupAddOutlined,
	ToolOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useEffect, useState } from "react";
import { Layout, Menu } from "antd";
import User from "./User";
import MasterBuildings from "./MasterBuildings";
import Systems from "./Systems";
import { apiCall } from "../../axiosConfig";
import Resources from "./Resources";
import Roles from "./Roles";
import BuildingControllers from "./BuildingControllers";
import Employees from "./Employees";
import Equipments from "./Equipments";

const { Header, Content, Footer, Sider } = Layout;

const items = [
	{
		key: "1",
		icon: <UsergroupAddOutlined />,
		label: "Employees",
	},
	{
		key: "2",
		icon: <ToolOutlined />,
		label: "Equipments",
	},
	{
		key: "3",
		icon: <UserSwitchOutlined />,
		label: "Roles",
	},
	{
		key: "4",
		icon: <UserOutlined />,
		label: "Users",
	},
	// {
	// 	key: "5",
	// 	icon: <BarChartOutlined />,
	// 	label: "Buildings",
	// },
	// {
	// 	key: "6",
	// 	icon: <UsergroupAddOutlined />,
	// 	label: "Building Controllers",
	// },
];

const App: React.FC = () => {
	const [page, setPage] = useState("1");

	const [systems, setSystems] = useState([]);

	const getSystems = () => {
		apiCall({
			method: "GET",
			url: "/assets/systems",
			handleResponse: (res) => {
				setSystems(res.data.message);
			},
		});
	};

	useEffect(() => {
		// getSystems();
	}, []);

	return (
		<Layout hasSider style={{ background: "transparent", height: "100%" }}>
			<Sider
				theme="light"
				style={{
					overflow: "auto",
					height: "100%",
					position: "absolute",
					left: 0,
					top: 0,
					bottom: 0,
				}}
			>
				<br />
				<Menu
					mode="inline"
					defaultSelectedKeys={["1"]}
					onSelect={({ key }) => {
						setPage(key);
					}}
					items={items}
				/>
			</Sider>
			<Layout
				style={{ marginLeft: 200, background: "transparent", height: "100%" }}
			>
				{page === "1" ? (
					<Employees />
				) : page === "2" ? (
					<Equipments />
				) : page === "3" ? (
					<Roles />
				) : page === "4" ? (
					<User systems={systems} />
				) : page === "5" ? (
					<MasterBuildings />
				) : page === "6" ? (
					<BuildingControllers />
				) : page === "7" ? (
					<Systems />
				) : null}
			</Layout>
		</Layout>
	);
};

export default App;
