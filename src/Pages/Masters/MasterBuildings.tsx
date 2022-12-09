import {
	Form,
	Button,
	Row,
	Col,
	Table,
	Modal,
	Select,
	Input,
	Divider,
	List,
	Skeleton,
	message,
	Checkbox,
} from "antd";
import { useEffect, useState } from "react";
import { apiCall } from "../../axiosConfig";
import { LoadingOutlined } from "@ant-design/icons";

export default function MasterBuildings() {
	const [requiredFields, setRequiredFields] = useState<{
		[id: string | number]: boolean;
	}>({
		building_name: false,
		region: false,
		time_zone: false,
		jurisdiction: false,
		building_no: false,
		street_no: false,
		zone_no: false,
		// unit_no: true,
		building_area: false,
		occupancy_classification: false,
		hazard_classification: false,
		building_completion_certificate_number: false,
		contact_number: false,
		building_height: false,
		type_of_construction: false,
		owner: false,
		contract_number: false,
		contract_type: false,
	});
	const [occupancies, setOccupancies] = useState([]);
	const [occupancyLoading, setOccupancyLoading] = useState(false);
	const [loadingButtons, setLoadingButtons] = useState({
		occupancy: false,
		hazard: false,
		construction: false,
		contract: false,
		required: false,
	});

	const [requiredFieldsLoading, setRequireFieldsLoading] = useState(false);

	const [hazardLoading, setHazardLoading] = useState(false);
	const [newOccupancyClassification, setNewOccupancyClassification] =
		useState("");
	const [hazardClassification, setHazardClassification] = useState([]);
	const [newHazardClassification, setNewHazardClassification] = useState("");

	const [typeOfConstruction, setTypeOfConstruction] = useState([]);
	const [contractType, setContractType] = useState([]);

	const [constructionLoading, setConstructionLoading] = useState(false);
	const [contractLoading, setContractLoading] = useState(false);

	const [newTypeOfConstruction, setNewTypeOfConstruction] = useState("");
	const [newContractType, setNewContractType] = useState("");

	const addNewOccupancy = () => {
		if (newOccupancyClassification === "") message.error("Enter a valid input");
		else {
			setLoadingButtons((value) => {
				return { ...value, occupancy: true };
			});
			let new_value = newOccupancyClassification;
			apiCall({
				method: "POST",
				url: "/dropdown/occupancyClassification",
				data: { new_value },
				handleResponse: (res) => {
					if (res.status === 200) {
						getOccupanciesClassification();
						setNewOccupancyClassification("");
						message.success(
							"Added New value for dropdown 'Occupancy Classification'"
						);
					} else {
						message.error("Error!");
					}
					setLoadingButtons((value) => {
						return { ...value, occupancy: false };
					});
				},
			});
		}
	};

	const addNewHazard = () => {
		if (newHazardClassification === "") message.error("Enter a valid input");
		else {
			setLoadingButtons((value) => {
				return { ...value, hazard: true };
			});
			let new_value = newHazardClassification;

			apiCall({
				method: "POST",
				url: "/dropdown/hazardClassification",
				data: { new_value },
				handleResponse: (res) => {
					if (res.status === 200) {
						getHazardClassification();
						setNewHazardClassification("");
						message.success(
							"Added New value for dropdown 'Hazard Classification'"
						);
					} else {
						message.error("Error!");
					}
					setLoadingButtons((value) => {
						return { ...value, hazard: false };
					});
				},
			});
		}
	};

	const addNewTypeOfConstruction = () => {
		if (newTypeOfConstruction === "") message.error("Enter a valid input");
		else {
			setLoadingButtons((value) => {
				return { ...value, construction: true };
			});
			let new_value = newTypeOfConstruction;

			apiCall({
				method: "POST",
				url: "/dropdown/typeOfConstruction",
				data: { new_value },
				handleResponse: (res) => {
					if (res.status === 200) {
						getTypeOfConstruction();
						setNewTypeOfConstruction("");
						message.success(
							"Added New value for dropdown 'Type of Construction'"
						);
					} else {
						message.error("Error!");
					}
					setLoadingButtons((value) => {
						return { ...value, construction: false };
					});
				},
			});
		}
	};

	const addNewContractType = () => {
		if (newContractType === "") message.error("Enter a valid input");
		else {
			setLoadingButtons((value) => {
				return { ...value, contract: true };
			});
			let new_value = newContractType;

			apiCall({
				method: "POST",
				url: "/dropdown/contractType",
				data: { new_value },
				handleResponse: (res) => {
					if (res.status === 200) {
						getContractType();
						setNewContractType("");
						message.success("Added New value for dropdown 'Contract type'");
					} else {
						message.error("Error!");
					}
					setLoadingButtons((value) => {
						return { ...value, contract: false };
					});
				},
			});
		}
	};

	const getOccupanciesClassification = () => {
		setOccupancyLoading(true);

		apiCall({
			method: "GET",
			url: "/dropdown/occupancyClassification",
			handleResponse: (res) => {
				if (res.status === 200) {
					setOccupancyLoading(false);
					setOccupancies(res.data.message);
				}
			},
		});
	};

	const getHazardClassification = () => {
		setHazardLoading(true);

		apiCall({
			method: "GET",
			url: "/dropdown/hazardClassification",
			handleResponse: (res) => {
				if (res.status === 200) {
					setHazardClassification(res.data.message);
					setHazardLoading(false);
				}
			},
		});
	};

	const getTypeOfConstruction = () => {
		setConstructionLoading(true);

		apiCall({
			method: "GET",
			url: "/dropdown/typeOfConstruction",
			handleResponse: (res) => {
				if (res.status === 200) {
					setTypeOfConstruction(res.data.message);
					setConstructionLoading(false);
				}
			},
		});
	};

	const getContractType = () => {
		setContractLoading(true);

		apiCall({
			method: "GET",
			url: "/dropdown/contractType",
			handleResponse: (res) => {
				if (res.status === 200) {
					setContractType(res.data.message);
					setContractLoading(false);
				}
			},
		});
	};

	const getAllDropdowns = () => {
		setOccupancyLoading(true);
		setHazardLoading(true);
		setConstructionLoading(true);
		setContractLoading(true);
		setRequireFieldsLoading(true);

		apiCall({
			method: "GET",
			url: "/dropdown/dropdownAll",
			handleResponse: (res) => {
				if (res.status === 200) {
					console.log(res.data.message);
					setOccupancies(res.data.message.occupancyClassification);
					setHazardClassification(res.data.message.hazardClassification);
					setTypeOfConstruction(res.data.message.typeOfConstruction);
					setContractType(res.data.message.contractType);
					if (
						res.data.message.add_building_required_fields
							.add_building_required_fields
					)
						setRequiredFields(
							res.data.message.add_building_required_fields
								.add_building_required_fields
						);
					setOccupancyLoading(false);
					setHazardLoading(false);
					setConstructionLoading(false);
					setContractLoading(false);
					setRequireFieldsLoading(false);
				}
			},
		});
	};

	useEffect(() => {
		getAllDropdowns();
	}, []);

	const requiredFieldLabels = [
		{
			id: 1,
			label: "Building Name",
			name: "building_name",
		},
		{
			id: 2,
			label: "Region",
			name: "region",
		},
		{
			id: 3,
			label: "Time Zone",
			name: "time_zone",
		},
		{
			id: 4,
			label: "Jurisdiction",
			name: "jurisdiction",
		},
		{
			id: 5,
			label: "Building Number",
			name: "building_no",
		},
		{
			id: 6,
			label: "Street Number",
			name: "street_no",
		},
		{
			id: 7,
			label: "Zone Number",
			name: "zone_no",
		},
		{
			id: 8,
			label: "Building Area",
			name: "building_area",
		},
		{
			id: 9,
			label: "Occupancy Classification",
			name: "occupancy_classification",
		},
		{
			id: 10,
			label: "Hazard Classification",
			name: "hazard_classification",
		},
		{
			id: 11,
			label: "Building Completion Certificate No.",
			name: "building_completion_certificate_number",
		},
		{
			id: 12,
			label: "Contact Number",
			name: "contact_number",
		},
		{
			id: 13,
			label: "Building height",
			name: "building_height",
		},
		{
			id: 14,
			label: "Type of Construction",
			name: "type_of_construction",
		},
		{
			id: 15,
			label: "Owner",
			name: "owner",
		},
		{
			id: 16,
			label: "Contract Number",
			name: "contract_number",
		},
		{
			id: 17,
			label: "Contract Type",
			name: "contract_type",
		},
	];

	const saveRequiredFields = () => {
		setLoadingButtons((value) => {
			return { ...value, required: true };
		});
		console.log(requiredFields);

		apiCall({
			method: "POST",
			url: "/dropdown/saveBuildingFields",
			data: { fields: requiredFields },
			handleResponse: (res) => {
				message.success("Successfully Updated");
				setLoadingButtons((value) => {
					return { ...value, required: false };
				});
			},
		});
	};

	return (
		<div style={{ padding: " 0 20px" }}>
			<Divider orientation="left" orientationMargin={25}>
				Select Required Fields for Adding New Building Module &nbsp;{" "}
				{requiredFieldsLoading && <LoadingOutlined />}
			</Divider>
			{/* <Checkbox.Group
				// disabled={props.selectedBuilding}
				style={{ width: "100%" }}
			> */}
			<Row>
				{requiredFieldLabels.map((option) => (
					<Col key={option.id} md={12} xs={24}>
						<Checkbox
							value={option.name}
							onChange={(e) =>
								setRequiredFields({
									...requiredFields,
									[option.name]: !requiredFields[option.name],
								})
							}
							checked={requiredFields[option.name]}
						>
							{option.label}
						</Checkbox>
					</Col>
				))}
			</Row>
			<br />
			<Button
				type="primary"
				onClick={saveRequiredFields}
				disabled={loadingButtons.required}
			>
				{loadingButtons.required ? <LoadingOutlined /> : "Save"}
			</Button>
			{/* </Checkbox.Group> */}

			<Divider orientation="left" orientationMargin={25}>
				Edit Dropdowns for Adding New Building Module
			</Divider>
			<Row>
				<Col span={12} style={{ padding: "10px" }}>
					<h4>
						Occupancy Classification &nbsp;{" "}
						{occupancyLoading && <LoadingOutlined />}
					</h4>
					<select
						name="Region"
						size={5}
						style={{ width: "100%", borderColor: "lightgrey" }}
					>
						{occupancies.map((occupancy: any) => (
							<option value={occupancy.id}>{occupancy.value}</option>
						))}
					</select>
					<Input.Group>
						<Row>
							<Col span={18} style={{ paddingRight: "3px" }}>
								<Input
									style={{ width: "100%" }}
									placeholder="Enter new value"
									onChange={(e) =>
										setNewOccupancyClassification(e.target.value)
									}
									value={newOccupancyClassification}
									required
								/>
							</Col>
							<Col span={6}>
								<Button
									disabled={loadingButtons.occupancy}
									block
									type="primary"
									onClick={addNewOccupancy}
								>
									{loadingButtons.occupancy ? <LoadingOutlined /> : "Add"}
								</Button>
							</Col>
						</Row>
					</Input.Group>
				</Col>

				<Col span={12} style={{ padding: "10px" }}>
					<h4>
						Hazard Classification &nbsp; {hazardLoading && <LoadingOutlined />}
					</h4>
					<select
						name="Region"
						size={5}
						style={{ width: "100%", borderColor: "lightgrey" }}
					>
						{hazardClassification.map((hazard: any) => (
							<option value={hazard.id} disabled>
								{hazard.value}
							</option>
						))}
					</select>
					<Input.Group>
						<Row>
							<Col span={18} style={{ paddingRight: "3px" }}>
								<Input
									style={{ width: "100%" }}
									onChange={(e) => setNewHazardClassification(e.target.value)}
									placeholder="Enter new value"
									value={newHazardClassification}
									required
								/>
							</Col>
							<Col span={6}>
								<Button
									block
									disabled={loadingButtons.hazard}
									type="primary"
									onClick={addNewHazard}
								>
									{loadingButtons.hazard ? <LoadingOutlined /> : "Add"}
								</Button>
							</Col>
						</Row>
					</Input.Group>
				</Col>
			</Row>
			<Row>
				<Col span={12} style={{ padding: "10px" }}>
					<h4>
						Type of Construction &nbsp;{" "}
						{constructionLoading && <LoadingOutlined />}
					</h4>
					<select
						name="Region"
						size={5}
						style={{ width: "100%", borderColor: "lightgrey" }}
					>
						{typeOfConstruction.map((toc: any) => (
							<option value={toc.id} disabled>
								{toc.value}
							</option>
						))}
					</select>
					<Input.Group>
						<Row>
							<Col span={18} style={{ paddingRight: "3px" }}>
								<Input
									style={{ width: "100%" }}
									onChange={(e) => setNewTypeOfConstruction(e.target.value)}
									placeholder="Enter new value"
									value={newTypeOfConstruction}
									required
								/>
							</Col>
							<Col span={6}>
								<Button
									block
									disabled={loadingButtons.construction}
									type="primary"
									onClick={addNewTypeOfConstruction}
								>
									{loadingButtons.construction ? <LoadingOutlined /> : "Add"}
								</Button>
							</Col>
						</Row>
					</Input.Group>
				</Col>

				<Col span={12} style={{ padding: "10px" }}>
					<h4>Contract Type &nbsp; {contractLoading && <LoadingOutlined />}</h4>
					<select
						name="Region"
						size={5}
						style={{ width: "100%", borderColor: "lightgrey" }}
					>
						{contractType.map((type: any) => (
							<option value={type.id} disabled>
								{type.value}
							</option>
						))}
					</select>
					<Input.Group>
						<Row>
							<Col span={18} style={{ paddingRight: "3px" }}>
								<Input
									style={{ width: "100%" }}
									onChange={(e) => setNewContractType(e.target.value)}
									placeholder="Enter new value"
									value={newContractType}
									required
								/>
							</Col>
							<Col span={6}>
								<Button
									block
									disabled={loadingButtons.contract}
									type="primary"
									onClick={addNewContractType}
								>
									{loadingButtons.contract ? <LoadingOutlined /> : "Add"}
								</Button>
							</Col>
						</Row>
					</Input.Group>
				</Col>
			</Row>
			<Divider orientation="left" orientationMargin={25}>
				Manage Building Controllers &nbsp;{" "}
				{/* {requiredFieldsLoading && <LoadingOutlined />} */}
			</Divider>
		</div>
	);
}
