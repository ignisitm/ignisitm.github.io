import {
	Row,
	Col,
	Tabs,
	List,
	Avatar,
	Spin,
	Button,
	Empty,
	Pagination,
} from "antd";
import {
	ClockCircleTwoTone,
	LoadingOutlined,
	CheckCircleTwoTone,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { apiCall } from "../../axiosConfig";
import axios from "axios";
import { useLoaderContext } from "../../Components/Layout";
import SelectedWO from "./SelectedWO";

const workorders = [
	{
		id: 12,
		type: "Asset Tagging",
	},
	{
		id: 13,
		type: "ITM",
	},
];

type pagination_type = { current: number; pageSize: number; total: number };

const WorkOrder = () => {
	const { completeLoading } = useLoaderContext();
	const [viewSelectedWO, setViewSelectedWO] = useState<boolean>(false);
	const [loading, setLoading] = useState(false);
	const [workorders, setWorkorders] = useState([]);
	const [wo_status, setWo_status] = useState("Completed");
	const [selectedWO, setSelectedWO] = useState<any>(null);
	const [displayMap, setDisplayMap] = useState(false);
	const [isLoadingMap, setLoadingMap] = useState(false);
	const [coordinates, setCoordinates] = useState({
		lat: 25.3548,
		long: 51.1839,
	});
	const [pagination, setPagination] = useState<pagination_type>({
		current: 1,
		pageSize: 5,
		total: 0,
	});

	const onChange = (key: string) => {
		setSelectedWO(null);
		setWo_status(key);
		fetchData({ status: key, curr_pagination: { ...pagination, current: 1 } });
	};

	const fetchData = (
		{
			status = wo_status,
			initialLoading = false,
			curr_pagination = pagination,
		} = { status: wo_status, curr_pagination: pagination }
	) => {
		// curr_pagination: any = pagination,
		// search: string = searchText

		setLoading(true);
		// setShowClose(search ? true : false);
		let search: string = "";
		apiCall({
			method: "GET",
			url: `/workorders?status=${status}&page=${
				curr_pagination.current
			}&limit=${curr_pagination.pageSize}&searchText=${search || ""}`,
			handleResponse: (res) => {
				console.log(res);
				setWorkorders(res.data.message);
				setLoading(false);
				if (res.data.message.length > 0) {
					let total = res.data.message[0].full_count;
					setPagination({ ...curr_pagination, total });
				}
				if (initialLoading) completeLoading();
			},
			handleError: () => {
				// setLoading(false);
				if (initialLoading) completeLoading();
			},
		});
	};

	const getMap = (building_no: string, street_no: string, zone_no: string) => {
		axios
			.post(
				`https://services.gisqatar.org.qa/server/rest/services/Vector/QARS1/MapServer/0/query?f=json&where=ZONE_NO%20%3D${zone_no}%20and%20STREET_NO%3D${street_no}%20and%20BUILDING_NO%3D${building_no}&returnGeometry=true&spatialRel=esriSpatialRelIntersects&outFields=ZONE_NO%2CSTREET_NO%2CBUILDING_NO%2CQARS%2CELECTRICITY_NO%2CWATER_NO%2CQTEL_ID`
			)
			.then((res) => {
				let x = res.data.features[0].geometry.x;
				let y = res.data.features[0].geometry.y;
				console.log(x, y);
				setLoadingMap(true);
				apiCall({
					method: "POST",
					url: `/coordinates`,
					data: { coordinates: { x, y } },
					handleResponse: (res) => {
						setLoadingMap(false);
						console.log("lat :", res.data.message.y);
						let lat = res.data.message.y;
						let long = res.data.message.x;
						console.log("Long : ", res.data.message.x);
						setCoordinates({ lat, long });
						setDisplayMap(true);
					},
					handleError: (err) => {
						setDisplayMap(false);
						setLoadingMap(false);
					},
				});
			})
			.catch((res) => {
				setDisplayMap(false);
				setLoadingMap(false);
			});
	};

	useEffect(() => {
		fetchData({ initialLoading: true });
	}, []);

	const selectWorkOrder = (wo: any) => {
		setSelectedWO(wo);
		getMap(wo.building_no, wo.street_no, wo.zone_no);
	};

	return viewSelectedWO ? (
		<SelectedWO
			wo={{ ...selectedWO, ...coordinates }}
			exit={() => setViewSelectedWO(false)}
		/>
	) : (
		<div>
			<Row>
				<Col span={24}>
					<Tabs
						defaultActiveKey={wo_status}
						onChange={onChange}
						items={[
							{
								label: `Completed`,
								key: "Completed",
							},
							{
								label: `Pending`,
								key: "Pending",
							},
						]}
					/>
				</Col>
				<Col style={{ width: "300px" }}>
					{loading ? (
						<div className="wo-loader">
							<Spin />
						</div>
					) : (
						<div className="list-holder">
							{workorders.length <= 0 ? (
								<div className="wo-empty">
									<Empty />
								</div>
							) : (
								<List
									itemLayout="horizontal"
									dataSource={workorders}
									renderItem={(item: any) => (
										<List.Item
											className="workorders-list"
											onClick={() => selectWorkOrder(item)}
										>
											<List.Item.Meta
												avatar={
													<Avatar
														size={40}
														gap={4}
														style={{
															color: "#f56a00",
															backgroundColor: "#fde3cf",
															fontSize: "16px",
														}}
													>
														{item.type === "Asset Tagging"
															? "AT"
															: item.type === "ITM"
															? "ITM"
															: "O"}
													</Avatar>
												}
												title={
													<span
														className={`wo-card-title ${
															selectedWO?.wo_id === item.wo_id ? "selected" : ""
														}`}
													>
														Work Order #{item.wo_id}
													</span>
												}
												description={
													<div className="wo_card_desc">
														<span className="wo-label">
															{item.building_name}
														</span>
														{item.status === "Completed" ? (
															<CheckCircleTwoTone twoToneColor={"#03B800"} />
														) : (
															<ClockCircleTwoTone twoToneColor={"#FFAE00"} />
														)}{" "}
														{item.status}
													</div>
												}
											/>
										</List.Item>
									)}
								/>
							)}
						</div>
					)}
				</Col>
				<Col style={{ width: "calc(100% - 310px)", marginLeft: "10px" }}>
					<div className="wo-view">
						{selectedWO ? (
							<>
								<div className="wo-view-action-buttons">
									<Button
										type="primary"
										onClick={() => setViewSelectedWO(true)}
									>
										{wo_status === "Completed" ? "View WO" : "View Progress"}
									</Button>
									{/* {wo_status === "Completed" ? (
										<div className="action-buttons">
											<Button
												type="primary"
												onClick={() => setViewSelectedWO(true)}
											>
												View
											</Button>
											<span className="success-button">
												<Button type="primary">Approve</Button>
											</span>
											<Button danger type="primary">
												Reschedule
											</Button>
										</div>
									) : (
										<Button type="primary">View Progress</Button>
									)} */}
								</div>
								<div className="wo-view-header">
									Work Order #{selectedWO.wo_id}
								</div>
								<div className="wo-view-sub-header">{selectedWO.type}</div>
								<div>
									{selectedWO.building_name.trim()}, {selectedWO.building_area}
								</div>
								<div>
									<b>Description:</b> {selectedWO.details}
								</div>
								<br />
								<Col md={12} xs={24} style={{ height: "250px" }}>
									<div
										style={{
											width: "100%",
											height: "90%",
											paddingLeft: "10px",
										}}
									>
										{displayMap ? (
											<MapContainer
												style={{
													height: "100%",
													borderRadius: "10px",
												}}
												center={[coordinates.lat, coordinates.long]}
												zoom={14}
											>
												<TileLayer
													attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
													url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
												/>
												<Marker position={[coordinates.lat, coordinates.long]}>
													<Popup>
														A pretty CSS3 popup. <br /> Easily customizable.
													</Popup>
												</Marker>
											</MapContainer>
										) : (
											<div
												style={{
													width: "100%",
													height: "100%",
													backgroundColor: "#F7F7F7",
													borderRadius: "10px",
													fontSize: "25px",
													display: "flex",
													justifyContent: "center",
													alignItems: "center",
												}}
											>
												{" "}
												{isLoadingMap && <LoadingOutlined />}{" "}
											</div>
										)}
									</div>
								</Col>
								<br />
								<div>Assigned to: {selectedWO.assigned_to} (Lead)</div>
							</>
						) : (
							<div className="wo-empty">
								<Empty description="Select a Work Order to View" />
							</div>
						)}
					</div>
				</Col>
			</Row>
			<br />
			<Pagination
				current={pagination.current}
				onChange={(page, pageSize) => {
					let new_pagination = { ...pagination, current: page, pageSize };
					setPagination(new_pagination);
					fetchData({
						curr_pagination: new_pagination,
					});
				}}
				pageSize={pagination.pageSize}
				total={pagination.total}
				showTotal={(total, range) =>
					`${range[0]}-${range[1]} of ${total} items`
				}
			/>
		</div>
	);
};

export default WorkOrder;
