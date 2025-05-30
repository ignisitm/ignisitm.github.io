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
	Progress,
	Divider,
	Space,
	Modal,
	Table,
	Popover,
	Drawer,
	Input,
	Badge,
	Tag,
	message,
} from "antd";
import {
	ClockCircleTwoTone,
	LoadingOutlined,
	CheckCircleTwoTone,
	ExclamationCircleTwoTone,
	ClusterOutlined,
	MessageOutlined,
	DeleteOutlined,
	AudioFilled,
	OrderedListOutlined,
	SnippetsOutlined,
	LeftCircleOutlined,
	ArrowLeftOutlined,
	UndoOutlined,
} from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { apiCall } from "../../axiosConfig";
import axios from "axios";
import { useLoaderContext } from "../../Components/Layout";
import SelectedWO from "./SelectedWO";
import { getUser } from "../../Auth/Auth";
import { useAudioRecorder } from "react-audio-voice-recorder";

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
	const user = getUser();
	const mssgsBottom = useRef<HTMLDivElement>(null);
	const { completeLoading } = useLoaderContext();
	const [viewSelectedWO, setViewSelectedWO] = useState<boolean>(false);
	const [loading, setLoading] = useState(false);
	const [workorders, setWorkorders] = useState([]);
	const [wo_status, setWo_status] = useState("");
	const [selectedWO, setSelectedWO] = useState<any>(null);
	const [selectedWOResources, setSelectedWOResources] = useState<any>(null);
	const [displayMap, setDisplayMap] = useState(false);
	const [isLoadingMap, setLoadingMap] = useState(false);
	const [viewAssets, setViewAssets] = useState(false);
	const [selectingWorkOrder, setSelectingWorkOrder] = useState(false);
	const [pendingProcedures, setPendingProcedures] = useState([]);
	const [completedProcedures, setCompletedProcedures] = useState([]);
	const [open, setOpen] = useState(false);
	const [newMessage, setNewMessage] = useState("");
	const [pendingDefects, setPendingDefects] = useState([]);
	const [completedDefects, setCompletedDefects] = useState([]);
	const [cancelRecording, setCancelRecording] = useState(false);
	const [coordinates, setCoordinates] = useState({
		lat: 25.3548,
		long: 51.1839,
	});
	const [pagination, setPagination] = useState<pagination_type>({
		current: 1,
		pageSize: 5,
		total: 0,
	});
	const [mssgCount, setMessageCount] = useState<any>(null);
	const {
		startRecording,
		stopRecording,
		togglePauseResume,
		recordingBlob,
		isRecording,
		isPaused,
		recordingTime,
		mediaRecorder,
	} = useAudioRecorder();
	const [remarks, setRemarks] = useState<any[]>([]);
	const onChange = (key: string) => {
		setSelectedWO(null);
		setWo_status(key);
		fetchData({ status: key, curr_pagination: { ...pagination, current: 1 } });
	};
	const [procedurePage, setProcedurePage] = useState(1);
	const [procedureDetailsLoading, setProcedureDetailsLoading] = useState(false);
	const [procedureDetails, setProcedureDetails] = useState<any>(null);
	const [selectedProcedure, setSelectedProcedure] = useState<any>();
	const [approving, setApproving] = useState(false);
	const [loadingDefectImage, setLoadingDefectImage] = useState(0);
	const [messageApi, contextHolder] = message.useMessage();

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
			url: `/clientworkorders?${status ? "status=" + status + "&" : ""}page=${
				curr_pagination.current
			}&limit=${curr_pagination.pageSize}&searchText=${search || ""}`,
			handleResponse: (res) => {
				console.log(res);
				setWorkorders(res.data.message);
				setLoading(false);
				if (res.data.message.length > 0) {
					let total = res.data.message[0].full_count;
					setPagination({ ...curr_pagination, current: 1, total });
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

	const selectWorkOrder = (wo: any, showMessage: any = false) => {
		// setSelectedWO(wo);
		setSelectingWorkOrder(true);

		apiCall({
			method: "GET",
			url: "/clientmessages/" + wo.id,
			handleResponse: (res) => {
				console.log(res);
				setRemarks(res.data.message);
				scrollToBottom();
				// setPendingAssets(res.data.message.passets);
				// setCompletedAssets(res.data.message.cassets);
			},
		});
		if (wo.notification_type === "ITM")
			apiCall({
				method: "GET",
				url: "/ITM?wo_id=" + wo.id,
				handleResponse: (res) => {
					console.log(res);
					setPendingProcedures(res.data.message.pprocedures);
					setCompletedProcedures(res.data.message.cprocedures);
				},
			});
		else if (wo.notification_type === "Corrective")
			apiCall({
				method: "GET",
				url: "/DefectWO?wo_id=" + wo.id,
				handleResponse: (res) => {
					console.log(res);
					setPendingDefects(res.data.message.pdefects);
					setCompletedDefects(res.data.message.cdefects);
				},
			});
		apiCall({
			method: "GET",
			url: "/clientworkorders/" + wo.id,
			handleResponse: (res) => {
				console.log(res);
				setMessageCount(res.data.message.message_count);
				let resData = res.data.message.data;
				getMap(resData.building_no, resData.street_no, resData.zone_no);
				let resources = {
					employees: res.data.message.employees,
					equipments: res.data.message.resources,
				};
				resData.id = wo.id;
				let start_date = new Date(resData.wo_start);
				resData.wo_start = start_date.toLocaleString([], {
					day: "2-digit",
					month: "long",
					weekday: "long",
					hour: "2-digit",
					minute: "2-digit",
					timeZoneName: "longOffset",
					dayPeriod: "short",
				});
				let end_date = new Date(resData.wo_end);
				resData.wo_end = end_date.toLocaleString([], {
					day: "2-digit",
					month: "long",
					weekday: "long",
					hour: "2-digit",
					minute: "2-digit",
					timeZoneName: "longOffset",
					dayPeriod: "short",
				});
				// resData.wo_status = wo.wo_status;
				setSelectedWO(resData);
				setSelectedWOResources(resources);
				setSelectingWorkOrder(false);
				if (showMessage) messageApi.destroy();
			},
			handleError: (err) => {
				setSelectingWorkOrder(false);
				if (showMessage) messageApi.destroy();
			},
		});
		//
	};

	const randomIntFromInterval = (min: number, max: number) => {
		// min and max included
		return Math.floor(Math.random() * (max - min + 1) + min);
	};

	const getAssetResult = (id: any) => {
		setProcedureDetails(null);
		setProcedureDetailsLoading(true);
		apiCall({
			method: "GET",
			url: "/ITMView?wo_id=" + selectedWO.id + "&procedure_id=" + id,
			handleResponse: (res) => {
				setProcedureDetails(res.data.message);
				setProcedureDetailsLoading(false);
			},
			handleError: () => {
				setProcedureDetailsLoading(false);
			},
		});
	};

	const viewResult = (id: any, val: any) => {
		let color, text;
		if (val === "Y") {
			color = "green";
			text = "PASSED";
		} else if (val === "N") {
			color = "red";
			text = "FAILED";
		} else {
			color = "";
			text = "N/A";
		}
		return (
			<>
				<Tag color={color}>{text}</Tag>
			</>
		);
	};

	const PassetColumns = [
		{
			title: "Code",
			dataIndex: "code",
		},
		{
			title: "Procedure",
			dataIndex: "procedure",
		},
		{
			title: "Activity",
			dataIndex: "activity",
		},
		{
			title: "AHJ",
			dataIndex: "ahj",
		},
	];

	const CassetColumns = [
		...PassetColumns,
		{
			title: "Result",
			dataIndex: "result",
			render: (result: any, row: any) => viewResult(row.id, result),
		},
		{
			title: " ",
			dataIndex: "id",
			render: (id: any, row: any) => (
				<Button
					onClick={() => {
						setSelectedProcedure(row);
						setProcedurePage(2);
						getAssetResult(id);
					}}
					type="link"
				>
					View More...
				</Button>
			),
		},
	];

	const procedureDetailCols = [
		{
			title: "Asset",
			dataIndex: "name",
		},
		{
			title: "Tag",
			dataIndex: "tag",
		},
	];

	const pDefects = [
		{
			title: "Asset",
			dataIndex: "name",
		},
		{
			title: "Tag",
			dataIndex: "tag",
		},
		{
			title: "Description",
			dataIndex: "description",
		},
		{
			title: "Image",
			dataIndex: "id",
			width: "20%",
			render: (id: any, row: any) =>
				row.image ? (
					id === loadingDefectImage ? (
						<>
							{" "}
							<LoadingOutlined /> Loading Image...
						</>
					) : (
						<Button
							type="link"
							onClick={() => {
								setLoadingDefectImage(id);
								apiCall({
									method: "GET",
									url: "DefectWO/" + id,
									handleResponse: (res) => {
										console.log(res);
										let url = res?.data?.message?.url || "";
										window?.open(url, "_blank")?.focus();
										setLoadingDefectImage(0);
									},
									handleError: (err) => {
										setLoadingDefectImage(0);
									},
								});
							}}
						>
							View
						</Button>
					)
				) : (
					"No image uploaded"
				),
		},
	];

	const cDefects = [
		{
			title: "Asset",
			dataIndex: "name",
		},
		{
			title: "Tag",
			dataIndex: "tag",
		},
		{
			title: "Description",
			dataIndex: "description",
		},
		{
			title: "Action Taken",
			dataIndex: "action_taken",
		},
		{
			title: "Image",
			dataIndex: "id",
			width: "20%",
			render: (id: any, row: any) =>
				row.action_image ? (
					id === loadingDefectImage ? (
						<>
							{" "}
							<LoadingOutlined /> Loading Image...
						</>
					) : (
						<Button
							type="link"
							onClick={() => {
								setLoadingDefectImage(id);
								apiCall({
									method: "GET",
									url: "DefectWOView/" + id,
									handleResponse: (res) => {
										console.log(res);
										let url = res?.data?.message?.url || "";
										window?.open(url, "_blank")?.focus();
										setLoadingDefectImage(0);
									},
									handleError: (err) => {
										setLoadingDefectImage(0);
									},
								});
							}}
						>
							View
						</Button>
					)
				) : (
					"No image uploaded"
				),
		},
		...(selectedWO?.wo_status === "Approved"
			? []
			: [
					{
						title: "Action",
						dataIndex: "id",
						render: (id: any, row: any) => (
							<Button
								type="link"
								onClick={() => {
									messageApi.open({
										type: "loading",
										content: "Updating Work Order",
										duration: 0,
									});
									apiCall({
										url: "/DefectWOView",
										method: "POST",
										data: {
											wo_id: selectedWO?.id,
											defect_id: id,
										},
										handleResponse: (res) => {
											fetchData();
											selectWorkOrder(selectedWO, true);
										},
									});
								}}
							>
								Reset
							</Button>
						),
					},
			  ]),
	];

	const defectiveAssetsCols = [
		{
			title: "Asset",
			dataIndex: "name",
		},
		{
			title: "Tag",
			dataIndex: "tag",
		},
		{
			title: "Reason",
			dataIndex: "description",
		},
		{
			title: "Image",
			dataIndex: "id",
			width: "20%",
			render: (id: any, row: any) =>
				row.image ? (
					id === loadingDefectImage ? (
						<>
							{" "}
							<LoadingOutlined /> Loading Image...
						</>
					) : (
						<Button
							type="link"
							onClick={() => {
								setLoadingDefectImage(id);
								apiCall({
									method: "GET",
									url: "ITMDefect/" + id,
									handleResponse: (res) => {
										console.log(res);
										let url = res?.data?.message?.url || "";
										window?.open(url, "_blank")?.focus();
										setLoadingDefectImage(0);
									},
									handleError: (err) => {
										setLoadingDefectImage(0);
									},
								});
							}}
						>
							View
						</Button>
					)
				) : (
					"No image uploaded"
				),
		},
	];

	const showDrawer = () => {
		setOpen(true);
	};

	const onClose = () => {
		setOpen(false);
	};

	const scrollToBottom = () => {
		mssgsBottom.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		if (!recordingBlob) return;
		console.log(recordingBlob);
		// recordingBlob will be present at this point after 'stopRecording' has been called
		if (!cancelRecording) {
			const url = URL.createObjectURL(recordingBlob);
			let content = (
				<audio controls>
					<source src={url} type={recordingBlob.type}></source>
				</audio>
			);
			submitChat(content);
		} else setCancelRecording(false);
	}, [recordingBlob]);

	const submitChat = (content: any = newMessage) => {
		if (content === newMessage) {
			apiCall({
				method: "POST",
				url: "/clientmessages/" + selectedWO.id,
				data: {
					wo_id: selectedWO.id,
					message: content,
					type: "Text",
				},
				handleResponse: (res) => console.log(res),
			});
		}

		setRemarks((e) => [
			...e,
			{
				createdby: user.username,
				type: content !== newMessage ? "Voice" : "Text",
				message: content,
			},
		]);
		setNewMessage("");
	};

	useEffect(() => {
		scrollToBottom();
	}, [remarks]);

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
								label: `All`,
								key: "",
							},
							{
								label: `Pending`,
								key: "Pending",
							},
							{
								label: `In Progress`,
								key: "In Progress",
							},
							{
								label: `Completed`,
								key: "Completed",
							},
							{
								label: `Approved`,
								key: "Approved",
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
												// avatar={

												// }
												// title={}
												description={
													<>
														<div
															style={{
																marginTop: "10px",
																marginRight: "12px",
																position: "relative",
																float: "right",
															}}
														>
															<Progress
																type="circle"
																percent={
																	item.wo_status === "Completed"
																		? 100
																		: item.pending_procedures?.length +
																		  item.completed_procedures?.length
																		? parseFloat(
																				(
																					(item.completed_procedures?.length /
																						(item.pending_procedures?.length +
																							item.completed_procedures
																								?.length)) *
																					100
																				).toFixed(1)
																		  )
																		: 0
																}
																size={50}
															/>
														</div>
														<>
															<span
																className={`wo-card-title ${
																	selectedWO?.id === item.id ? "selected" : ""
																}`}
															>
																Work Order #{item.id}
															</span>
														</>

														<div className="wo_card_desc">
															<span>System: {item.name}</span>
															<span className="wo-label">
																{item.building_name}
															</span>
															{item.wo_status === "Approved" ? (
																<CheckCircleTwoTone twoToneColor={"Orange"} />
															) : item.wo_status === "Completed" ? (
																<CheckCircleTwoTone twoToneColor={"#03B800"} />
															) : item.wo_status === "Pending" ? (
																<ExclamationCircleTwoTone
																	twoToneColor={"#FFAE00"}
																/>
															) : (
																<ClockCircleTwoTone />
															)}{" "}
															{item.wo_status}
														</div>
													</>
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
						{selectedWO && !selectingWorkOrder ? (
							<>
								{/* <div className="wo-view-action-buttons">
									<Button
										type="primary"
										onClick={() => setViewSelectedWO(true)}
									>
										{wo_status === "Completed" ? "View WO" : "View Progress"}
									</Button> */}
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
								{/* </div> */}
								{/* <div className="wo-view-sub-header">{selectedWO.type}</div> */}
								{/* <div>
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
								</Col> */}
								<Row>
									<Col span={14}>
										<div className="wo-view-header">
											Work Order #{selectedWO.id}
										</div>
										<br />
										<Space>
											<Button
												onClick={() => setViewAssets(true)}
												icon={<OrderedListOutlined />}
											>
												{selectedWO.notification_type === "ITM"
													? "View Procedures"
													: "View Assets"}
											</Button>
											<Badge count={selectedWO.message_count?.count || 0}>
												<Button onClick={showDrawer} icon={<MessageOutlined />}>
													View Messages
												</Button>
											</Badge>
										</Space>
										<br />
										<br />
										<b>Start Date : </b>
										{selectedWO.wo_start}
										<br />
										<b>End Date : </b>
										{selectedWO.wo_end}
										<br />
										<br />
										{/* <h3>Resources:</h3> */}
										<b>Assigned to: </b>
										{selectedWO.leadexecutor_name}
										<br />
										<b>Team: </b>
										{selectedWOResources?.employees
											?.map((emp: any) => emp.full_name)
											.join(", ")}
										<br />
										<b>Equipments: </b>
										{selectedWOResources?.equipments
											?.map((res: any) => res.name)
											.join(", ")}
										<br />
										<br />
										<b>Notification Id: </b>
										{selectedWO.notification_id}
										<br />
										<b>System: </b>
										{selectedWO.name + " - " + selectedWO.tag}
										<br />
										<b>Contract: </b> {selectedWO.contract_id}
									</Col>
									<Col span={10}>
										<div
											style={{
												width: "100%",
												height: "95%",
												paddingLeft: "10px",
												paddingTop: "10px",
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
													<Marker
														position={[coordinates.lat, coordinates.long]}
													>
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
										<div
											style={{
												paddingTop: "5px",
												paddingLeft: "20px",
												textAlign: "center",
											}}
										>
											<b>{selectedWO.building_name}</b> <br />
											<span>Bldg No. {selectedWO.building_no}, </span>
											<span>Street No. {selectedWO.street_no}, </span>
											<span>Zone No. {selectedWO.zone_no}</span>
											{selectedWO.unit_no && (
												<span>, Unit No {selectedWO.unit_no}</span>
											)}
										</div>
									</Col>
								</Row>
								<br />
								<b>Notification Description: </b>
								<br />
								{selectedWO.description}
								<br />
								<br />
								{selectedWO.wo_status === "Completed" ? (
									<Button
										loading={approving}
										onClick={() => {
											setApproving(true);
											apiCall({
												method: "PUT",
												url:
													selectedWO.notification_type === "ITM"
														? "/ITM"
														: "/DefectWO",
												data: {
													wo_id: selectedWO?.id,
													notification_id: selectedWO?.notification_id,
												},
												handleResponse: (res) => {
													setApproving(false);
													fetchData();
													setSelectedWO(null);
													message.success("Work Order Approved.");
												},
												handleError: (err) => {
													setApproving(false);
												},
											});
											// apiCall({
											// 	method: "PUT",
											// 	url: "/clientnotifications",
											// 	data: {
											// 		id: selectedWO?.notification_id,
											// 		data: {
											// 			wo_status: "CLOSED",
											// 		},
											// 	},
											// 	handleResponse: (res) => {
											// 		console.log(res);
											// 	},
											// });
										}}
										type="primary"
									>
										Approve
									</Button>
								) : null}
								{/* <Divider orientation="right"></Divider> */}
							</>
						) : (
							<div className="wo-empty">
								{selectingWorkOrder ? (
									<Spin size="large" />
								) : (
									<Empty description="Select a Work Order to View" />
								)}
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
			<Modal
				title={"Work Order # " + selectedWO?.id}
				destroyOnClose={true}
				open={viewAssets}
				width={"80%"}
				style={{ minWidth: "632px", top: "20px" }}
				onCancel={() => {
					setViewAssets(false);
					setProcedurePage(1);
				}}
				footer={false}
			>
				{procedurePage === 1 && <br />}
				<Tabs
					style={procedurePage === 1 ? {} : { display: "none" }}
					type="card"
					defaultActiveKey="completed"
					items={
						selectedWO?.notification_type === "ITM"
							? [
									{
										key: "completed",
										label: "Completed Procedures",
										children: (
											<Table
												dataSource={completedProcedures}
												columns={CassetColumns}
											/>
										),
									},
									{
										key: "pending",
										label: "Pending Procedures",
										children: (
											<Table
												dataSource={pendingProcedures}
												columns={PassetColumns}
											/>
										),
									},
							  ]
							: [
									{
										key: "completed",
										label: "Corrected Defects",
										children: (
											<Table dataSource={completedDefects} columns={cDefects} />
										),
									},
									{
										key: "pending",
										label: "Pending Defects",
										children: (
											<Table dataSource={pendingDefects} columns={pDefects} />
										),
									},
							  ]
					}
				/>

				{procedurePage === 2 && (
					<>
						<Button
							shape="circle"
							icon={<ArrowLeftOutlined />}
							onClick={() => {
								setProcedurePage(1);
							}}
						/>
						<b
							style={{
								position: "relative",
								top: "1px",
								fontSize: "16px",
								marginLeft: "10px",
							}}
						>
							Procedure {selectedProcedure?.code || ""}
						</b>
						{selectedProcedure?.result === "N" && (
							<Tag style={{ marginLeft: "10px" }} color="red">
								Failed
							</Tag>
						)}
						{selectedProcedure?.result === "Y" && (
							<Tag style={{ marginLeft: "10px" }} color="green">
								Passed
							</Tag>
						)}
						{selectedProcedure?.result === "NA" && (
							<Tag style={{ marginLeft: "10px" }} color="">
								Not Applicable
							</Tag>
						)}
						{selectedWO?.wo_status !== "Approved" && (
							<Button
								type="primary"
								style={{ float: "right", margin: "3px 10px" }}
								icon={<UndoOutlined />}
								loading={procedureDetailsLoading}
								onClick={() => {
									messageApi.open({
										type: "loading",
										content: "Updating Work Order",
										duration: 0,
									});
									apiCall({
										url: "/ITMView",
										method: "POST",
										data: {
											wo_id: selectedWO?.id,
											procedure_id: selectedProcedure?.id,
											itm_id: procedureDetails?.itmdata.id,
										},
										handleResponse: (res) => {
											fetchData();
											selectWorkOrder(selectedWO, true);
											setProcedurePage(1);
										},
									});
								}}
							>
								Reset Procedure
							</Button>
						)}
						<div style={{ height: "12px" }} />
						{selectedProcedure?.result === "N" && (
							<>
								<b style={{ marginBottom: "20px" }}>Reason: </b>
								{procedureDetails?.itmdata.reason || ""}
								<br />
							</>
						)}

						<b style={{ marginBottom: "20px" }}>Remarks: </b>
						{procedureDetails?.itmdata.remarks || ""}
						<div style={{ height: "12px" }} />
						<Tabs
							type="card"
							defaultActiveKey="checkedAssets"
							items={[
								{
									key: "checkedAssets",
									label: "Checked Assets",
									children: (
										<Table
											dataSource={procedureDetails?.assets || []}
											loading={procedureDetailsLoading}
											columns={procedureDetailCols}
										/>
									),
								},
								...(selectedProcedure?.result === "N"
									? [
											{
												key: "defectiveAssets",
												label: "Defective Assets",
												children: (
													<Table
														dataSource={procedureDetails?.defects || []}
														loading={procedureDetailsLoading}
														columns={defectiveAssetsCols}
													/>
												),
											},
									  ]
									: []),
							]}
						/>
					</>
				)}

				{/*  */}
			</Modal>
			<Drawer
				title={`Work Order #${selectedWO?.id}`}
				placement="right"
				onClose={onClose}
				open={open}
			>
				<List
					size="small"
					split={false}
					bordered
					locale={{
						emptyText: "No Messages",
					}}
					dataSource={remarks}
					renderItem={(item) =>
						item.createdby === user.username ? (
							<List.Item style={{ justifyContent: "end" }}>
								<div className="bubble-self" style={{ float: "right" }}>
									<label style={{ fontWeight: "bold" }}>You</label>
									<br />
									{item.type === "Voice" ? (
										<audio controls>
											<source src={""}></source>
										</audio>
									) : (
										item.message
									)}
								</div>
							</List.Item>
						) : (
							<List.Item>
								<div className="bubble" style={{ float: "right" }}>
									<label style={{ fontWeight: "bold" }}>{item.name}</label>
									<br />
									{item.type === "Voice" ? (
										<audio controls>
											<source src={""}></source>
										</audio>
									) : (
										item.message
									)}
								</div>
							</List.Item>
						)
					}
					style={{ height: "calc(100% - 44px)", overflow: "scroll" }}
					footer={<div ref={mssgsBottom} />}
				/>
				<Space.Compact style={{ width: "100%", marginTop: "4px" }}>
					{isRecording ? (
						<Input
							value={`Recording... ${new Date(recordingTime * 1000)
								.toISOString()
								.substring(14, 19)}`}
							disabled={true}
							className="selected-building"
						/>
					) : (
						<Input
							value={newMessage}
							onChange={(e) => setNewMessage(e.currentTarget.value)}
							onPressEnter={() => submitChat()}
						/>
					)}
					<Button
						onClick={() => {
							if (isRecording) stopRecording();
							else submitChat();
						}}
					>
						Send
					</Button>
					{isRecording ? (
						<Button
							onClick={() =>
								setCancelRecording((e) => {
									stopRecording();
									return true;
								})
							}
							icon={<DeleteOutlined />}
						/>
					) : (
						<Button onClick={startRecording} icon={<AudioFilled />} />
					)}
				</Space.Compact>
			</Drawer>
			{contextHolder}
		</div>
	);
};

export default WorkOrder;
