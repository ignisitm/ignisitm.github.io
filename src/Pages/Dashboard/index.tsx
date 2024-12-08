import { Card, Skeleton, Table } from "antd";
import { Row, Col } from "antd";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useLoaderContext } from "../../Components/Layout";
import {
	UsergroupAddOutlined,
	BankOutlined,
	BellOutlined,
	FormOutlined,
	ContainerOutlined,
	FileDoneOutlined,
	FlagOutlined,
	ReconciliationOutlined,
	ClockCircleOutlined,
	CheckCircleOutlined,
	WarningOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { apiCall } from "../../axiosConfig";

const Dashboard = () => {
	const { completeLoading } = useLoaderContext();
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState<any>();
	const [alerts, setAlerts] = useState<any>([]);

	useEffect(() => {
		setLoading(true);
		apiCall({
			method: "GET",
			url: "/ClientDashboard",
			handleResponse: (res) => {
				console.log(res);
				let data = res.data.message;
				setData(data);
				completeLoading();
				setLoading(false);
				let systems_wo_contracts =
					data?.["sys_co"]?.find((x: any) => x.current_contract === null)
						?.count || 0;
				let systems_wo_teams =
					data?.["sys_team"]?.find((x: any) => x.team === null)?.count || 0;
				let alerts = [];
				console.log("Counts : ", systems_wo_contracts, systems_wo_teams);
				if (data.alerts?.expired_co?.length > 1) {
					alerts.push({
						label: `There are ${data.alerts.expired_co.length} contracts that have expired`,
					});
				} else if (data.alerts?.expired_co?.length === 1) {
					alerts.push({
						label: `There is ${data.alerts.expired_co.length} contract that has expired`,
					});
				}
				if (data.alerts?.neartoexpiry_co?.length > 1) {
					alerts.push({
						label: `There are ${data.alerts.neartoexpiry_co.length} contracts that are going to expire soon`,
					});
				} else if (data.alerts?.neartoexpiry_co?.length === 1) {
					alerts.push({
						label: `There is ${data.alerts.neartoexpiry_co.length} contract that is going to expire soon`,
					});
				}
				if (systems_wo_contracts == 1)
					alerts.push({
						label: `There is ${systems_wo_contracts} system without contract assigned to it`,
					});
				else if (systems_wo_contracts > 1)
					alerts.push({
						label: `There are ${systems_wo_contracts} systems without contract assigned to them`,
					});
				if (systems_wo_teams == 1)
					alerts.push({
						label: `There is ${systems_wo_teams} system without a team assigned to it`,
					});
				else if (systems_wo_teams > 1)
					alerts.push({
						label: `There are ${systems_wo_teams} systems without a team assigned to them`,
					});
				console.log(alerts);
				setAlerts(alerts);
			},
		});
	}, []);

	return (
		<>
			<Row gutter={16 + 8 * 2}>
				<Col span={6}>
					<Card
						className="dashboard-cards"
						style={{
							width: "100%",
							backgroundColor: "#FAFAFA",
							height: "100%",
						}}
					>
						<Row
							gutter={16 + 8 * 2}
							style={{ alignItems: "center", height: "100%" }}
							justify="center"
						>
							<Col span={6}>
								<div style={{ alignItems: "center" }}>
									<div className="circle_card">
										<FileDoneOutlined
											style={{
												color: "#353535",
												padding: "10px",
												fontSize: "25px",
											}}
										/>
									</div>
								</div>
							</Col>
							<Col span={18}>
								{" "}
								<span
									style={{
										color: "#353535",
										fontSize: "20px",
									}}
								>
									{loading ? (
										<Skeleton.Button active={true} size="small" />
									) : (
										data?.["contract"]?.find((x: any) => x.status === "ACTIVE")
											?.count || 0
									)}
								</span>
								<br />
								<span style={{ color: "#353535" }}>Active Contracts</span>
							</Col>
						</Row>

						<div></div>
					</Card>
				</Col>
				<Col span={6}>
					<Card
						className="dashboard-cards"
						style={{
							width: "100%",
							height: "100%",
							backgroundColor: "#FAFAFA",
						}}
					>
						<Row
							gutter={16 + 8 * 2}
							style={{ alignItems: "center", height: "100%" }}
							justify="center"
						>
							<Col span={6}>
								<div
									style={{
										alignItems: "center",
										height: "100%",
									}}
								>
									<div className="circle_card">
										<ReconciliationOutlined
											style={{
												color: "#353535",
												padding: "10px",
												fontSize: "25px",
											}}
										/>
									</div>
								</div>
							</Col>
							<Col span={18}>
								{" "}
								<span
									style={{
										color: "#353535",
										fontSize: "20px",
									}}
								>
									{loading ? (
										<Skeleton.Button active={true} size="small" />
									) : (
										data?.["notification"]?.find(
											(x: any) => x.status === "OPEN"
										)?.count || 0
									)}
								</span>
								<br />
								<span style={{ color: "#353535" }}>
									Notifications pending for work order creation
								</span>
							</Col>
						</Row>

						<div></div>
					</Card>
				</Col>
				<Col span={6}>
					<Card
						className="dashboard-cards"
						style={{
							width: "100%",
							backgroundColor: "#FAFAFA",
							height: "100%",
						}}
					>
						<Row
							gutter={16 + 8 * 2}
							style={{ alignItems: "center", height: "100%" }}
							justify="center"
						>
							<Col span={6}>
								<div style={{ alignItems: "center" }}>
									<div className="circle_card">
										<ClockCircleOutlined
											style={{
												color: "#353535",
												padding: "10px",
												fontSize: "25px",
											}}
										/>
									</div>
								</div>
							</Col>
							<Col span={18}>
								{" "}
								<span
									style={{
										color: "#353535",
										fontSize: "20px",
									}}
								>
									{loading ? (
										<Skeleton.Button active={true} size="small" />
									) : (
										data?.["wo"]?.find((x: any) => x.status === "Pending")
											?.count || 0
									)}
								</span>
								<br />
								<span style={{ color: "#353535" }}>
									Work orders pending to be completed
								</span>
							</Col>
						</Row>

						<div></div>
					</Card>
				</Col>
				<Col span={6}>
					<Card
						className="dashboard-cards"
						style={{
							width: "100%",
							backgroundColor: "#FAFAFA",
							height: "100%",
						}}
					>
						<Row
							gutter={16 + 8 * 2}
							style={{ alignItems: "center", height: "100%" }}
							justify="center"
						>
							<Col span={6}>
								<div style={{ alignItems: "center" }}>
									<div className="circle_card">
										<CheckCircleOutlined
											style={{
												color: "#353535",
												padding: "10px",
												fontSize: "25px",
											}}
										/>
									</div>
								</div>
							</Col>
							<Col span={18}>
								{" "}
								<span
									style={{
										color: "#353535",
										fontSize: "20px",
									}}
								>
									{loading ? (
										<Skeleton.Button active={true} size="small" />
									) : (
										data?.["wo"]?.find((x: any) => x.status === "Completed")
											?.count || 0
									)}
								</span>
								<br />
								<span style={{ color: "#353535" }}>
									Work Orders pending for approval
								</span>
							</Col>
						</Row>

						<div></div>
					</Card>
				</Col>
			</Row>
			<br />
			<br />
			<Row>
				<Col className="dashboard-cards" span={14}>
					<Row>
						<Col span={24}>
							<div
								style={{
									backgroundColor: "#FAFAFA",
									height: "45px",
									padding: "13px 10px",
									borderRadius: "8px",
								}}
							>
								<span
									style={{
										color: "#353535",
										fontWeight: "bold",
									}}
								>
									Work Status
								</span>
							</div>
						</Col>
					</Row>
					<Row style={{ height: "400px", padding: "0px 2px" }}>
						<Col span={24}>
							<MapContainer
								style={{ height: "100%", zIndex: "2" }}
								center={[25.3548, 51.1839]}
								zoom={9}
							>
								<TileLayer
									attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
									url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
								/>
								<Marker position={[25.3548, 51.1839]}>
									<Popup>
										A pretty CSS3 popup. <br /> Easily customizable.
									</Popup>
								</Marker>
							</MapContainer>
						</Col>
					</Row>
				</Col>
				<Col span={10} style={{ paddingLeft: "12px" }}>
					<div className="dashboard-cards">
						<div
							style={{
								backgroundColor: "#FAFAFA",
								// height: "45px",
								padding: "13px 10px",
								width: "100%",
								borderRadius: "8px",
							}}
						>
							{/* <span
								style={{
									color: "#353535",
									fontWeight: "bold",
								}}
							>
								Alerts
							</span> */}
							<Table
								dataSource={alerts}
								pagination={false}
								locale={{ emptyText: "No Alerts" }}
								columns={[
									{
										dataIndex: "label",
										title: `Alerts`,
										render: (text) => (
											<div
												style={{
													backgroundColor: "#fff7e6",
													padding: "15px 10px",
													display: "flex",
													gap: "5px",
													alignItems: "center",
													borderRadius: "10px",
												}}
											>
												<WarningOutlined
													style={{ color: "red", fontSize: "20px" }}
												/>{" "}
												{text}
											</div>
										),
									},
								]}
							/>
						</div>
					</div>
				</Col>
			</Row>
		</>
	);
};

export default Dashboard;
