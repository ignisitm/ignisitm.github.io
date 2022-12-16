import { Card } from "antd";
import { Row, Col } from "antd";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useLoaderContext } from "../../Components/Layout";
import {
	UsergroupAddOutlined,
	BankOutlined,
	BellOutlined,
	FormOutlined,
} from "@ant-design/icons";
import { useEffect } from "react";

const Dashboard = () => {
	const { completeLoading } = useLoaderContext();

	useEffect(() => {
		completeLoading();
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
										<BankOutlined
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
								<span style={{ color: "#353535", fontSize: "20px" }}>2</span>
								<br />
								<span style={{ color: "#353535" }}>
									New buildings require asset tagging
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
										<FormOutlined
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
								<span style={{ color: "#353535", fontSize: "20px" }}>79</span>
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
										<BellOutlined
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
								<span style={{ color: "#353535", fontSize: "20px" }}>12</span>
								<br />
								<span style={{ color: "#353535" }}>
									Notifications pending for approval
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
								<div style={{ alignItems: "center", height: "100%" }}>
									<div className="circle_card">
										<UsergroupAddOutlined
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
								<span style={{ color: "#353535", fontSize: "20px" }}>
									167/266
								</span>
								<br />
								<span style={{ color: "#353535" }}>
									Technicians working currently on site
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
								<span style={{ color: "#353535", fontWeight: "bold" }}>
									Work Status
								</span>
							</div>
						</Col>
					</Row>
					<Row style={{ height: "400px", padding: "0px 2px" }}>
						<Col span={24}>
							<MapContainer
								style={{ height: "100%" }}
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
								height: "45px",
								padding: "13px 10px",
								width: "100%",
								borderRadius: "8px",
							}}
						>
							<span
								style={{
									color: "#353535",
									fontWeight: "bold",
								}}
							>
								Recent Activity
							</span>
						</div>
						<div className="recentActivity">
							<p style={{ padding: "10px" }}>No recent Activity</p>
						</div>
					</div>
				</Col>
			</Row>
		</>
	);
};

export default Dashboard;
