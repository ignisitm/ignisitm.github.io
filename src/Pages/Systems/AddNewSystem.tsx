import {
	Button,
	DatePicker,
	Divider,
	Form,
	Input,
	InputNumber,
	message,
	Modal,
	Select,
	Space,
	Table,
	Tabs,
} from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { FC, useState, useContext, useRef, useEffect } from "react";
import { SystemContext } from "../../Helpers/Context";
import { apiCall } from "../../axiosConfig";
import { AxiosError, AxiosResponse } from "axios";
import dayjs from "dayjs";
import type { TabsProps } from "antd";

interface props {
	fetchData: Function;
}

interface CollectionCreateFormProps {
	visible: boolean;
	confirmLoading: boolean;
	onCreate: (values: any) => Promise<AxiosResponse | AxiosError>;
	onCancel: () => void;
}

const CollectionCreateForm: FC<CollectionCreateFormProps> = ({
	visible,
	confirmLoading,
	onCreate,
	onCancel,
}) => {
	const [form] = Form.useForm();
	const contextVariables = useContext(SystemContext);
	const [loadingGeneralFields, setLoadingGeneralFields] = useState(false);
	const [loadingProcedures, setLoadingProcedures] = useState(false);
	const [generalFields, setGeneralFields] = useState<any>([]);
	const [procedures, setProcedures] = useState<any>([]);
	const [ProceduresDetails, setProceduresDetails] = useState<any>([]);
	const [frequencies, setFrequencies] = useState<any>([]);
	const [othersInput, setOthersInput] = useState<any>("");
	const selectRef = useRef<any>({});
	const [activeAHJ, setActiveAHJ] = useState<any>();
	const [page, setPage] = useState(1);
	const [openAllPLSD, setOpenAllPSD] = useState(false);
	const [allPLSD, setAllPLSD] = useState<any>();

	useEffect(() => {
		getFrequencies();
	}, []);

	const getGeneralFields = (id: any) => {
		setGeneralFields([]);
		setLoadingGeneralFields(true);
		apiCall({
			method: "GET",
			url: `dropdown/systemfields?id=${id}`,
			handleResponse: (res) => {
				console.log(res);
				setGeneralFields(res.data.message.general_information);
				setLoadingGeneralFields(false);
			},
			handleError: (err) => setLoadingGeneralFields(false),
		});
	};

	const getFrequencies = () => {
		apiCall({
			method: "GET",
			url: "/dropdown/frequency",
			handleResponse: (res) => {
				setFrequencies(res.data.message);
			},
		});
	};

	const sortDataforMFR = (data: any) => {
		return data.sort((a: any, b: any) => {
			if (a.frequency === 9999 && b.frequency !== 9999) {
				return -1; // Move a before b
			}
			if (a.frequency !== 9999 && b.frequency === 9999) {
				return 1; // Move b before a
			}
			return 0; // Keep the same order for others
		});
	};

	const getProcedures = (id: any) => {
		setProcedures([]);
		setLoadingProcedures(true);
		apiCall({
			method: "GET",
			url: `dropdown/clientsystemprocedures?system_id=${id}`,
			handleResponse: (res) => {
				let pd = res.data.message.map((x: any) => ({
					procedure_id: x.id,
					frequency: x.frequency,
					last_service_date: dayjs(),
				}));
				setProceduresDetails(pd);
				let grouped = groupAndSort(res.data.message, "ahj");
				setProcedures(grouped);
				setActiveAHJ(Object.keys(grouped)[0]?.toString() || "");
				setLoadingProcedures(false);
			},
			handleError: (err) => setLoadingGeneralFields(false),
		});
	};

	const clearModal = () => {
		form.resetFields();
		setPage(1);
		setGeneralFields([]);
		setProcedures([]);
		setActiveAHJ(null);
		setAllPLSD(null);
		setOpenAllPSD(false);
	};

	var groupBy = (data: any, key: string) => {
		return data.reduce((storage: any, item: any) => {
			var group = item[key];
			storage[group] = storage[group] || [];
			storage[group].push(item);
			return storage;
		}, {});
	};

	const groupAndSort = (data: any, groupKey: string) => {
		let groupedData = groupBy(data, groupKey);

		// Sort each group based on frequency
		for (let key in groupedData) {
			groupedData[key] = sortDataforMFR(groupedData[key]);
		}

		return groupedData;
	};

	const setAPLSD = (date: any) => {
		setAllPLSD(date);
	};

	const setAllProceduresForAHJ = () => {
		console.log(procedures);
		let pd = [...ProceduresDetails];
		console.log(pd);
		procedures[activeAHJ].map((proc: any) => {
			let idx = pd.findIndex((x: any) => x.procedure_id === proc.id);
			pd[idx].last_service_date = allPLSD;
		});
		setProceduresDetails(pd);
		setAllPLSD(null);
		setOpenAllPSD(false);
	};

	const ModalForAllProcedures = () => (
		<Modal
			style={{ top: "20px" }}
			destroyOnClose={true}
			open={openAllPLSD}
			onCancel={() => {
				setAllPLSD(null);
				setOpenAllPSD(false);
			}}
			onOk={() => {
				if (allPLSD) setAllProceduresForAHJ();
				else message.error("Select a date");
			}}
			title={
				"Last Service Date for all Procedures under " +
				(procedures[activeAHJ]?.[0]?.name || "")
			}
		>
			<DatePicker
				value={allPLSD || null}
				onChange={setAPLSD}
				style={{ width: "100%" }}
			/>
		</Modal>
	);

	const ProceduresTables = () => (
		<div style={page === 1 ? { display: "none" } : {}}>
			<Tabs
				tabBarExtraContent={
					<>
						<Button onClick={() => setOpenAllPSD(true)} type="link">
							Set last service date for all Procedures under this AHJ
						</Button>
						<ModalForAllProcedures />
					</>
				}
				defaultActiveKey={Object.keys(procedures)[0]?.toString() || ""}
				activeKey={activeAHJ || Object.keys(procedures)[0]?.toString() || ""}
				onChange={(key: any) => setActiveAHJ(key)}
				type="card"
				items={Object.keys(procedures).map((ahj: any) => ({
					label: procedures[ahj][0].name,
					key: ahj.toString(),
					children: (
						<Table
							columns={[
								{ title: "Code", dataIndex: "code" },
								{ title: "Procedure", dataIndex: "procedure" },
								{ title: "Activity", dataIndex: "activity" },
								{
									title: "Frequency",
									dataIndex: "frequency",
									width: "20%",
									render: (freq: any, row: any) => (
										<Select
											style={{
												width: "100%",
											}}
											disabled={freq !== 9999}
											status={
												ProceduresDetails.find(
													(x: any) => x.procedure_id === row.id
												)?.frequency === 9999
													? "error"
													: ""
											}
											onSelect={(e) => {
												let pd = [...ProceduresDetails];
												let index = pd.findIndex(
													(x: any) => x.procedure_id === row.id
												);
												pd[index].frequency = e;
												setProceduresDetails(pd);
											}}
											value={
												ProceduresDetails.find(
													(x: any) => x.procedure_id === row.id
												)?.frequency
											}
											options={frequencies.map((f: any) => ({
												label: f.name,
												value: f.id,
											}))}
										/>
									),
								},
								{
									title: "Last Service Date",
									dataIndex: "last_service_date",
									width: "10%",
									render: (date: any, row: any) => (
										<DatePicker
											value={
												ProceduresDetails?.find(
													(x: any) => x.procedure_id === row.id
												)?.last_service_date
											}
											defaultValue={dayjs()}
											onChange={(e) => {
												let pd = [...ProceduresDetails];
												let index = pd.findIndex(
													(x: any) => x.procedure_id === row.id
												);
												pd[index].last_service_date = e;
												setProceduresDetails(pd);
											}}
										/>
									),
								},
							]}
							dataSource={procedures[ahj]}
						/>
					),
				}))}
			/>
		</div>
	);

	return (
		<Modal
			open={visible}
			style={{ minWidth: "300px", top: "20px" }}
			width={page === 2 ? "80%" : "50%"}
			title={
				"Add a new System - " +
				(page === 2 ? "Procedures" : "System Information")
			}
			okText={page === 2 ? "Add System" : "Next"}
			cancelText={page === 2 ? "Back" : "Cancel"}
			destroyOnClose={true}
			closeIcon={null}
			maskClosable={false}
			onCancel={() => {
				if (page === 2) {
					setPage(1);
				} else {
					clearModal();
					onCancel();
				}
			}}
			onOk={() => {
				if (page === 2) {
					form
						.validateFields()
						.then((values) => {
							values["procedureDetails"] = ProceduresDetails;
							onCreate(values).then(() => {
								clearModal();
							});
						})
						.catch((info) => {
							console.log("Validate Failed:", info);
						});
				} else {
					form.validateFields().then(() => {
						setPage(2);
					});
				}
			}}
			confirmLoading={page === 2 && confirmLoading}
		>
			<ProceduresTables />
			<Form
				style={page === 2 ? { display: "none" } : {}}
				form={form}
				layout="vertical"
				name="form_in_modal"
				initialValues={{ modifier: "public" }}
			>
				<Form.Item
					name="name"
					label="System Name"
					rules={[
						{
							required: true,
							message: "Please input the name of system!",
						},
					]}
				>
					<Input />
				</Form.Item>
				<Form.Item
					name="tag"
					label="System Tag"
					rules={[
						{
							required: true,
							message: "Please input the tag of system!",
						},
					]}
				>
					<Input />
				</Form.Item>

				<Form.Item
					name="building_id"
					label="Select Building"
					rules={[{ required: true, message: "Please select a System Type" }]}
				>
					<Select
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
						{contextVariables.buildings?.map(
							(item: { id: object; building_name: string }, index: number) => (
								<Select.Option value={item.id}>
									{item.building_name}
								</Select.Option>
							)
						)}
					</Select>
				</Form.Item>
				<Form.Item
					name="contract_id"
					label="Select Contract"
					// rules={[{ required: true, message: "Please select a System Type" }]}
				>
					<Select
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
						{contextVariables.contracts?.map(
							(item: { id: object; title: string }, index: number) => (
								<Select.Option
									value={item.id}
								>{`${item.id} - ${item.title}`}</Select.Option>
							)
						)}
					</Select>
				</Form.Item>
				<Form.Item
					name="type"
					label="Select System Type"
					rules={[{ required: true, message: "Please select a System Type" }]}
				>
					<Select
						showSearch
						onChange={(id: any) => {
							getGeneralFields(id);
							getProcedures(id);
						}}
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
						{contextVariables.systemTypes?.map(
							(item: { id: object; name: string }, index: number) => (
								<Select.Option value={item.id}>{item.name}</Select.Option>
							)
						)}
					</Select>
				</Form.Item>
				{(loadingGeneralFields || loadingProcedures) && (
					<h4>
						<LoadingOutlined /> Loading Genreral Information Fields...
					</h4>
				)}
				{!(loadingGeneralFields || loadingProcedures) && generalFields?.length
					? generalFields.map((field: any) => (
							<Form.Item
								name={field.name}
								label={field.name}
								rules={[
									...(field.mandatory
										? [
												{
													required: true,
													message: `Please provide ${field.name}`,
												},
										  ]
										: []),
								]}
							>
								{field.type === "number" ? (
									<InputNumber style={{ width: "100%" }} />
								) : field.type === "text" ? (
									<Input />
								) : field.type === "longtext" ? (
									<Input.TextArea />
								) : field.type === "dropdown" ? (
									<Select
										// ref={selectRef[field.name]} TODO fix dropdown
										placeholder="Select one"
										dropdownRender={(menu: any) =>
											field.others ? (
												<>
													{menu}
													<Divider style={{ margin: "8px 0" }} />
													<Input.Search
														value={othersInput}
														onChange={(e) => setOthersInput(e.target.value)}
														enterButton="Add"
														onSearch={(e) => {
															let gd = [...generalFields];
															let idx = gd.findIndex(
																(x: any) => x.name === field.name
															);
															gd[idx]["data"] = [...gd[idx]["data"], e];
															setOthersInput("");
															setGeneralFields(gd);
															console.log(gd);
														}}
														style={{ width: "100%" }}
													/>
												</>
											) : (
												<>{menu}</>
											)
										}
									>
										{field.data?.map((opt: any) => (
											<Select.Option value={opt}>{opt}</Select.Option>
										))}
									</Select>
								) : field.type === "boolean" ? (
									<Select>
										<Select.Option value={true}>YES</Select.Option>
										<Select.Option value={false}>NO</Select.Option>
									</Select>
								) : null}
							</Form.Item>
					  ))
					: null}
			</Form>
		</Modal>
	);
};

const AddNewSystem: FC<props> = ({ fetchData }: props) => {
	const [visible, setVisible] = useState(false);
	const [confirmLoading, setConfirmLoading] = useState(false);

	const onCreate = (values: any) => {
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			console.log("Received values of form: ", values);
			let procedureDetails = values["procedureDetails"];
			let contract_id = values["contract_id"] || null;
			let building_id = values["building_id"];
			let type = values["type"];
			let name = values["name"];
			let tag = values["tag"];
			delete values["procedureDetails"];
			delete values["contract_id"];
			delete values["building_id"];
			delete values["type"];
			delete values["name"];
			delete values["tag"];

			const hasInvalidFrequency = procedureDetails.some((prd: any) => {
				if (prd.frequency === 9999) {
					message.error(
						"Please define the frequencies for all the procedures with frequency as 'Manufacturer Recommended'"
					);
					reject(
						"Please define the frequencies for all the procedures with frequency as 'Manufacturer Recommended'"
					);
					return true; // Stop the iteration
				}
				return false;
			});

			if (hasInvalidFrequency) return;

			procedureDetails = procedureDetails.map((prd: any) => {
				let proc = { ...prd };
				if (proc.frequency === 9999) {
					message.error(
						"Please define the frequencies for all the procedures with frequency as 'Manufacturer Recommended'"
					);
					reject(
						"Please define the frequencies for all the procedures with frequency as 'Manufacturer Recommended'"
					);
				}
				proc["last_service"] = proc.last_service_date;
				proc["next_service"] = proc.last_service_date
					.add(proc.frequency, "days")
					.toISOString();
				delete proc["last_service_date"];
				return proc;
			});
			let data = {
				general_information: { ...values },
				building_id,
				type,
				name,
				tag,
			};
			let resp_data = {
				contract_id: contract_id,
				system_data: data,
				procedure_data: procedureDetails,
			};
			console.log(resp_data);
			setConfirmLoading(true);
			apiCall({
				method: "POST",
				url: "/clientsystems",
				data: resp_data,
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
				type="primary"
			>
				Add System
			</Button>
			<CollectionCreateForm
				visible={visible}
				onCreate={onCreate}
				onCancel={() => {
					setVisible(false);
				}}
				confirmLoading={confirmLoading}
			/>
		</div>
	);
};

export default AddNewSystem;
