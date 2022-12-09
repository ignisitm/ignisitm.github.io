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
			<Row>
				<Col span={14}>
					<Row>
						<Col span={24}>
							<div
								style={{
									backgroundColor: "#FAFAFA",
									height: "45px",
									padding: "13px 10px",
								}}
							>
								<span style={{ color: "#353535", fontWeight: "bold" }}>
									Work Status
								</span>
							</div>
						</Col>
					</Row>
					<Row style={{ height: "500px", padding: "0px 2px" }}>
						<Col span={24}>
							<MapContainer
								style={{ height: "70%" }}
								center={[51.505, -0.09]}
								zoom={13}
							>
								<TileLayer
									attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
									url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
								/>
								<Marker position={[51.505, -0.09]}>
									<Popup>
										A pretty CSS3 popup. <br /> Easily customizable.
									</Popup>
								</Marker>
							</MapContainer>
						</Col>
					</Row>
				</Col>
				<Col span={10} style={{ paddingLeft: "12px" }}>
					<div
						style={{
							backgroundColor: "#FAFAFA",
							height: "45px",
							padding: "13px 10px",
							width: "100%",
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
				</Col>
			</Row>
		</>
	);
};

export default Dashboard;
