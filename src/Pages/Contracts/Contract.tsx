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
	DatePicker,
	Tag,
	Table,
} from "antd";
import type { DatePickerProps } from "antd";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";
import { useLoaderContext } from "../../Components/Layout";
import SelectBuilding from "./SelectBuilding";
import ContractTable from "./ContractTable";
import { filter, remove } from "lodash";
import dayjs from "dayjs";
const { Option } = Select;

const statusColors = {
	ACTIVE: "green",
	INACTIVE: "orange",
	INVALID: "grey",
	EXPIRED: "red",
};

interface buildingDetailsProps {
	details: any;
	systemData: any;
	occupancies: any;
	hazardClassification: any;
	typeOfConstruction: any;
	ahjOptions: any;
	params: any;
}

const ContractDetails: FC<buildingDetailsProps> = ({
	details,
	systemData,
	occupancies,
	hazardClassification,
	typeOfConstruction,
	ahjOptions,
	params,
}) => {
	const [form] = Form.useForm();
	const [fromDate, setFromDate] = useState<any>(
		new Date(details.from_date) || null
	);
	const [toDate, setToDate] = useState<any>(new Date(details.to_date) || null);
	const [status, setStatus] = useState<string>(details.status || "Invalid");
	const [displayMap, setDisplayMap] = useState(false);
	const [buildings, setBuildings] = useState([]);
	const [isLoadingMap, setLoadingMap] = useState(false);
	const [editMode, setEditMode] = useState(false);
	const [isSavingChanges, setIsSavingChanges] = useState(false);
	const [deletedFiles, setDeletedFiles] = useState<any[]>([]);
	const [contractType, setContractType] = useState<any>([]);
	const [attachments, setAttachments] = useState<any>(
		details.contract_attachment ? [...details.contract_attachment] : []
	);
	const [coordinates, setCoordinates] = useState({
		lat: 25.3548,
		long: 51.1839,
	});
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
						type: "contracts",
						type_name: params.id,
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
		console.log(data);
		setIsSavingChanges(true);
		if (deletedFiles.length) {
			try {
				await deleteAllfiles();
				data["contract_attachment"] = attachments;
			} catch (err) {
				message.error("Cannot modify files");
			}
		}
		if (newFiles.length) {
			try {
				let files = await uploadfiles();
				data["contract_attachment"] = [...attachments, ...files];
			} catch (err) {
				message.error("Cannot modify files");
			}
		}
		data["status"] = status;
		apiCall({
			method: "PUT",
			data: { id: params.id, data },
			url: `/clientcontracts`,
			handleResponse: (res) => {
				console.log(res);
				setDeletedFiles([]);
				setNewFiles([]);
				setIsSavingChanges(false);
				closeEditMode();
				if (newFiles.length) setAttachments([...data["contract_attachment"]]);
			},
		});
	};

	const getAllBuildings = () => {
		apiCall({
			method: "GET",
			url: "/dropdown/buildings",
			handleResponse: (res) => {
				setBuildings(res.data.message || []);
			},
		});
	};

	useEffect(() => {
		getAllDropdowns();
		getAllBuildings();
	}, []);

	useEffect(() => {
		if (editMode) getStatus();
	}, [fromDate, toDate]);

	const getStatus = () => {
		let curr_date = new Date();
		if (fromDate && toDate && toDate > fromDate) {
			if (curr_date > fromDate && curr_date < toDate) setStatus("ACTIVE");
			if (curr_date > toDate) setStatus("EXPIRED");
			if (curr_date < fromDate) setStatus("INACTIVE");
		} else setStatus("INVALID");
	};

	const onFinish = (values: any) => {
		console.log(values);
		saveBuilding(values);
	};

	const onFinishFailed = (values: any) => {
		console.log(values);
	};

	const getAllDropdowns = () => {
		apiCall({
			method: "GET",
			url: "/dropdown/dropdownAll",
			handleResponse: (res) => {
				setContractType(res.data.message.contractType || []);
				// props.setRequiredFields(
				// 	res.data.message.add_building_required_fields
				// 		.add_building_required_fields
				// );
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

	const handleChangeBuildings = (value: string[]) => {
		console.log(`selected ${value}`);
	};

	const onChangeFrom: DatePickerProps["onChange"] = (
		date: any,
		dateString: any
	) => {
		console.log(date, dateString);
		setFromDate(date);
	};

	const onChangeTo: DatePickerProps["onChange"] = (
		date: any,
		dateString: any
	) => {
		console.log(date, dateString);
		setToDate(date);
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
		remove(details.contract_attachment, (file) => {
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
			initialValues={{
				...details,
				to_date: dayjs(details.to_date),
				from_date: dayjs(details.from_date),
			}}
			// onValuesChange={(changedValues, allValues) => {
			// 	if (
			// 		changedValues.building_no ||
			// 		changedValues.street_no ||
			// 		changedValues.zone_no
			// 	) {
			// 		if (
			// 			allValues.building_no &&
			// 			allValues.zone_no &&
			// 			allValues.street_no
			// 		) {
			// 			console.log(true);
			// 			getMap(
			// 				allValues.building_no,
			// 				allValues.street_no,
			// 				allValues.zone_no
			// 			);
			// 		}
			// 	}
			// }}
		>
			<Row>
				<Col md={8} xs={24} style={{ paddingRight: "10px" }}>
					<Form.Item
						label="Contract Number"
						name="id"
						rules={[
							{
								required: true,
								message: "Please enter the Contract No.",
							},
						]}
					>
						<Input className="selected-building" disabled={!editMode} />
					</Form.Item>
				</Col>
				<Col md={8} xs={24} style={{ paddingRight: "10px" }}>
					<Form.Item
						label="Contract Type"
						name="type"
						rules={[
							{
								required: true,
								message: "Please select Contract type",
							},
						]}
					>
						<Select className="selected-building" disabled={!editMode}>
							{contractType.map((item: any) => (
								<Option value={item.id}>{item.value}</Option>
							))}
						</Select>
					</Form.Item>
				</Col>
				<Col md={8} xs={24} style={{ paddingRight: "10px" }}>
					<Form.Item
						label="Total Contract Value"
						name="total_contract_value"
						rules={[
							{
								required: true,
								message: "Please enter the Total Contract Value",
							},
						]}
					>
						<Input className="selected-building" disabled={!editMode} />
					</Form.Item>
				</Col>
				{/* <Col md={6} xs={24}>
					<Form.Item
						label="FM Company"
						name="fm_company"
						rules={[
							{
								required: true,
								message: "Please enter the FM Company",
							},
						]}
					>
						<Input />
					</Form.Item>
				</Col> */}
				<Col md={12} xs={24} style={{ paddingRight: "10px" }}>
					<Form.Item
						label="Title"
						name="title"
						rules={[
							{
								required: true,
								message: "Please enter the Contract title",
							},
						]}
					>
						<Input className="selected-building" disabled={!editMode} />
					</Form.Item>
				</Col>
				<Col md={4} xs={24} style={{ paddingRight: "10px" }}>
					<Form.Item
						label="From"
						name="from_date"
						rules={[
							{
								required: true,
								message: "Please enter the From Date",
							},
						]}
					>
						<DatePicker
							className="selected-building"
							disabled={!editMode}
							format={"DD/MM/YYYY"}
							style={{ width: "100%" }}
							onChange={onChangeFrom}
						/>
					</Form.Item>
				</Col>
				<Col md={4} xs={24} style={{ paddingRight: "10px" }}>
					<Form.Item
						label="To"
						name="to_date"
						rules={[
							{
								required: true,
								message: "Please enter the To Date",
							},
						]}
					>
						<DatePicker
							className="selected-building"
							disabled={!editMode}
							style={{ width: "100%" }}
							format={"DD/MM/YYYY"}
							onChange={onChangeTo}
						/>
					</Form.Item>
				</Col>
				<Col md={4} xs={24} style={{ paddingTop: "17px", paddingLeft: "5px" }}>
					<p>
						{" "}
						Status :{" "}
						{/* <span
							style={{
								color: statusColors[status as keyof typeof statusColors],
							}}
						>
							{status}
						</span> */}
						<Tag color={statusColors[status as keyof typeof statusColors]}>
							{status}
						</Tag>
					</p>
				</Col>
			</Row>
			{/* <Row>
				<Col md={24} xs={24} style={{ paddingRight: "10px" }}>
					<Form.Item
						label="Select Buildings"
						name="building_ids"
						rules={[
							{
								required: true,
								message: "Please select the buildings",
							},
						]}
					>
						<Select
							className="selected-building"
							disabled={!editMode}
							mode="multiple"
							allowClear
							style={{ width: "100%" }}
							placeholder="Please select"
							onChange={handleChangeBuildings}
							options={buildings?.map((building: any) => ({
								label: building.building_name,
								value: building.id,
							}))}
						/>
					</Form.Item>
				</Col>
			</Row> */}

			{/* sdfswfdsdcfsdcscfds */}

			{/* <Col span={12} style={{ paddingLeft: "10px" }}>
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
			</Row> */}
			{
				<Row>
					<h4 style={{ paddingLeft: "3px", marginBottom: "2px" }}>
						System Details:
					</h4>
					<Col span={24}>
						<Table
							dataSource={systemData}
							pagination={false}
							columns={[
								{
									title: "System",
									dataIndex: "system_name",
								},
								{
									title: "Building",
									dataIndex: "building_name",
								},
							]}
						/>
					</Col>
				</Row>
			}
			<Row>
				<Col span={20}>
					<h4 style={{ paddingLeft: "3px", marginBottom: 0 }}>Attachments:</h4>
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
							No attachments found for this contract
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
										setAttachments([
											...(details.contract_attachment?.length
												? details.contract_attachment
												: []),
										]);
										setDeletedFiles([]);
										setNewFiles([]);
										setStatus(details.status);
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

const Contract = () => {
	const params = useParams();
	const { completeLoading } = useLoaderContext();
	const [pageLoader, setPageLoader] = useState(0);
	const [selectedContract, setSelectedContract] = useState<any>(null);
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
			label: "Contract Details",
			key: "1",
			children: (
				<ContractDetails
					details={selectedContract?.cdata || null}
					systemData={selectedContract?.sdata || []}
					ahjOptions={ahjOptions}
					occupancies={occupancies}
					hazardClassification={hazardClassification}
					typeOfConstruction={typeOfConstruction}
					params={params}
				/>
			),
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

	const getContractsById = (id: any) => {
		setPageLoader(25);
		apiCall({
			method: "GET",
			url: `/clientcontracts/${id}`,
			handleResponse: (res) => {
				console.log(res);
				setSelectedContract(res.data.message);
				completeLoading();
			},
			handleError: (err) => {
				setSelectedContract(null);
			},
			percentage: (p) => {
				console.log((parseInt(p.loaded) / parseInt(p.total)) * 100);
				setPageLoader((parseInt(p.loaded) / parseInt(p.total)) * 100);
			},
		});
	};

	useEffect(() => {
		getContractsById(params.id);
		getAllDropdowns();
	}, []);

	return (
		<>
			<div style={{ height: "8px" }} />
			<Row gutter={[16, 16]}>
				<Col span={1}>
					<Tooltip title="Go Back">
						<Link to="../contracts">
							<Button shape="circle" icon={<ArrowLeftOutlined />} />
						</Link>
					</Tooltip>
				</Col>
				<Col span={22}>
					<span style={{ fontSize: "22px" }}>
						{selectedContract?.cdata.id?.toUpperCase() || ""}
					</span>
				</Col>
			</Row>
			<div style={{ height: "4px" }} />
			<div style={{ backgroundColor: "white", padding: "20px" }}>
				{selectedContract && pageLoader === 100 ? (
					<Tabs
						size="small"
						destroyInactiveTabPane={true}
						type="card"
						items={tabs}
						onChange={(key) => {
							if (key === "1") {
								getContractsById(params.id);
							}
						}}
					/>
				) : null}
			</div>
		</>
	);
};

export default Contract;
