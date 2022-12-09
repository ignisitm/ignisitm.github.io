import { FC, useState, useEffect } from "react";
import { Table, Button, Row, Col, Tooltip, Card } from "antd";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { apiCall } from "../../axiosConfig";
import axios from "axios";
import {
	ArrowLeftOutlined,
	LoadingOutlined,
	PlusOutlined,
} from "@ant-design/icons";

interface SelectedWO_props {
	wo: any;
	exit: Function;
}

const SelectedWO: FC<SelectedWO_props> = ({ wo, exit }) => {
	const [assets, setAssets] = useState([]);

	useEffect(() => {
		getAssets();
	}, []);

	const columns = [
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
		},
		{
			title: (
				<Tooltip
					placement="topRight"
					title="Release all technicians and send to Notification for scheduling"
				>
					<Button size="small" danger type="primary">
						Release Team
					</Button>
				</Tooltip>
			),
			dataIndex: "id",
			key: "id",
			render: (record: any) => (
				<Button type="link" size="small" danger>
					{record === 32 ? "Re-Assign" : "Release"}
				</Button>
			),
		},
	];

	const dataSource = [
		{
			key: "1",
			name: "Vishal Kashyap (Lead)",
			id: 32,
			address: "10 Downing Street",
		},
		{
			key: "2",
			name: "Gokul Shaji",
			id: 42,
			address: "10 Downing Street",
		},
		{
			key: "3",
			name: "User Tester",
			id: 44,
			address: "10 Downing Street",
		},
	];

	const getAssets = () => {
		apiCall({
			method: "GET",
			url: `assets/getassetsforwo?id=${wo.wo_id}`,
			handleResponse: (res) => {
				console.log("wo assets: ", res);
				setAssets(res.data.message);
			},
		});
	};

	return (
		<>
			<div style={{ height: "12px" }} />
			<Row>
				<div style={{ width: "45px", marginTop: "10px" }}>
					<Tooltip title="Go Back" placement="left">
						<Button
							onClick={() => exit()}
							shape="circle"
							icon={<ArrowLeftOutlined />}
						/>
					</Tooltip>
				</div>
				<div>
					<div className="wo-view-header">Work Order #{wo.wo_id}</div>
				</div>
			</Row>
			<Row>
				<Col span={18}>
					<div
						className="wo-view-sub-header"
						style={{ marginLeft: "48px", marginBottom: "15px" }}
					>
						{wo.type}
					</div>

					<div>
						{wo.building_name.trim()}, {wo.building_area}
					</div>
					<div>
						<b>Description:</b> {wo.details}
					</div>
					<br />
					{wo.type === "Asset Tagging" ? (
						<>
							<h2>Tagged Assets</h2>
							<Row>
								{assets.map((asset: any) => (
									<Card
										className="assets-card"
										style={{ width: 300, margin: "12px 12px", padding: "5px" }}
									>
										<div style={{ display: "flex" }}>
											<div>
												<img height={70} width={70} src={asset.image} />
											</div>
											<div style={{ marginLeft: "20px" }}>
												<Row>{asset.asset_tag}</Row>
												<Row>Floor: {asset.floor_no}</Row>
												<Row>Room: {asset.room_no}</Row>
											</div>
										</div>
										<br />
										<div>
											<b>Device: </b>
											{asset.device}
										</div>
										<div>
											{" "}
											<b>System:</b> {asset.system}
										</div>
									</Card>
								))}
							</Row>
						</>
					) : null}
					{/* <br /> 
			<Col md={12} xs={24} style={{ height: "250px" }}>
				<div
					style={{
						width: "100%",
						height: "90%",
						paddingLeft: "10px",
					}}
				>
					<MapContainer
						style={{
							height: "100%",
							borderRadius: "10px",
						}}
						center={[wo.lat, wo.long]}
						zoom={14}
					>
						<TileLayer
							attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
							url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
						/>
						<Marker position={[wo.lat, wo.long]}>
							<Popup>
								A pretty CSS3 popup. <br /> Easily customizable.
							</Popup>
						</Marker>
					</MapContainer>
				</div>
			</Col>
			<br /> */}
					{/* <div>
						<b>Assigned to:</b> {wo.assigned_to} (Lead)
					</div> */}
				</Col>
				<Col span={6}>
					<div>
						<b>Assigned Team:</b>{" "}
						<Button
							style={{ float: "right" }}
							size="small"
							icon={<PlusOutlined />}
						>
							Add Technicians
						</Button>
					</div>

					<br />
					<Table size="small" dataSource={dataSource} columns={columns} />
				</Col>
			</Row>
		</>
	);
};

export default SelectedWO;
