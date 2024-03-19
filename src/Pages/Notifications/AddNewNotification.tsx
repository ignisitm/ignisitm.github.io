import {
	Button,
	Col,
	Form,
	Input,
	message,
	Modal,
	Row,
	Select,
	Space,
	Tabs,
	TabsProps,
} from "antd";
import {
	LoadingOutlined,
	MinusCircleOutlined,
	PlusOutlined,
} from "@ant-design/icons";
import { FC, useState, useContext, useEffect } from "react";
import { NotificationContext } from "../../Helpers/Context";
import { apiCall } from "../../axiosConfig";
import { AxiosError, AxiosResponse } from "axios";
const { TextArea } = Input;

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
	const contextVariables = useContext(NotificationContext);
	const [selectedBuilding, setSelectedBuilding] = useState<any>(null);
	const [selectedSystem, setSelectedSystem] = useState<any>(null);
	const [loadingSystems, setLoadingSystems] = useState(false);
	const [systems, setSystems] = useState<any[]>([]);
	const [loadingAssets, setLoadingAssets] = useState(false);
	const [assets, setAssets] = useState<any[]>([]);
	const [notificationType, setNotificationType] = useState("Corrective");

	useEffect(() => {
		if (selectedBuilding) getSystems(selectedBuilding);
	}, [selectedBuilding]);

	useEffect(() => {
		if (selectedSystem) getAssets(selectedSystem);
	}, [selectedSystem]);

	const onTabChange = (key: string) => {
		if (selectedSystem) getAssets(selectedSystem, key);
		setNotificationType(key);
	};

	const items: TabsProps["items"] = [
		{
			key: "Corrective",
			label: "Corrective Notification",
		},
		{
			key: "ITM",
			label: "Preventive Notification",
		},
	];

	const resetModal = () => {
		form.resetFields();
		setSelectedBuilding(null);
		setSelectedSystem(null);
		setSystems([]);
		setAssets([]);
		setNotificationType("Corrective");
	};

	const getSystems = (building_id: any) => {
		setLoadingSystems(true);
		apiCall({
			method: "GET",
			url: `/dropdown/systems?building_id=${building_id}&status=ACTIVE`,
			handleResponse: (res) => {
				console.log(res);
				setSystems(res.data.message);
				setLoadingSystems(false);
			},
			handleError: () => setLoadingSystems(false),
		});
	};

	const getAssets = (system_id: any, _nt = notificationType) => {
		setLoadingAssets(true);
		apiCall({
			method: "GET",
			url: `/dropdown/${
				_nt === "Corrective" ? "assets" : "client_system_procedures"
			}?system_id=${system_id}`,
			handleResponse: (res) => {
				console.log(res);
				setAssets(res.data.message);
				setLoadingAssets(false);
			},
			handleError: () => setLoadingAssets(false),
		});
	};

	return (
		<Modal
			open={visible}
			style={{ top: "20px" }}
			width={900}
			title="Add a new Notification"
			okText="Add Notification"
			maskClosable={false}
			destroyOnClose={true}
			cancelText="Cancel"
			onCancel={() => {
				resetModal();
				onCancel();
			}}
			onOk={() => {
				form
					.validateFields()
					.then((values) => {
						if (notificationType === "Corrective") {
							values["type"] = "Corrective";
						} else if (notificationType === "ITM") {
							values["type"] = "ITM";
						}
						onCreate(values).then(() => {
							resetModal();
						});
					})
					.catch((info) => {
						console.log("Validate Failed:", info);
					});
			}}
			confirmLoading={confirmLoading}
		>
			<Tabs
				defaultActiveKey="Corrective"
				items={items}
				onChange={onTabChange}
			/>
			<Form
				form={form}
				layout="vertical"
				name="form_in_modal"
				initialValues={{ modifier: "public" }}
			>
				<Form.Item
					name="building_id"
					label="Select Building"
					rules={[{ required: true, message: "Please select a Building" }]}
				>
					<Select
						showSearch
						onChange={(e) => setSelectedBuilding(e)}
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
				{loadingSystems && (
					<h4>
						<LoadingOutlined /> Loading Systems...
					</h4>
				)}
				{systems.length > 0 ? (
					<Form.Item
						name="system_id"
						label="Select System"
						rules={[{ required: true, message: "Please select a System" }]}
					>
						<Select
							showSearch
							onChange={(e) => setSelectedSystem(e)}
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
							{systems?.map(
								(item: { id: object; name: string }, index: number) => (
									<Select.Option value={item.id}>{item.name}</Select.Option>
								)
							)}
						</Select>
					</Form.Item>
				) : null}
				{loadingAssets && (
					<h4>
						<LoadingOutlined /> Loading{" "}
						{notificationType === "Corrective" ? "Assets" : "Procedures"}...
					</h4>
				)}
				{assets.length > 0 ? (
					notificationType === "Corrective" ? (
						// assets?.map(
						// 	(
						// 		item: { id: number; name: string; tag: string },
						// 		index: number
						// 	) => (
						// 		<Select.Option
						// 			value={item.id}
						// 		>{`${item.tag} : ${item.name}`}</Select.Option>
						// 	)
						// )
						<Form.List name="procedure_ids">
							{(fields, { add, remove }) => (
								<>
									<label>Defects:</label>
									{fields.map(({ key, name, ...restField }) => (
										<Row
											key={key}
											// style={{ display: "flex" }}
											// align="baseline"
											gutter={8}
										>
											<Col span={7}>
												<Form.Item
													{...restField}
													name={[name, "asset_id"]}
													rules={[{ required: true, message: "Missing Asset" }]}
												>
													<Select
														showSearch
														placeholder="Search Asset"
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
																	(
																		optionB!.children as unknown as string
																	).toLowerCase()
																)
														}
													>
														{assets?.map(
															(
																item: { id: number; name: string; tag: string },
																index: number
															) => (
																<Select.Option
																	value={item.id}
																>{`${item.tag} : ${item.name}`}</Select.Option>
															)
														)}
													</Select>
												</Form.Item>
											</Col>
											<Col span={16}>
												<Form.Item
													{...restField}
													name={[name, "description"]}
													rules={[
														{ required: true, message: "Missing Description" },
													]}
												>
													<Input placeholder="Description" />
												</Form.Item>
											</Col>
											<Col span={1}>
												<MinusCircleOutlined
													onClick={() => remove(name)}
													style={{ marginTop: "8px" }}
												/>
											</Col>
											<Form.Item
												{...restField}
												name={[name, "status"]}
												rules={[
													{ required: true, message: "Missing Description" },
												]}
												hidden={true}
												initialValue={"Open"}
											/>
										</Row>
									))}
									<Form.Item>
										<Button
											type="dashed"
											onClick={() => add()}
											block
											icon={<PlusOutlined />}
										>
											Add Defects
										</Button>
									</Form.Item>
								</>
							)}
						</Form.List>
					) : notificationType === "ITM" ? (
						<Form.Item
							name="procedure_ids"
							label={`Select Procedures
						}`}
							rules={[{ required: true, message: "Please select assets" }]}
						>
							<Select
								showSearch
								mode="multiple"
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
								{assets?.map(
									(
										item: { id: number; code: string; procedure: string },
										index: number
									) => (
										<Select.Option
											value={item.id}
										>{`${item.code} : ${item.procedure}`}</Select.Option>
									)
								)}
							</Select>
						</Form.Item>
					) : null
				) : null}
				{selectedSystem && (
					<Form.Item name="description" label="Description">
						<TextArea rows={4} />
					</Form.Item>
				)}
			</Form>
		</Modal>
	);
};

const AddNewNotification: FC<props> = ({ fetchData }: props) => {
	const [visible, setVisible] = useState(false);
	const [confirmLoading, setConfirmLoading] = useState(false);

	const onCreate = (values: any) => {
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			if (values?.procedure_ids?.length <= 0 && values?.type === "Corrective") {
				message.error("Add atleast one asset");
				reject("Add atleast one asset");
			}
			let responseData = { ...values, status: "OPEN" };
			delete responseData["building_id"];
			console.log("Received values of form: ", responseData);
			setConfirmLoading(true);
			apiCall({
				method: "POST",
				url: "/clientnotifications",
				data: responseData,
				handleResponse: (res) => {
					resolve(res);
					setConfirmLoading(false);
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
				Add Notification
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

export default AddNewNotification;
