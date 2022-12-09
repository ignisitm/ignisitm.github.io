import { FC, useState } from "react";
import {
	Form,
	Switch,
	Input,
	Row,
	Col,
	Radio,
	Select,
	Button,
	FormInstance,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import axios from "axios";
import { apiCall } from "../../axiosConfig";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
const { Option } = Select;

interface props {
	nextFunc: Function;
	occupancies: any;
	hazardClassification: any;
	typeOfConstruction: any;
	requiredFields: any;
	setBuildingDetails: Function;
	buildingNames: Array<any>;
	engineers: any;
	// form: FormInstance;
}

const SelectBuilding: FC<props> = ({
	nextFunc,
	occupancies,
	hazardClassification,
	typeOfConstruction,
	requiredFields,
	setBuildingDetails,
	buildingNames,
	engineers,
	// form,
}) => {
	const [form] = Form.useForm();
	const [newBuilding, setNewBuilding] = useState(false);
	const [displayMap, setDisplayMap] = useState(false);
	const [selectedBuildingId, setSelectedBuildingId] = useState(-1);
	const [fetchingBuildingDetails, setFetchingBuildingDetails] = useState(false);
	const [isLoadingMap, setLoadingMap] = useState(false);
	const [ahjOptions, setAhjOptions] = useState([
		{ label: "QCD", value: 1 },
		{ label: "NFPA", value: 2 },
	]);
	const [coordinates, setCoordinates] = useState({
		lat: 25.3548,
		long: 51.1839,
	});

	const onFinish = (values: any) => {
		console.log("Success:", values);
		if (newBuilding) setBuildingDetails(values);
		else if (selectedBuildingId !== -1) {
			setBuildingDetails({ id: selectedBuildingId });
		}
		nextFunc();
	};

	const onFinishFailed = (errorInfo: any) => {
		console.log(errorInfo);
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

	const getBuildingById = (id: number) => {
		setFetchingBuildingDetails(true);
		apiCall({
			method: "GET",
			url: `/buildings?id=${id}`,
			handleResponse: (res) => {
				console.log(res);
				let values = res.data.message;
				form.setFieldsValue(values);
				getMap(values.building_no, values.street_no, values.zone_no);
				setFetchingBuildingDetails(false);
				setSelectedBuildingId(id);
			},
			handleError: (err) => {
				console.log(err.stack);
				setFetchingBuildingDetails(false);
				form.resetFields();
				form.setFieldsValue({ building_name: id });
				setSelectedBuildingId(-1);
			},
		});
	};

	return (
		<div>
			<div style={{ margin: "10px 0 30px 10px" }}>
				<Switch
					checked={newBuilding}
					onClick={() => {
						setNewBuilding((value) => !value);
						form.resetFields();
					}}
				/>
				<span> Add a new building</span>
			</div>

			<Form
				form={form}
				preserve={false}
				size="small"
				autoComplete="off"
				onFinish={onFinish}
				onFinishFailed={onFinishFailed}
				labelCol={{ span: 24, style: { paddingTop: 3 } }}
				wrapperCol={{ span: 24 }}
				initialValues={{ metrics: "feet", jurisdiction: "1" }}
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
					} else if (changedValues.building_name && !newBuilding) {
						getBuildingById(changedValues.building_name);
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
							{newBuilding ? (
								<Input />
							) : (
								<Select
									loading={fetchingBuildingDetails}
									className="selected-new-building"
									showSearch
									placeholder="Search to Select"
									optionFilterProp="children"
									filterOption={(input, option) =>
										(option!.children as unknown as string)
											.toLowerCase()
											.includes(input)
									}
									filterSort={(optionA, optionB) =>
										(optionA!.children as unknown as string)
											.toLowerCase()
											.localeCompare(
												(optionB!.children as unknown as string).toLowerCase()
											)
									}
								>
									{buildingNames.map((bldg: any) => (
										<Option value={bldg.id}>{bldg.building_name}</Option>
									))}
								</Select>
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
							<Input className="selected-building" disabled={!newBuilding} />
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
									<Input
										className="selected-building"
										disabled={!newBuilding}
									/>
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
									<Input
										className="selected-building"
										disabled={!newBuilding}
									/>
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
									<Input
										className="selected-building"
										disabled={!newBuilding}
									/>
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
									<Input
										className="selected-building"
										disabled={!newBuilding}
									/>
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
									<Input
										className="selected-building"
										disabled={!newBuilding}
									/>
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
									<Input
										className="selected-building"
										disabled={!newBuilding}
									/>
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
									<Select className="selected-building" disabled={!newBuilding}>
										{occupancies.map((item: any) => (
											<Option value={item.id}>{item.value}</Option>
										))}
									</Select>
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
									<Select className="selected-building" disabled={!newBuilding}>
										{hazardClassification.map((item: any) => (
											<Option value={item.id}>{item.value}</Option>
										))}
									</Select>
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
									<Input
										className="selected-building"
										disabled={!newBuilding}
									/>
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
									<Select
										defaultValue="feet"
										className="selected-building"
										disabled={!newBuilding}
									>
										<Option value="feet">feet</Option>
										<Option value="meters">meters</Option>
									</Select>
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
									<Select className="selected-building" disabled={!newBuilding}>
										{typeOfConstruction.map((item: any) => (
											<Option value={item.id}>{item.value}</Option>
										))}
									</Select>
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
				</Row>
				<Row>
					<Col span={6} style={{ paddingLeft: "10px" }}>
						<Form.Item
							label="Building Controller"
							name="building_controller"
							rules={[
								{
									required: false,
									message: "",
								},
							]}
						>
							<Select className="selected-building" disabled={!newBuilding}>
								{engineers.map((engineer: { id: number; name: string }) => (
									<Option value={engineer.id}>{engineer.name}</Option>
								))}
							</Select>
						</Form.Item>
					</Col>
					<Col span={18} style={{ paddingLeft: "30px" }}>
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
								disabled={!newBuilding}
								style={{ width: "100%" }}
							>
								<Row>
									{ahjOptions.map(
										(option: { label: string; value: number }) => (
											<Col key={option.value} md={6} xs={12}>
												<Radio value={option.value}>{option.label}</Radio>
											</Col>
										)
									)}
								</Row>
							</Radio.Group>
						</Form.Item>
					</Col>
				</Row>
				<Row>
					<Col md={6} xs={0} style={{ paddingLeft: "10px" }} />
					<Col md={12} xs={12} style={{ paddingLeft: "10px" }}>
						<Button size="middle" block type="primary" htmlType="submit">
							Next
						</Button>
					</Col>
					<Col md={6} xs={0} style={{ paddingLeft: "10px" }} />
				</Row>
			</Form>
			<br />
		</div>
	);
};

export default SelectBuilding;
