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
	UsergroupAddOutlined,
} from "@ant-design/icons";
import { Avatar, Layout, Menu, Modal, Space, Tooltip } from "antd";
import { getToken, getUser, resetUserSession } from "../Auth/Auth";
import { ClientContext } from "../Helpers/Context";
import Masters from "../Pages/Masters";
import LoadingBar from "react-top-loading-bar";
import { apiCall } from "../axiosConfig";
const { Content, Footer, Sider } = Layout;

type headers = {
	[key: string]: string;
};

type contextType = {
	completeLoading: Function;
};

const AppLayout: FC = () => {
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
		...(client.client_id === "admin" ? { "/": "System Types" } : {}),
	};

	const admin_items = [
		{
			key: "/",
			icon: <NodeExpandOutlined />,
			label: "Systems",
		},
		{
			key: "/devices",
			icon: <ApiOutlined />,
			label: "Devices",
		},
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
		{ key: "Divider", type: "divider" },
		{
			key: "Resources",
			type: "group",
			label: "Resources",
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
		{
			key: "/teams",
			icon: <UsergroupAddOutlined />,
			label: "Teams",
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
			url: `/${client.client_id === "admin" ? "super" : "client"}auth/verify`,
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

	return (
		<Layout hasSider>
			<LoadingBar color="orange" height={4} ref={loaderRef} />
			<div
				className="user-full-name"
				style={{ position: "fixed", top: "21px", right: "10px" }}
			>
				<span>{userdetails?.name}&nbsp;&nbsp;</span>
				<Avatar style={{ top: "-2px" }} shape="square" size={28}>
					{userdetails?.name.split(" ")[0][0] +
						(userdetails?.name.split(" ")?.[1]?.[0] || "")}
				</Avatar>
			</div>
			<div className="user-full-name" style={{}}>
				<span style={{ top: "-2px", position: "relative", right: "2px" }}>
					{userdetails?.name}&nbsp;
				</span>
				<Avatar icon={<UserOutlined />} shape="square" size={30}></Avatar>
				<br />
				<span
					style={{
						color: "gray",
						fontSize: "10px",
						position: "relative",
						top: "-16px",
						left: "0px",
					}}
				>
					admin
				</span>
			</div>
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
				bodyStyle={{ overflowY: "scroll", height: "calc(100vh - 200px)" }}
				destroyOnClose={true}
			>
				<Masters />
			</Modal>
			<Sider
				theme="light"
				style={{
					overflow: "auto",
					height: "100vh",
					position: "fixed",
					left: 0,
					top: 0,
					bottom: 0,
				}}
			>
				<div className="logo">
					<img src="logo.png" />
				</div>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						justifyContent: "space-between",
						height: "calc(100% - 165px)",
					}}
				>
					<Menu
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
					</span>
				</div>
			</Sider>
			<Layout
				className="site-layout"
				style={{
					marginLeft: 125,
					minHeight: "100vh",
				}}
			>
				<Content
					style={{
						margin: "12px 16px 0px 16px",
						paddingBottom: "42px",
						backgroundColor: "transparent",
						height: "100%",
					}}
				>
					<div
						className="site-layout-background"
						style={{
							padding: 5,
						}}
					>
						<span className="main-label">
							{
								headings[
									location.pathname.includes("/building/")
										? "/building/"
										: location.pathname.toLowerCase()
								]
							}
						</span>
						<div style={{ marginTop: "17px" }}>
							<Outlet context={{ completeLoading }} />
						</div>
					</div>
				</Content>
				<Footer
					style={{
						width: "calc(100% - 200px)",

						textAlign: "center",
						padding: "10px 50px",
						position: "fixed",
						bottom: "0px",
					}}
				>
					{capitalizeFirstLetter(client.client_name)} ©2024 powered by IGNIS ITM
				</Footer>
			</Layout>
		</Layout>
	);
};

export default AppLayout;

export function useLoaderContext() {
	return useOutletContext<contextType>();
}
