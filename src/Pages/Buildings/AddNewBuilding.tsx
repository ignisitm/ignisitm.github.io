import {
	Button,
	Form,
	Input,
	message,
	Modal,
	Select,
	Steps,
	Result,
	Descriptions,
	Row,
	Col,
} from "antd";
import {
	PlusOutlined,
	BankOutlined,
	FileDoneOutlined,
	SolutionOutlined,
	PaperClipOutlined,
	LoadingOutlined,
	CheckOutlined,
} from "@ant-design/icons";
import { FC, useState, useContext, useEffect } from "react";
import { SuperUserContext } from "../../Helpers/Context";
import { apiCall } from "../../axiosConfig";
import axios, { AxiosError, AxiosResponse } from "axios";
import SelectBuilding from "./SelectBuilding";
import AddContract from "./AddContract";
import AddAttachments from "./AddAttachments";
const { Step } = Steps;

type steps =
	| "buildingStep"
	| "contractStep"
	| "attachmentsStep"
	| "completedStep";

interface props {
	fetchData: Function;
}

interface CollectionCreateFormProps {
	visible: boolean;
	confirmLoading: boolean;
	onCreate: (values: any) => Promise<AxiosResponse | AxiosError>;
	onCancel: () => void;
	fetchData: Function;
}

const CollectionCreateForm: FC<CollectionCreateFormProps> = ({
	visible,
	confirmLoading,
	onCreate,
	onCancel,
	fetchData,
}) => {
	const [form] = Form.useForm();
	const contextVariables = useContext(SuperUserContext);
	const [page, setPage] = useState("selectBuilding");
	const [buildingNames, setBuildingNames] = useState([]);
	const [occupancies, setOccupancies] = useState<any[]>([]);
	const [hazardClassification, setHazardClassification] = useState<any[]>([]);
	const [typeOfConstruction, setTypeOfConstruction] = useState([]);
	const [engineers, setEngineers] = useState<any[]>([]);
	const [contractType, setContractType] = useState<any>([]);
	const [requiredFields, setRequiredFields] = useState({
		building_name: true,
		region: true,
		time_zone: true,
		jurisdiction: true,
		building_no: true,
		street_no: true,
		zone_no: true,
		// unit_no: true,
		building_area: true,
		occupancy_classification: true,
		hazard_classification: true,
		building_completion_certificate_number: true,
		contact_number: true,
		building_height: true,
		type_of_construction: true,
		owner: true,
		contract_number: true,
		contract_type: true,
	});
	const [buildingsRequiredFields, setBuildingsRequiredFields] = useState({
		building_name: true,
		jurisdiction: true,
		building_no: true,
		street_no: true,
		zone_no: true,
		// unit_no: true,
		building_area: true,
		occupancy_classification: true,
		hazard_classification: true,
		building_completion_certificate_number: true,
		contact_number: true,
		building_height: true,
		type_of_construction: true,
	});

	const [buildingDetails, setBuildingDetails] = useState<any>({});
	const [contractDetails, setContractDetails] = useState<any>({});
	const [attachmentDetails, setAttachmentDetails] = useState<any[]>([]);

	const [addingBuilding, setAddingBuilding] = useState(-1);
	const [savingContract, setSavingContract] = useState(-1);
	const [savingAttachments, setSavingAttachments] = useState(-1);

	const [systems, setSystems] = useState<Array<{ id: number; name: string }>>(
		[]
	);

	const [BuildingForm] = Form.useForm();

	useEffect(() => {
		getAllDropdowns();
		// getAllBuildings();
		// getSystems();
	}, []);

	const getAllDropdowns = () => {
		apiCall({
			method: "GET",
			url: "/dropdown/dropdownAll",
			handleResponse: (res) => {
				setOccupancies(res.data.message.occupancyClassification || []);
				setHazardClassification(res.data.message.hazardClassification || []);
				setTypeOfConstruction(res.data.message.typeOfConstruction || []);
				setContractType(res.data.message.contractType || []);
				setEngineers(res.data.message.building_controllers || []);
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

	const getAllBuildings = () => {
		apiCall({
			method: "GET",
			url: "/clientbuildings?column_name=names",
			handleResponse: (res) => {
				setBuildingNames(res.data.message || []);
			},
		});
	};

	const getStepStatus = (step: steps) => {
		if (step === "buildingStep") {
			switch (page) {
				case "selectBuilding":
				case "addBuilding":
					return "process";
				case "contract":
				case "attachments":
				case "completed":
				case "summary":
					return "finish";
			}
		} else if (step === "contractStep") {
			switch (page) {
				case "selectBuilding":
				case "addBuilding":
					return "wait";
				case "contract":
					return "process";
				case "attachments":
				case "completed":
				case "summary":
					return "finish";
			}
		} else if (step === "attachmentsStep") {
			switch (page) {
				case "selectBuilding":
				case "addBuilding":
				case "contract":
					return "wait";
				case "attachments":
					return "process";
				case "completed":
				case "summary":
					return "finish";
			}
		} else if (step === "completedStep") {
			switch (page) {
				case "selectBuilding":
				case "addBuilding":
				case "contract":
				case "attachments":
					return "wait";
				case "completed":
				case "summary":
					return "finish";
			}
		}
		return "wait";
	};

	const getSystems = () => {
		apiCall({
			method: "GET",
			url: "/assets/systems",
			handleResponse: (res) => {
				setSystems(res.data.message);
			},
		});
	};

	const saveContractDetails = (building_id: any) => {
		setSavingContract(0);
		apiCall({
			method: "POST",
			url: "/contracts",
			data: { contract: { ...contractDetails, building_id } },
			handleResponse: (res) => {
				console.log(res);
				setSavingContract(1);
			},
			handleError: (err) => {
				setSavingContract(-1);
			},
		});
	};

	const uploadfiles = (building_id: any) => {
		let promises: Promise<any>[] = [];
		let files: any[] = [];

		attachmentDetails.map((file: any) => {
			promises.push(
				apiCall({
					method: "PUT",
					url: "/fileupload",
					data: {
						type: "buildings",
						type_name: building_id.toString(),
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

		Promise.all(promises).then(() => {
			apiCall({
				method: "PUT",
				url: "/clientbuildings",
				data: { id: building_id, data: { attachments: files } },
				handleResponse: (res) => {
					console.log(res);
					setSavingAttachments(1);
				},
			});
		});
	};

	const addBuilding = () => {
		if (buildingDetails) setAddingBuilding(0);
		apiCall({
			method: "POST",
			url: "/clientbuildings",
			data: buildingDetails,
			handleResponse: (res) => {
				console.log(res);
				setAddingBuilding(1);
				if (attachmentDetails?.length > 0) {
					setSavingAttachments(0);
					uploadfiles(res.data.message.id);
				}
				fetchData();
				// saveContractDetails(res.data.message.id);
			},
			handleError: (err) => {
				setAddingBuilding(-1);
			},
		});
	};

	const submit = () => {
		// if (buildingDetails.id) {   //TODO Contract
		// 	saveContractDetails(buildingDetails.id);
		// } else {
		// 	addBuilding();
		// }
		addBuilding();
	};

	const closeModal = () => {
		form.resetFields();
		onCancel();
		setPage("selectBuilding");
		setSavingAttachments(-1);
		setSavingContract(-1);
		setAddingBuilding(-1);
		setBuildingDetails({});
		setContractDetails({});
		setAttachmentDetails([]);
	};

	return (
		<Modal
			open={visible}
			destroyOnClose={true}
			footer={null}
			style={{ top: "20px" }}
			bodyStyle={{ overflowY: "scroll", maxHeight: "calc(100vh - 150px)" }}
			title={
				<>
					<h3 style={{ marginTop: "2px" }}>Create Building</h3>

					<Steps size="small">
						<Step
							status={getStepStatus("buildingStep")}
							title="Building"
							icon={<BankOutlined />}
						/>
						{/* <Step
							status={getStepStatus("contractStep")}
							title="Contract"
							icon={<SolutionOutlined />}
						/> */}
						<Step
							status={getStepStatus("attachmentsStep")}
							title="Attachments"
							icon={<PaperClipOutlined />}
						/>
						<Step
							status={getStepStatus("completedStep")}
							title="Summary"
							icon={<FileDoneOutlined />}
						/>
					</Steps>
				</>
			}
			okText="Add Client"
			maskClosable={false}
			cancelText="Cancel"
			onCancel={closeModal}
			onOk={() => {
				form
					.validateFields()
					.then((values) => {
						onCreate(values).then(() => {
							form.resetFields();
						});
					})
					.catch((info) => {
						console.log("Validate Failed:", info);
					});
			}}
			confirmLoading={confirmLoading}
			width={1000}
		>
			{page === "selectBuilding" ? (
				<SelectBuilding
					// nextFunc={() => setPage("contract")} #remove contract change
					nextFunc={() => setPage("attachments")}
					occupancies={occupancies}
					hazardClassification={hazardClassification}
					typeOfConstruction={typeOfConstruction}
					requiredFields={buildingsRequiredFields}
					setBuildingDetails={setBuildingDetails}
					buildingNames={buildingNames}
					engineers={engineers}
					buildingDetails={buildingDetails || {}}
					// form={BuildingForm}
				/>
			) : page === "addBuilding" ? (
				<div>HEllo</div>
			) : // ) : page === "contract" ? (
			//   <AddContract
			//     nextFunc={() => {
			//       setPage("attachments");
			//     }}
			//     prevFunc={() => {
			//       setPage("selectBuilding");
			//     }}
			//     contractType={contractType}
			//     setContractDetails={setContractDetails}
			//     systems={systems}
			//     contractDetails={contractDetails || {}}
			//   />
			// )
			// <Button onClick={() => setPage("attachments")}>Next</Button>
			page === "attachments" ? (
				// <Button onClick={() => setPage("completed")}>Next</Button>
				<AddAttachments
					nextFunc={() => {
						setPage("summary");
						console.log("buildingDetails: ", buildingDetails);
						console.log("AttachmentDetails: ", attachmentDetails);
						console.log("ContractDetails: ", contractDetails);
					}}
					prevFunc={() => {
						setPage("contract");
					}}
					setAttachmentDetails={setAttachmentDetails}
				/>
			) : page === "summary" ? (
				<>
					<h2>Summary</h2>
					<Descriptions
						title="Building Details"
						size="small"
						column={2}
						labelStyle={{ fontWeight: "bold" }}
					>
						<Descriptions.Item label="Building">
							{buildingDetails.building_name}
						</Descriptions.Item>
						<Descriptions.Item label="Address">
							Building {buildingDetails.building_no}, Street{" "}
							{buildingDetails.street_no}, Zone {buildingDetails.zone_no}
						</Descriptions.Item>
						<Descriptions.Item label="Height">
							{buildingDetails.building_height}
						</Descriptions.Item>
						<Descriptions.Item label="Metrics">
							{buildingDetails.metrics}
						</Descriptions.Item>

						<Descriptions.Item label="Contact Number">
							{buildingDetails.contact_number}
						</Descriptions.Item>
						<Descriptions.Item label="Building Completion certificate No. ">
							{buildingDetails.building_completion_certificate_number}
						</Descriptions.Item>
						{/* <Descriptions.Item label="Jurisdiction ">QCD</Descriptions.Item> */}
						<Descriptions.Item label="Hazard Classification">
							{
								hazardClassification.find(
									(x: any) => x.id === buildingDetails.hazard_classification
								).value
							}
						</Descriptions.Item>
						<Descriptions.Item label="Occupancy Classification">
							{
								occupancies.find(
									(x: any) => x.id === buildingDetails.occupancy_classification
								).value
							}
						</Descriptions.Item>
						{/* <Descriptions.Item label="Assigned Engineer">
							{
								engineers.find(
									(x: any) => x.id === buildingDetails.building_controller
								).name
							}
						</Descriptions.Item> */}
					</Descriptions>
					<br />
					{/* <Descriptions
						title="Contract Details"
						size="small"
						column={2}
						labelStyle={{ fontWeight: "bold" }}
					>
						<Descriptions.Item label="Contract No.">
							{contractDetails.contract_number}
						</Descriptions.Item>
						<Descriptions.Item label="Contract Type">
							{
								contractType.find(
									(x: any) => x.id === contractDetails.contract_type
								).value
							}
						</Descriptions.Item>
						<Descriptions.Item label="Currency">
							{contractDetails.currency}
						</Descriptions.Item>
						<Descriptions.Item label="Total Contract Value">
							{contractDetails.total_contract_value}
						</Descriptions.Item>

						<Descriptions.Item span={2} label="Fire Protection Systems">
							{""}
						</Descriptions.Item>

						{contractDetails.fire_protection_systems.map((x: any) => (
							<>
								<Descriptions.Item label="System">
									{systems.find((y: any) => y.id === x.system)?.name}
								</Descriptions.Item>
								<Descriptions.Item label="Frequency">
									{x.frequency}
								</Descriptions.Item>
							</>
						))}
					</Descriptions> */}
					<br />
					<Row>
						<Col md={6} xs={0} style={{ paddingLeft: "10px" }} />
						<Col md={6} xs={6} style={{ paddingLeft: "10px" }}>
							<Button
								size="middle"
								block
								type="default"
								onClick={() => setPage("attachments")}
							>
								Back
							</Button>
						</Col>
						<Col md={6} xs={6} style={{ paddingLeft: "10px" }}>
							<Button
								size="middle"
								block
								type="primary"
								onClick={() => {
									setPage("completed");
									submit();
								}}
							>
								Submit
							</Button>
						</Col>
						<Col md={6} xs={0} style={{ paddingLeft: "10px" }} />
					</Row>
				</>
			) : (
				// <>
				// 	{addingBuilding === 1 ? (
				// 		<h4 style={{ color: "green" }}>
				// 			<CheckOutlined />
				// 			&nbsp;Building Successfully added
				// 		</h4>
				// 	) : addingBuilding === 0 ? (
				// 		<h4 style={{ color: "#0087FF" }}>
				// 			<LoadingOutlined />
				// 			&nbsp; Adding Building
				// 		</h4>
				// 	) : null}
				// 	{savingContract === 1 ? (
				// 		<h4 style={{ color: "green" }}>
				// 			<CheckOutlined />
				// 			&nbsp; Contract details saved
				// 		</h4>
				// 	) : savingContract === 0 ? (
				// 		<h4 style={{ color: "#0087FF" }}>
				// 			<LoadingOutlined />
				// 			&nbsp; Saving Contract Details
				// 		</h4>
				// 	) : null}
				// </>
				<Result
					// status={savingContract === 1 ? "success" : undefined}
					status={"success"}
					icon={
						savingAttachments === 1 ||
						(savingAttachments === -1 && addingBuilding === 1) ? undefined : (
							<LoadingOutlined />
						)
					}
					title={
						savingAttachments === 1 ||
						(savingAttachments === -1 && addingBuilding === 1)
							? "Building Successfully Added"
							: "Adding a New Building"
					}
					subTitle={
						addingBuilding === 0
							? "Adding Building"
							: savingAttachments === 0
							? "Uploading files"
							: ""
					}
					extra={[
						savingAttachments === 1 ||
						(savingAttachments === -1 && addingBuilding === 1) ? (
							<Button type="primary" onClick={closeModal} key="console">
								Go Back
							</Button>
						) : (
							""
						),
					]}
				/>
			)}
		</Modal>
	);
};

const AddNewBuilding: FC<props> = ({ fetchData }) => {
	const [visible, setVisible] = useState(false);
	const [confirmLoading, setConfirmLoading] = useState(false);

	const onCreate = (values: any) => {
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			console.log("Received values of form: ", values);
			setConfirmLoading(true);
			apiCall({
				method: "POST",
				url: "/clients",
				data: { client: values },
				handleResponse: (res) => {
					resolve(res);
					setConfirmLoading(false);
					message.success(res.data.message);
					setVisible(false);
					fetchData();
				},
				handleError: (err) => {
					reject(err);
					setConfirmLoading(false);
				},
			});
		});
	};

	return (
		<div>
			<Button
				icon={<PlusOutlined />}
				onClick={() => {
					setVisible(true);
				}}
				type={"primary"}
			>
				Create Building
			</Button>
			<CollectionCreateForm
				visible={visible}
				onCreate={onCreate}
				onCancel={() => {
					setVisible(false);
				}}
				confirmLoading={confirmLoading}
				fetchData={fetchData}
			/>
		</div>
	);
};

export default AddNewBuilding;
