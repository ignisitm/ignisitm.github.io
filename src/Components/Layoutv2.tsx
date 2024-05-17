import { FC, useEffect, useContext, useState, useRef } from "react";
import {
	Outlet,
	useNavigate,
	useLocation,
	useOutletContext,
} from "react-router-dom";
import {
	BarChartOutlined,
	BellOutlined,
	BankOutlined,
	SettingOutlined,
	AuditOutlined,
	PoweroffOutlined,
	DollarCircleOutlined,
	ReconciliationOutlined,
	NodeExpandOutlined,
	FormOutlined,
	ApiOutlined,
	TeamOutlined,
	FileProtectOutlined,
	ApartmentOutlined,
	ClusterOutlined,
	GroupOutlined,
	ControlOutlined,
	UserOutlined,
	BarsOutlined,
	DatabaseOutlined,
	StopOutlined,
	DeleteRowOutlined,
	UserSwitchOutlined,
	InboxOutlined,
	IssuesCloseOutlined,
} from "@ant-design/icons";
import {
	Avatar,
	Divider,
	Dropdown,
	Layout,
	Menu,
	MenuProps,
	Modal,
	Space,
	Tooltip,
	Typography,
} from "antd";
import { getToken, getUser, resetUserSession } from "../Auth/Auth";
import { ClientContext } from "../Helpers/Context";
import Masters from "../Pages/Masters";
import LoadingBar from "react-top-loading-bar";
import { apiCall } from "../axiosConfig";
import Menubar from "./Menubar";
import Menubarv2 from "./Menubarv2";
const { Header, Content, Footer, Sider } = Layout;

type headers = {
	[key: string]: string;
};

type contextType = {
	completeLoading: Function;
};

const NewAppLayout2: FC = () => {
	let navigate = useNavigate();
	let location = useLocation();
	let client = useContext(ClientContext);
	const loaderRef = useRef<any>(null);

	const capitalizeFirstLetter = (string: string) => {
		return string.charAt(0).toUpperCase() + string.slice(1);
	};

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [userdetails, setUserDetails] = useState<any>(null);

	const showModal = () => {
		setIsModalOpen(true);
	};

	const handleOk = () => {
		setIsModalOpen(false);
	};

	const handleCancel = () => {
		setIsModalOpen(false);
	};

	const headings: headers = {
		"/": "Dashboard",
		"/buildings": "Buildings",
		"/building/": "Buildings",
		"/contracts": "Contracts",
		"/systems": "Systems",
		"/assets": "Assets",
		"/workorders": "Work Orders",
		"/notifications": "Notifications",
		"/master": "Master Page",
		"/admin": "Admin Panel",
		"/invoice": "Invoices",
		"/devices": "Device Types",
		"/ahjforms": "Authority Having Jurisdiction forms",
		"/superuser": "Clients",
		"/teams": "Teams",
		"/pdfview": "Form Builder",
		...(client.client_id === "admin" ? { "/": "Master Data" } : {}),
	};

	const admin_items = [
		{
			key: "/",
			icon: <DatabaseOutlined />,
			label: "Master Data",
		},
		// {
		// 	key: "/devices",
		// 	icon: <ApiOutlined />,
		// 	label: "Devices",
		// },
		{
			key: "/ahjforms",
			icon: <FormOutlined />,
			label: "AHJ Forms",
		},
		{
			key: "/superuser",
			icon: <TeamOutlined />,
			label: "Clients",
		},
	];

	const client_items = [
		{
			key: "Planning",
			type: "group",
			label: "Planning",
		},
		{
			key: "/",
			icon: <BarChartOutlined />,
			label: "Dashboard",
		},
		{
			key: "/notifications",
			icon: <BellOutlined />,
			label: "Notifications",
		},
		{
			key: "/workorders",
			icon: <ReconciliationOutlined />,
			label: "Work Orders",
		},
		{
			key: "/workorders",
			icon: <BarsOutlined />,
			label: "Procedures",
		},
		{
			key: "/workorders",
			icon: <IssuesCloseOutlined />,
			label: "Defects",
		},
		{ key: "Divider", type: "divider" },
		{
			key: "data",
			type: "group",
			label: "Data",
		},
		{
			key: "/contracts",
			icon: <FileProtectOutlined />,
			label: "Contracts",
		},
		{
			key: "/buildings",
			icon: <BankOutlined />,
			label: "Buildings",
		},
		{
			key: "/systems",
			icon: <ApartmentOutlined />,
			label: "Systems",
		},
		{
			key: "/assets",
			icon: <ClusterOutlined />,
			label: "Assets",
		},

		{ key: "Divider", type: "divider" },
		{
			key: "Resources",
			type: "group",
			label: "Resources",
		},
		{
			key: "/teams",
			icon: <TeamOutlined />,
			label: "Teams",
		},
		{
			key: "/teams",
			icon: <UserSwitchOutlined />,
			label: "Users",
		},
		{
			key: "/teams",
			icon: <UserOutlined />,
			label: "Employees",
		},
		{
			key: "/teams",
			icon: <InboxOutlined />,
			label: "Equipments",
		},
		// {
		// 	key: "/workorders",
		// 	icon: <AuditOutlined />,
		// 	label: "Work Orders",
		// },
		// {
		// 	key: "/invoice",
		// 	icon: <DollarCircleOutlined />,
		// 	label: "Invoices",
		// },
	];

	const items = [
		...(client.client_id === "admin" ? admin_items : client_items),
	];

	const loginItems = [
		{
			key: "/login",
			icon: <PoweroffOutlined />,
			label: "Log Out",
		},
	];

	const settingItems = [
		{
			key: "/Settings",
			icon: <ControlOutlined />,
			label: "Admin Panel",
		},
	];

	const completeLoading: Function = () => {
		loaderRef.current.complete();
	};

	const verify = () => {
		apiCall({
			method: "POST",
			url: `/${
				client.client_id === "admin" ? "super" : "client"
			}auth/verify`,
			data: { user: getUser(), token: getToken() },
			handleResponse: (res) => {
				console.log("token Verified");
			},
		});
	};

	useEffect(() => {
		loaderRef.current.continuousStart();
		console.log("changed page");
		verify();
	}, [location.pathname]);

	useEffect(() => {
		console.log("location: ", location);
		console.log("Client: ", client);

		// if (client === "admin") {  TODO
		// 	navigate("/superuser");
		// }

		if (!getUser()) navigate("/login");
		else setUserDetails(getUser());
		console.log(getUser());
	}, []);

	const items1: MenuProps["items"] = ["1", "2", "3"].map((key) => ({
		key,
		label: `nav ${key}`,
	}));

	const userItems: MenuProps["items"] = [
		{
			key: "1",
			label: "Change Password",
			disabled: true,
		},
		{
			key: "2",
			label: "Sign Out",
			onClick: () => {
				resetUserSession();
				navigate("/login");
			},
		},
	];

	return (
		<Layout>
			<Header className="nlayout-header">
				<Space>
					<Typography.Title style={{ margin: 0 }} level={3}>
						{
							headings[
								location.pathname.includes("/building/")
									? "/building/"
									: location.pathname.includes("/ahj/")
									? "/ahjforms"
									: location.pathname.toLowerCase()
							]
						}
					</Typography.Title>
				</Space>
				<Dropdown
					menu={{ items: userItems }}
					placement="bottomRight"
					arrow
					trigger={["click"]}
				>
					<div className="user-full-name">
						<span>{userdetails?.name}&nbsp;&nbsp;</span>
						<Avatar
							style={{ top: "-2px" }}
							shape="square"
							size={28}
						>
							{userdetails?.name.split(" ")[0][0] +
								(userdetails?.name.split(" ")?.[1]?.[0] || "")}
						</Avatar>
					</div>
				</Dropdown>
			</Header>
			<Layout hasSider>
				<LoadingBar color="orange" height={4} ref={loaderRef} />
				{/* <Tooltip title="Settings" placement="leftBottom">
				<div
					style={{
						position: "absolute",
						top: "0px",
						right: "0px",
						paddingTop: "10px",
						paddingRight: "10px",
					}}
					onClick={showModal}
				>
					<SettingOutlined style={{ fontSize: "20px", cursor: "pointer" }} />
				</div>
			</Tooltip> */}

				<Modal
					title={
						<span style={{ marginLeft: "200px", fontSize: "18px" }}>
							Admin Panel
						</span>
					}
					open={isModalOpen}
					onCancel={handleCancel}
					cancelText="Done"
					okButtonProps={{ style: { display: "none" } }}
					width={"calc(100vw - 200px)"}
					style={{ top: "20px" }}
					bodyStyle={{
						overflowY: "scroll",
						height: "calc(100vh - 200px)",
					}}
					destroyOnClose={true}
				>
					<Masters />
				</Modal>
				<div className="nlayout-main-sider" tabIndex={-1}>
					<Sider
						theme="light"
						width={"100%"}
						style={{
							backgroundColor: "#f9f9f9",
							borderRight: "0.5px solid silver",
							height: "100%",
						}}
					>
						<div className="nlayout-sidebar">
							<div
								style={{
									paddingTop: "12px",
									textAlign: "center",
									marginLeft: "-5px",
									paddingBottom: "10px",
								}}
							>
								<img
									width={"88"}
									height={"55"}
									src="logo.png"
								/>
							</div>
							<div className="nlayout-sidebar-items-wrapper">
								<Menubarv2
									items={items}
									defaultValue={location.pathname.toLowerCase()}
									onClick={(key: string) => navigate(key)}
								/>
								{/* <Menu
						theme="light"
						mode="inline"
						defaultSelectedKeys={[location.pathname.toLowerCase()]}
						items={items}
						onClick={({ key }) => navigate(key)}
					/>
					<span>
						{client.client_id === "admin" ? (
							" "
						) : (
							<Menu
								theme="light"
								mode="inline"
								items={settingItems}
								onClick={showModal}
								selectedKeys={[]}
							/>
						)}
						<Menu
							theme="light"
							mode="inline"
							defaultSelectedKeys={[location.pathname.toLowerCase()]}
							items={loginItems}
							onClick={() => {
								resetUserSession();
								navigate("/login");
							}}
						/>
					</span> */}
							</div>
						</div>
					</Sider>
				</div>
				<Layout
					className="main-background"
					style={{
						marginLeft: 130,
						minHeight: "100vh",
					}}
				>
					<Content
						style={{
							margin: location.pathname.includes("/pdfview")
								? "12px 0px 0px 0px"
								: "12px 10px 0px 10px",
							paddingTop: "33px",
							backgroundColor: "transparent",
							height: "100%",
						}}
					>
						<div
							className="site-layout-background"
							style={{
								height: "100%",
								padding: location.pathname.includes("/pdfview")
									? "0px"
									: "25px 5px 5px 5px",
							}}
						>
							<Outlet context={{ completeLoading }} />
						</div>
					</Content>
					<Footer
						className="main-background"
						style={{
							width: "calc(100% - 55px)",
							borderTop: "0.5px solid silver",
							textAlign: "left",
							padding: "3px 5px",
							position: "fixed",
							bottom: "0px",
							fontSize: "10px",
						}}
					>
						{capitalizeFirstLetter(client.client_name)} ©2024
						powered by IgnisITM
					</Footer>
				</Layout>
			</Layout>
		</Layout>
	);
};

export default NewAppLayout2;

export function useLoaderContext() {
	return useOutletContext<contextType>();
}
