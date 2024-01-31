import { useState, useEffect, FC } from "react";
import { useParams, Link } from "react-router-dom";
import { apiCall } from "../../axiosConfig";
import {
	LoadingOutlined,
	ArrowLeftOutlined,
	EditOutlined,
	DeleteOutlined,
	UploadOutlined,
} from "@ant-design/icons";
import {
	Progress,
	Row,
	Col,
	Form,
	Input,
	Select,
	Radio,
	Skeleton,
	Button,
	Tabs,
	Tooltip,
	message,
	Popconfirm,
	Upload,
} from "antd";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";
import { useLoaderContext } from "../../Components/Layout";
import SelectBuilding from "./SelectBuilding";
import ContractTable from "./ContractTable";
import { filter, remove } from "lodash";
const { Option } = Select;

interface buildingDetailsProps {
	details: any;
	occupancies: any;
	engineers: any;
	hazardClassification: any;
	typeOfConstruction: any;
	ahjOptions: any;
	params: any;
}

const BuildingDetails: FC<buildingDetailsProps> = ({
	details,
	occupancies,
	hazardClassification,
	typeOfConstruction,
	ahjOptions,
	params,
	engineers,
}) => {
	const [form] = Form.useForm();
	const [displayMap, setDisplayMap] = useState(false);
	const [isLoadingMap, setLoadingMap] = useState(false);
	const [editMode, setEditMode] = useState(false);
	const [isSavingChanges, setIsSavingChanges] = useState(false);
	const [deletedFiles, setDeletedFiles] = useState<any[]>([]);
	const [attachments, setAttachments] = useState<any>(
		details.attachments ? [...details.attachments] : []
	);
	const [coordinates, setCoordinates] = useState<any>(null);
	const [newFiles, setNewFiles] = useState<any[]>([]);

	const openEditMode = () => {
		setEditMode(true);
	};

	const closeEditMode = () => {
		setEditMode(false);
	};

	const uploadfiles = async () => {
		let promises: Promise<any>[] = [];
		let files: any[] = [];

		newFiles.map((file: any) => {
			promises.push(
				apiCall({
					method: "PUT",
					url: "/fileupload",
					data: {
						type: "buildings",
						type_name: params.id.toString(),
						file_name: file.name,
						content_type: file.type,
					},
					handleResponse: (res) => {
						console.log(res);
						let url = res.data.message.uploadURL;
						files.push({
							name: file.name,
							path: res.data.message.filepath,
						});
						axios
							.put(url, file.originFileObj, {
								headers: { "Content-Type": file.type },
							})
							.then((res) => {
								console.log(res);
							});
					},
				})
			);
		});

		try {
			await Promise.all(promises);
			return files;
		} catch {
			console.log("error uploading files");
			return [];
		}
	};

	const saveBuilding = async (data: any) => {
		setIsSavingChanges(true);
		if (deletedFiles.length) {
			try {
				await deleteAllfiles();
				data["attachments"] = attachments;
			} catch (err) {
				message.error("Cannot modify files");
			}
		}
		if (newFiles.length) {
			try {
				let files = await uploadfiles();
				data["attachments"] = [...attachments, ...files];
			} catch (err) {
				message.error("Cannot modify files");
			}
		}
		if (coordinates) data["coordinates"] = coordinates;
		apiCall({
			method: "PUT",
			data: { id: params.id, data },
			url: `/clientbuildings`,
			handleResponse: (res) => {
				console.log(res);
				setDeletedFiles([]);
				setNewFiles([]);
				setIsSavingChanges(false);
				closeEditMode();
				if (newFiles.length) setAttachments([...data["attachments"]]);
			},
		});
	};

	useEffect(() => {
		getMap(details.building_no, details.street_no, details.zone_no);
	}, []);

	const onFinish = (values: any) => {
		console.log(values);
		saveBuilding(values);
	};

	const onFinishFailed = (values: any) => {
		console.log(values);
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

	const downloadAttachment = (filepath: any) => {
		apiCall({
			method: "POST",
			url: "/fileupload",
			data: { filepath },
			handleResponse: (res) => {
				window.open(res.data.message, "_blank");
			},
		});
	};

	const removeFile = (filepath: any) => {
		let files = attachments;
		let removed_files = remove(files, { path: filepath });
		setDeletedFiles((files) => [...files, ...removed_files]);
		setAttachments(files);
	};

	const deleteAllfiles = async () => {
		let delete_requests: Promise<any>[] = [];
		deletedFiles.map((file) => {
			delete_requests.push(deleteAttachment(file.path));
		});
		await Promise.all(delete_requests);

		//Removing from Details Attachment
		remove(details.attachments, (file) => {
			return deletedFiles.indexOf(file) !== -1;
		});
	};

	const deleteAttachment = (filepath: any) => {
		return apiCall({
			method: "DELETE",
			url: "/fileupload",
			data: { data: { filepath } },
			handleResponse: (res) => {
				console.log(res.data.message);
			},
		});
	};

	const dummyRequest = ({ file, onSuccess }: any) => {
		setTimeout(() => {
			onSuccess("ok");
		}, 0);
	};

	return (
		<Form
			form={form}
			preserve={false}
			size="small"
			autoComplete="off"
			onFinish={onFinish}
			onFinishFailed={onFinishFailed}
			labelCol={{ span: 24, style: { paddingTop: 3 } }}
			wrapperCol={{ span: 24 }}
			initialValues={details}
			onValuesChange={(changedValues, allValues) => {
				if (
					changedValues.building_no ||
					changedValues.street_no ||
					changedValues.zone_no
				) {
					if (
						allValues.building_no &&
						allValues.zone_no &&
						allValues.street_no
					) {
						console.log(true);
						getMap(
							allValues.building_no,
							allValues.street_no,
							allValues.zone_no
						);
					}
				}
			}}
		>
			<Row>
				<Col span={12} style={{ paddingLeft: "10px" }}>
					<Form.Item
						label="Building Name"
						name="building_name"
						rules={[
							{
								required: true,
								message: "Please enter the building name",
							},
						]}
					>
						{Object.keys(details).length > 0 ? (
							<Input className="selected-building" disabled={!editMode} />
						) : (
							<Skeleton.Input active size="small" block />
						)}
					</Form.Item>
				</Col>
				<Col span={12} style={{ paddingLeft: "10px" }}>
					<Form.Item
						label="AHJ Building Completetion Certificate No."
						name="building_completion_certificate_number"
						rules={[
							{
								required: false,
								message: "Please enter AHJ Building Completion Certificate No.",
							},
						]}
					>
						{Object.keys(details).length > 0 ? (
							<Input className="selected-building" disabled={!editMode} />
						) : (
							<Skeleton.Input active size="small" block />
						)}
					</Form.Item>
				</Col>
			</Row>
			<Row>
				<Col span={12}>
					<Row>
						<Col span={6} style={{ paddingLeft: "10px" }}>
							<Form.Item
								label="Bldg No."
								name="building_no"
								rules={[
									{
										required: true,
										message: "",
									},
								]}
							>
								{Object.keys(details).length > 0 ? (
									<Input className="selected-building" disabled={!editMode} />
								) : (
									<Skeleton.Input active size="small" block />
								)}
							</Form.Item>
						</Col>

						<Col span={6} style={{ paddingLeft: "10px" }}>
							<Form.Item
								label="Street No."
								name="street_no"
								rules={[
									{
										required: true,
										message: "",
									},
								]}
							>
								{Object.keys(details).length > 0 ? (
									<Input className="selected-building" disabled={!editMode} />
								) : (
									<Skeleton.Input active size="small" block />
								)}
							</Form.Item>
						</Col>

						<Col span={6} style={{ paddingLeft: "10px" }}>
							<Form.Item
								label="Zone No."
								name="zone_no"
								rules={[
									{
										required: true,
										message: "",
									},
								]}
							>
								{Object.keys(details).length > 0 ? (
									<Input className="selected-building" disabled={!editMode} />
								) : (
									<Skeleton.Input active size="small" block />
								)}
							</Form.Item>
						</Col>

						<Col span={6} style={{ paddingLeft: "10px" }}>
							<Form.Item
								label="Unit No."
								name="unit_no"
								rules={[
									{
										required: false,
										message: "",
									},
								]}
							>
								{Object.keys(details).length > 0 ? (
									<Input className="selected-building" disabled={!editMode} />
								) : (
									<Skeleton.Input active size="small" block />
								)}
							</Form.Item>
						</Col>
					</Row>
					<Row>
						<Col span={12} style={{ paddingLeft: "10px" }}>
							<Form.Item
								label="Building Area"
								name="building_area"
								rules={[
									{
										required: true,
										message: "",
									},
								]}
							>
								{Object.keys(details).length > 0 ? (
									<Input className="selected-building" disabled={!editMode} />
								) : (
									<Skeleton.Input active size="small" block />
								)}
							</Form.Item>
						</Col>
						<Col span={12} style={{ paddingLeft: "10px" }}>
							<Form.Item
								label="Contact No."
								name="contact_number"
								rules={[
									{
										required: true,
										message: "",
									},
								]}
							>
								{Object.keys(details).length > 0 ? (
									<Input className="selected-building" disabled={!editMode} />
								) : (
									<Skeleton.Input active size="small" block />
								)}
							</Form.Item>
						</Col>
					</Row>
					<Row>
						<Col span={12} style={{ paddingLeft: "10px" }}>
							<Form.Item
								label="Occupancy Classification"
								name="occupancy_classification"
								rules={[
									{
										required: true,
										message: "",
									},
								]}
							>
								{Object.keys(details).length > 0 ? (
									<Select className="selected-building" disabled={!editMode}>
										{occupancies.map((item: any) => (
											<Option value={item.id}>{item.value}</Option>
										))}
									</Select>
								) : (
									<Skeleton.Input active size="small" block />
								)}
							</Form.Item>
						</Col>
						<Col span={12} style={{ paddingLeft: "10px" }}>
							<Form.Item
								label="Hazard Classification"
								name="hazard_classification"
								rules={[
									{
										required: true,
										message: "",
									},
								]}
							>
								{Object.keys(details).length > 0 ? (
									<Select className="selected-building" disabled={!editMode}>
										{hazardClassification.map((item: any) => (
											<Option value={item.id}>{item.value}</Option>
										))}
									</Select>
								) : (
									<Skeleton.Input active size="small" block />
								)}
							</Form.Item>
						</Col>
					</Row>
					<Row>
						<Col span={6} style={{ paddingLeft: "10px" }}>
							<Form.Item
								label="Building height"
								name="building_height"
								rules={[
									{
										required: false,
										message: "",
									},
								]}
							>
								{Object.keys(details).length > 0 ? (
									<Input className="selected-building" disabled={!editMode} />
								) : (
									<Skeleton.Input active size="small" block />
								)}
							</Form.Item>
						</Col>
						<Col span={6} style={{ paddingLeft: "2px" }}>
							<Form.Item
								label="."
								name="metrics"
								rules={[
									{
										required: false,
										message: "",
									},
								]}
							>
								{Object.keys(details).length > 0 ? (
									<Select
										defaultValue="feet"
										className="selected-building"
										disabled={!editMode}
									>
										<Option value="feet">feet</Option>
										<Option value="meters">meters</Option>
									</Select>
								) : (
									<Skeleton.Input active size="small" block />
								)}
							</Form.Item>
						</Col>
						<Col span={12} style={{ paddingLeft: "10px" }}>
							<Form.Item
								label="Type of Construction"
								name="type_of_construction"
								rules={[
									{
										required: true,
										message: "",
									},
								]}
							>
								{Object.keys(details).length > 0 ? (
									<Select className="selected-building" disabled={!editMode}>
										{typeOfConstruction.map((item: any) => (
											<Option value={item.id}>{item.value}</Option>
										))}
									</Select>
								) : (
									<Skeleton.Input active size="small" block />
								)}
							</Form.Item>
						</Col>
					</Row>
				</Col>
				<Col md={12} xs={24}>
					<div
						style={{
							width: "100%",
							height: "90%",
							paddingLeft: "10px",
						}}
					>
						{Object.keys(details).length > 0 ? (
							displayMap ? (
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
									{isLoadingMap && <LoadingOutlined />}
								</div>
							)
						) : (
							<Skeleton.Node active>
								<div style={{ width: "100%", height: "100%" }}></div>
							</Skeleton.Node>
						)}
					</div>
				</Col>
			</Row>
			<Row>
				{/* <Col span={6} style={{ paddingLeft: "10px" }}>
					<Form.Item
						label="Assigned Controller"
						name="building_controller"
						rules={[
							{
								required: true,
								message: "",
							},
						]}
					>
						{Object.keys(details).length > 0 ? (
							<Select className="selected-building" disabled={!editMode}>
								{engineers.map((item: any) => (
									<Option value={item.id}>{item.id}</Option>
								))}
							</Select>
						) : (
							<Skeleton.Input active size="small" block />
						)}
					</Form.Item>
				</Col> */}
				<Col span={18} style={{ paddingLeft: "10px" }}>
					<Form.Item
						label="Authority Having Jurisdiction"
						name="jurisdiction"
						rules={[
							{
								required: true,
								message: "Please select your jurisdiction",
							},
						]}
					>
						<Radio.Group
							className="selected-building"
							disabled={!editMode}
							style={{ width: "100%" }}
						>
							<Row>
								{ahjOptions.map((option: { label: string; value: number }) => (
									<Col key={option.value} md={6} xs={12}>
										<Radio value={option.value}>{option.label}</Radio>
									</Col>
								))}
							</Row>
						</Radio.Group>
					</Form.Item>
				</Col>
			</Row>
			<Row>
				<Col span={20}>
					<h4 style={{ paddingLeft: "12px", marginBottom: 0 }}>Attachments:</h4>
					{attachments.length ? (
						<ul>
							{attachments?.map((file: any) => {
								return (
									<li>
										<>
											<Button
												type="link"
												onClick={() => downloadAttachment(file.path)}
											>
												{file.name}
											</Button>
											{editMode && (
												<Popconfirm
													title="Are you sure to delete?"
													onConfirm={() => removeFile(file.path)}
													// onCancel={cancel}
													okText="Delete"
													cancelText="Cancel"
													placement="left"
												>
													<div className="delete-table-action">
														<DeleteOutlined />
													</div>
												</Popconfirm>
											)}
										</>
									</li>
								);
							})}
						</ul>
					) : (
						<p style={{ paddingLeft: "25px" }}>
							No attachments found for this building
						</p>
					)}
					{editMode && (
						<Upload
							fileList={newFiles}
							onChange={(e: any) => {
								setNewFiles(e.fileList);
							}}
							customRequest={dummyRequest}
						>
							<Button icon={<UploadOutlined />}>Upload New Files</Button>
						</Upload>
					)}
				</Col>
				<Col span={4}>
					<div className="edit-building-button">
						{editMode ? (
							<>
								<Button
									htmlType="submit"
									type="primary"
									style={{ marginRight: "4px" }}
									loading={isSavingChanges}
								>
									Save
								</Button>
								<Button
									onClick={() => {
										closeEditMode();
										form.resetFields();
										setAttachments([...details.attachments]);
										setDeletedFiles([]);
										setNewFiles([]);
									}}
								>
									Cancel
								</Button>
							</>
						) : (
							<Tooltip title="Edit" placement="left">
								<Button
									size="large"
									shape="circle"
									icon={<EditOutlined size={20} />}
									onClick={openEditMode}
								/>
							</Tooltip>
						)}
					</div>
				</Col>
			</Row>
		</Form>
	);
};

const Building = () => {
	const params = useParams();
	const { completeLoading } = useLoaderContext();
	const [pageLoader, setPageLoader] = useState(0);
	const [selectedBuilding, setSelectedBuilding] = useState<any>(null);
	const [occupancies, setOccupancies] = useState([]);
	const [hazardClassification, setHazardClassification] = useState([]);
	const [typeOfConstruction, setTypeOfConstruction] = useState([]);
	const [engineers, setEngineers] = useState<any[]>([]);
	const [ahjOptions, setAhjOptions] = useState([
		{ label: "QCD", value: 1 },
		{ label: "NFPA", value: 2 },
	]);

	const tabs: Array<{
		label: string;
		key: string;
		children: JSX.Element;
	}> = [
		{
			label: "Building Details",
			key: "1",
			children: (
				<BuildingDetails
					details={selectedBuilding}
					ahjOptions={ahjOptions}
					occupancies={occupancies}
					hazardClassification={hazardClassification}
					typeOfConstruction={typeOfConstruction}
					params={params}
					engineers={engineers}
				/>
			),
		},
		// {
		// 	label: "Contract Details",
		// 	key: "2",
		// 	children: <ContractTable building_id={params.id} />,
		// },
	];

	const getAllDropdowns = () => {
		apiCall({
			method: "GET",
			url: "/dropdown/dropdownAll",
			handleResponse: (res) => {
				setOccupancies(res.data.message.occupancyClassification || []);
				setHazardClassification(res.data.message.hazardClassification || []);
				setTypeOfConstruction(res.data.message.typeOfConstruction || []);
				setTypeOfConstruction(res.data.message.typeOfConstruction || []);
				setEngineers(res.data.message.teams || []);
				// setContractType(res.data.message.contractType || []);
				// setRequiredFields(
				// 	res.data.message.add_building_required_fields
				// 		.add_building_required_fields
				// );
				// props.setRequiredFields(
				// 	res.data.message.add_building_required_fields
				// 		.add_building_required_fields
				// );
			},
		});
	};

	const getBuildingById = (id: any) => {
		setPageLoader(25);
		apiCall({
			method: "GET",
			url: `/clientbuildings/${id}`,
			handleResponse: (res) => {
				console.log(res);
				setSelectedBuilding(res.data.message[0]);
				completeLoading();
			},
			handleError: (err) => {
				setSelectedBuilding(null);
			},
			percentage: (p) => {
				console.log((parseInt(p.loaded) / parseInt(p.total)) * 100);
				setPageLoader((parseInt(p.loaded) / parseInt(p.total)) * 100);
			},
		});
	};

	useEffect(() => {
		getBuildingById(params.id);
		getAllDropdowns();
	}, []);

	return (
		<>
			<div style={{ height: "8px" }} />
			<Row gutter={[16, 16]}>
				<Col span={1}>
					<Tooltip title="Go Back">
						<Link to="../buildings">
							<Button shape="circle" icon={<ArrowLeftOutlined />} />
						</Link>
					</Tooltip>
				</Col>
				<Col span={22}>
					<span style={{ fontSize: "22px" }}>
						{selectedBuilding?.building_name?.toUpperCase() || ""}
					</span>
				</Col>
			</Row>
			<div style={{ height: "4px" }} />
			<div style={{ backgroundColor: "white", padding: "20px" }}>
				{selectedBuilding && pageLoader === 100 ? (
					<Tabs
						size="small"
						destroyInactiveTabPane={true}
						type="card"
						items={tabs}
						onChange={(key) => {
							if (key === "1") {
								getBuildingById(params.id);
							}
						}}
					/>
				) : null}
			</div>
		</>
	);
};

export default Building;
