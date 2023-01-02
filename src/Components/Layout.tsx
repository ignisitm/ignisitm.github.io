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
} from "@ant-design/icons";
import { Layout, Menu, Modal, Tooltip } from "antd";
import { getUser, resetUserSession } from "../Auth/Auth";
import { ClientContext } from "../Helpers/Context";
import Masters from "../Pages/Masters";
import LoadingBar from "react-top-loading-bar";
const { Content, Footer, Sider } = Layout;

type headers = {
	[key: string]: string;
};

type contextType = {
	completeLoading: Function;
};

const headings: headers = {
	"/": "Dashboard",
	"/buildings": "Buildings",
	"/building/": "Buildings",
	"/workorders": "Work Orders",
	"/notifications": "Notifications",
	"/master": "Master Page",
	"/superuser": "Settings",
	"/invoice": "Invoices",
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

	const showModal = () => {
		setIsModalOpen(true);
	};

	const handleOk = () => {
		setIsModalOpen(false);
	};

	const handleCancel = () => {
		setIsModalOpen(false);
	};

	const items = [
		{
			key: "/",
			icon: <BarChartOutlined />,
			label: "Dashboard",
		},
		{
			key: "/buildings",
			icon: <BankOutlined />,
			label: "Buildings",
		},
		{
			key: "/notifications",
			icon: <BellOutlined />,
			label: "Notifications",
		},
		{
			key: "/workorders",
			icon: <AuditOutlined />,
			label: "Work Orders",
		},
		{
			key: "/invoice",
			icon: <DollarCircleOutlined />,
			label: "Invoices",
		},
		...(client === "admin"
			? [
					{
						key: "/superuser",
						icon: <SettingOutlined />,
						label: "Settings",
					},
			  ]
			: []),
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
			icon: <SettingOutlined />,
			label: "Settings",
		},
	];

	const completeLoading: Function = () => {
		loaderRef.current.complete();
	};

	useEffect(() => {
		loaderRef.current.continuousStart();
		console.log("changed page");
	}, [location.pathname]);

	useEffect(() => {
		console.log("location: ", location);
		console.log("Client: ", client);

		if (client === "admin") {
			navigate("/superuser");
		}

		if (!getUser()) navigate("/login");
	}, []);

	return (
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
						Master Settings
					</span>
				}
				visible={isModalOpen}
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
					<img src="../logo.png" />
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
						<Menu
							theme="light"
							mode="inline"
							items={settingItems}
							onClick={showModal}
							selectedKeys={[]}
						/>
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
					marginLeft: 200,
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
					{capitalizeFirstLetter(client)} ©2022 powered by IGNIS ITM
				</Footer>
			</Layout>
		</Layout>
	);
};

export default AppLayout;

export function useLoaderContext() {
	return useOutletContext<contextType>();
}
