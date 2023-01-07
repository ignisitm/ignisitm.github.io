import { useState, useEffect, FC } from "react";
import { useParams, Link } from "react-router-dom";
import { apiCall } from "../../axiosConfig";
import {
	LoadingOutlined,
	ArrowLeftOutlined,
	EditOutlined,
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
} from "antd";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";
import { useLoaderContext } from "../../Components/Layout";
import SelectBuilding from "./SelectBuilding";
import ContractTable from "./ContractTable";
const { Option } = Select;

interface buildingDetailsProps {
	details: any;
	occupancies: any;
	hazardClassification: any;
	typeOfConstruction: any;
	ahjOptions: any;
}

const BuildingDetails: FC<buildingDetailsProps> = ({
	details,
	occupancies,
	hazardClassification,
	typeOfConstruction,
	ahjOptions,
}) => {
	const [form] = Form.useForm();
	const [displayMap, setDisplayMap] = useState(false);
	const [isLoadingMap, setLoadingMap] = useState(false);
	const [editMode, setEditMode] = useState(false);
	const [coordinates, setCoordinates] = useState({
		lat: 25.3548,
		long: 51.1839,
	});

	const openEditMode = () => {
		setEditMode(true);
	};

	const closeEditMode = () => {
		setEditMode(false);
	};

	useEffect(() => {
		getMap(details.building_no, details.street_no, details.zone_no);
	}, []);

	const onFinish = (values: any) => {
		console.log(values);
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
				<Col span={20}>
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
				<Col span={4}>
					<div className="edit-building-button">
						{editMode ? (
							<>
								<Button type="primary" style={{ marginRight: "4px" }}>
									Save
								</Button>
								<Button onClick={closeEditMode}>Cancel</Button>
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
				/>
			),
		},
		{
			label: "Contract Details",
			key: "2",
			children: <ContractTable building_id={params.id} />,
		},
	];

	const getAllDropdowns = () => {
		apiCall({
			method: "GET",
			url: "/dropdown/dropdownAll",
			handleResponse: (res) => {
				setOccupancies(res.data.message.occupancyClassification || []);
				setHazardClassification(res.data.message.hazardClassification || []);
				setTypeOfConstruction(res.data.message.typeOfConstruction || []);
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
			url: `/buildings?id=${id}`,
			handleResponse: (res) => {
				console.log(res);
				setSelectedBuilding(res.data.message);
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
					/>
				) : null}
			</div>
		</>
	);
};

export default Building;
