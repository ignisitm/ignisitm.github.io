import {
	AppstoreOutlined,
	BarChartOutlined,
	CloudOutlined,
	ShopOutlined,
	TeamOutlined,
	UploadOutlined,
	UserOutlined,
	VideoCameraOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useEffect, useState } from "react";
import { Layout, Menu } from "antd";
import User from "./User";
import MasterBuildings from "./MasterBuildings";
import Systems from "./Systems";
import { apiCall } from "../../axiosConfig";

const { Header, Content, Footer, Sider } = Layout;

const items = [
	{
		key: "1",
		icon: <UserOutlined />,
		label: "Users",
	},
	{
		key: "2",
		icon: <BarChartOutlined />,
		label: "Buildings",
	},
	{
		key: "3",
		icon: <AppstoreOutlined />,
		label: "Systems",
	},
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
		getSystems();
	}, []);

	return (
		<Layout hasSider style={{ background: "transparent" }}>
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
			<Layout style={{ marginLeft: 200, background: "transparent" }}>
				{page === "1" ? (
					<User systems={systems} />
				) : page === "2" ? (
					<MasterBuildings />
				) : page === "3" ? (
					<Systems />
				) : null}
			</Layout>
		</Layout>
	);
};

export default App;
