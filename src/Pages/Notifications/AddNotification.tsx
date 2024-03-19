import {
	ArrowLeftOutlined,
	DeleteOutlined,
	EditFilled,
	LeftCircleFilled,
	LeftOutlined,
	LoadingOutlined,
	MinusCircleOutlined,
	PlusOutlined,
	UploadOutlined,
} from "@ant-design/icons";
import {
	Button,
	Card,
	Col,
	Divider,
	Form,
	Input,
	Modal,
	Popconfirm,
	Row,
	Select,
	Space,
	Table,
	Tabs,
	TabsProps,
	Tooltip,
	Typography,
	message,
} from "antd";
import { FC, useContext, useEffect, useState } from "react";
import { NotificationContext } from "../../Helpers/Context";
import { apiCall } from "../../axiosConfig";
import TextArea from "antd/es/input/TextArea";
import Upload, { RcFile } from "antd/es/upload";
import axios, { AxiosError, AxiosResponse } from "axios";

const { Title, Text } = Typography;

interface props {
	goHome: any;
	fetchData: Function;
}

const AddNotification: FC<props> = ({ goHome, fetchData }) => {
	const [form] = Form.useForm();
	const [defectForm] = Form.useForm();
	const contextVariables = useContext(NotificationContext);
	const [selectedBuilding, setSelectedBuilding] = useState<any>(null);
	const [selectedSystem, setSelectedSystem] = useState<any>(null);
	const [loadingSystems, setLoadingSystems] = useState(false);
	const [systems, setSystems] = useState<any[]>([]);
	const [loadingAssets, setLoadingAssets] = useState(false);
	const [assets, setAssets] = useState<any[]>([]);
	const [notificationType, setNotificationType] = useState("Corrective");
	const [assetImage, setAssetImage] = useState<any>(null);
	const [addingDefect, setAddingDefect] = useState(false);
	const [defects, setDefects] = useState<any>([]);
	const [existingDefects, setExistingDefects] = useState<any>([]);
	const [editingData, setEditingData] = useState<any>(null);
	const [editMode, setEditMode] = useState(false);
	const [removeImageinEdit, setRemoveImageInEdit] = useState(false);
	const [exitModalOpen, setExitModalOpen] = useState(false);
	const [confirmLoading, setConfirmLoading] = useState(false);
	const [showExistingDefects, setShowExistingDefects] = useState(false);
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [addingED, setAddingED] = useState(false); //ED->Existing Defects

	const closeExistingDefectsModal = () => {
		setShowExistingDefects(false);
	};

	const openExistingDefectsModal = () => {
		setShowExistingDefects(true);
	};

	const showExitModal = () => {
		setExitModalOpen(true);
	};

	const handleExitOk = () => {
		setExitModalOpen(false);
		goHome();
	};

	const handleExitCancel = () => {
		setExitModalOpen(false);
	};

	const items: any = [
		{
			key: "Corrective",
			tab: "Corrective Notification",
		},
		{
			key: "ITM",
			tab: "Preventive Notification",
		},
	];

	useEffect(() => {
		if (selectedBuilding) getSystems(selectedBuilding);
	}, [selectedBuilding]);

	useEffect(() => {
		if (selectedSystem) getAssets(selectedSystem);
		if (selectedSystem) getExistingDefects(selectedSystem);
	}, [selectedSystem]);

	const onTabChange = (key: string) => {
		if (selectedSystem) getAssets(selectedSystem, key);
		setNotificationType(key);
		resetDefectForm();
		closeEditMode();
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

	const getExistingDefects = (system_id: any) => {
		apiCall({
			method: "GET",
			url: `/ClientDefect?system_id=${system_id}`,
			handleResponse: (res) => {
				setExistingDefects(res.data.message);
			},
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

	const defectCols = [
		{
			title: "Asset",
			dataIndex: "asset_id",
			ellipsis: true,
			render: (id: any, row: any) => {
				let asset_row = assets.find((x: any) => x.id === id);
				if (asset_row) {
					return `${asset_row.tag} : ${asset_row.name}`;
				} else return id;
			},
		},
		{
			title: "Description",
			dataIndex: "description",
			ellipsis: true,
		},
		{
			title: "Image",
			dataIndex: "url",
			render: (url: any) =>
				url ? (
					<a href={url} target="_blank">
						View Image
					</a>
				) : (
					"No Image"
				),
		},
		{
			title: "Action",
			dataIndex: "id",
			render: (id: number, row: any) =>
				editingData?.id === id ? (
					<Text type="warning">In Edit Mode </Text>
				) : (
					<Space>
						<Tooltip title="Edit">
							<Button
								style={{ padding: 0, margin: 0, height: 0 }}
								type="link"
								disabled={editMode}
								onClick={() => {
									setEditingData(row);
									setEditMode(true);
									defectForm.setFieldsValue({
										asset_id: row.asset_id,
										description: row.description,
									});
								}}
							>
								<EditFilled />
							</Button>
						</Tooltip>
						<Popconfirm
							title={
								<>
									<Text>Are you sure you want to delete this defect? </Text>
									<br />
									<Text type="secondary">
										To remove it from this notification, click on Remove {"("}
										<MinusCircleOutlined />
										{")"}
									</Text>
									<br />
								</>
							}
							onConfirm={() =>
								deleteDefect(id).then(() => {
									getExistingDefects(selectedSystem);
									let _defects = defects.filter((x: any) => x.id !== id);
									setDefects(_defects);
								})
							}
							// onCancel={cancel}
							okText="Delete"
							cancelText="Cancel"
							placement="left"
						>
							<Tooltip title="Delete">
								<div className="delete-table-action">
									<DeleteOutlined />
								</div>
							</Tooltip>
						</Popconfirm>
						<Popconfirm
							title="Are you sure to remove this defect from the notification?"
							onConfirm={() => {
								getExistingDefects(selectedSystem);
								let _defects = defects.filter((x: any) => x.id !== id);
								setDefects(_defects);
							}}
							// onCancel={cancel}
							okText="Remove"
							cancelText="Cancel"
							placement="left"
						>
							<Tooltip title="Remove">
								<div className="delete-table-action" style={{ color: "gray" }}>
									<MinusCircleOutlined />
								</div>
							</Tooltip>
						</Popconfirm>
					</Space>
				),
		},
	];

	const deleteDefect = (id: number) => {
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			apiCall({
				method: "DELETE",
				url: "/ClientDefect",
				data: { data: { id } },
				handleResponse: (res) => {
					message.success(res.data.message);
					resolve(res);
				},
				handleError: (err) => {
					reject(err);
				},
			});
		});
	};

	const dummyRequest = ({ file, onSuccess }: any) => {
		setTimeout(() => {
			onSuccess("ok");
		}, 0);
	};

	const beforeUpload = (file: RcFile) => {
		const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
		if (!isJpgOrPng) {
			message.error("You can only upload JPEG/PNG file!");
		}
		const isLt2M = file.size / 1024 / 1024 < 20;
		if (!isLt2M) {
			message.error("Image must be smaller than 20MB!");
		}
		return isJpgOrPng && isLt2M;
	};

	const uploadfiles = (file: any, id: number) => {
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			apiCall({
				method: "PUT",
				url: "/fileupload",
				data: {
					type: "Defects",
					type_name: id,
					file_name: id,
					content_type: file.type,
				},
				handleResponse: (res) => {
					console.log(res);
					let url = res.data.message.uploadURL;
					axios
						.put(url, file.originFileObj, {
							headers: { "Content-Type": file.type },
						})
						.then((upload_res) => {
							resolve(res.data.message.filepath);
						})
						.catch((err) => reject(err));
				},
				handleError: (err) => reject(err),
			});
		});
	};

	const addDefect = () => {
		defectForm.validateFields().then((values) => {
			setAddingDefect(true);
			apiCall({
				method: "POST",
				url: "/ClientDefect",
				data: { ...values },
				handleResponse: (res) => {
					if (assetImage) {
						uploadfiles(assetImage, res.data.message.id).then((uf_res) => {
							console.log("File Upload Res: ", uf_res);
							apiCall({
								method: "PUT",
								url: "/ClientDefect",
								data: {
									id: res.data.message.id,
									data: { image: uf_res },
								},
								handleResponse: (up_res) => {
									defectAdded(res.data.message.id);
								},
							}).finally(() => {
								setAddingDefect(false);
							});
						});
					} else defectAdded(res.data.message.id);
				},
				handleError: (err) => {
					setAddingDefect(false);
				},
			});
		});
	};

	const defectAdded = (id: any) => {
		apiCall({
			method: "GET",
			url: `/ClientDefect/${id}`,
			handleResponse: (res) => {
				setDefects((curr: any) => [...curr, res.data.message]);
				resetDefectForm();
				setAddingDefect(false);
			},
			handleError: (err) => {
				setAddingDefect(false);
			},
		});
	};

	const defectEdited = (id: any) => {
		apiCall({
			method: "GET",
			url: `/ClientDefect/${id}`,
			handleResponse: (res) => {
				let idx = defects.findIndex((x: any) => x.id === id);
				let _defects = [...defects];
				_defects[idx] = res.data.message;
				setDefects(_defects);
				resetDefectForm();
				setAddingDefect(false);
				closeEditMode();
			},
			handleError: (err) => {
				setAddingDefect(false);
			},
		});
	};

	const resetDefectForm = () => {
		defectForm.resetFields();
		setAssetImage(null);
		setRemoveImageInEdit(false);
	};

	const closeEditMode = () => {
		setEditMode(false);
		defectForm.resetFields();
		setEditingData(null);
		setRemoveImageInEdit(false);
	};

	const editDefect = () => {
		defectForm.validateFields().then((values) => {
			setAddingDefect(true);
			if (!assetImage && removeImageinEdit) values["image"] = null;
			apiCall({
				method: "PUT",
				url: "/ClientDefect",
				data: {
					id: editingData.id,
					data: { ...values },
				},
				handleResponse: (res) => {
					if (assetImage) {
						uploadfiles(assetImage, editingData.id)
							.then((uf_res) => {
								console.log("File Upload Res: ", uf_res);
								apiCall({
									method: "PUT",
									url: "/ClientDefect",
									data: {
										id: editingData.id,
										data: { image: uf_res },
									},
									handleResponse: (up_res) => {
										defectEdited(editingData.id);
									},
								});
							})
							.finally(() => {
								setAddingDefect(false);
							});
					} else defectEdited(editingData.id);
				},
				handleError: (err) => {
					setAddingDefect(false);
				},
			});
		});
	};

	const createNotification = () => {
		let responseData;
		form
			.validateFields()
			.then((values) => {
				if (notificationType === "Corrective") {
					let defect_ids = defects.map((x: any) => x.id);
					responseData = {
						...values,
						type: notificationType,
						status: "OPEN",
						procedure_ids: defect_ids,
					};
				} else {
					responseData = {
						...values,
						type: notificationType,
						status: "OPEN",
					};
				}
				delete responseData["building_id"];
				console.log("Received values of form: ", responseData);
				setConfirmLoading(true);
				apiCall({
					method: "POST",
					url: "/clientnotifications",
					data: responseData,
					handleResponse: (res) => {
						setConfirmLoading(false);
						fetchData();
						goHome();
					},
					handleError: (err) => {
						setConfirmLoading(false);
					},
				});
			})
			.catch((info) => {
				console.log("Validate Failed:", info);
			});
	};

	const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
		console.log("selectedRowKeys changed: ", newSelectedRowKeys);
		setSelectedRowKeys(newSelectedRowKeys);
	};

	const rowSelection = {
		selectedRowKeys,
		onChange: onSelectChange,
	};

	const addExistingDefects = () => {
		setAddingED(true);
		let allDetails = selectedRowKeys.map(
			(id: any) =>
				new Promise<any>((resolve, reject) => {
					apiCall({
						method: "GET",
						url: `/ClientDefect/${id}`,
						handleResponse: (res) => resolve(res.data.message),
						handleError: (err) => reject(err),
					});
				})
		);

		Promise.all(allDetails)
			.then((res: any) => {
				setDefects((curr: any) => [...curr, ...res]);
				console.log([...defects, ...res]);
				closeExistingDefectsModal();
				setSelectedRowKeys([]);
			})
			.finally(() => setAddingED(false));
	};

	return (
		<div>
			<Card
				style={{ width: "100%" }}
				title={
					<Space>
						<Tooltip title="Go Back">
							<Button
								icon={<ArrowLeftOutlined />}
								shape="circle"
								onClick={showExitModal}
							/>
						</Tooltip>
						<h1>Create a manual Notification</h1>
					</Space>
				}
				tabList={items}
				onTabChange={onTabChange}
				tabBarExtraContent={
					<Space style={{ marginBottom: "8px" }}>
						<Button onClick={showExitModal}>Cancel</Button>
						<Button
							loading={confirmLoading}
							type="primary"
							onClick={createNotification}
						>
							Create Notification
						</Button>
					</Space>
				}
				activeTabKey={notificationType}
				tabProps={{
					size: "small",
				}}
			>
				<Row gutter={12}>
					<Col span={notificationType === "Corrective" ? 16 : 24}>
						<Form
							form={form}
							layout="vertical"
							name="form_in_modal"
							initialValues={{}}
							size="small"
						>
							<Form.Item
								name="building_id"
								label="Select Building"
								rules={[
									{ required: true, message: "Please select a Building" },
								]}
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
										(
											item: { id: object; building_name: string },
											index: number
										) => (
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
									rules={[
										{ required: true, message: "Please select a System" },
									]}
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
												<Select.Option value={item.id}>
													{item.name}
												</Select.Option>
											)
										)}
									</Select>
								</Form.Item>
							) : null}
							{loadingAssets && (
								<h4>
									<LoadingOutlined /> Loading{" "}
									{notificationType === "Corrective" ? "Assets" : "Procedures"}
									...
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
									// <Form.List name="procedure_ids">
									// 	{(fields, { add, remove }) => (
									// 		<>
									// 			<label>Defects:</label>
									// 			{fields.map(({ key, name, ...restField }) => (
									// 				<Row
									// 					key={key}
									// 					// style={{ display: "flex" }}
									// 					// align="baseline"
									// 					gutter={8}
									// 				>
									// 					<Col span={7}>
									// 						<Form.Item
									// 							{...restField}
									// 							name={[name, "asset_id"]}
									// 							rules={[
									// 								{ required: true, message: "Missing Asset" },
									// 							]}
									// 						>
									// 							<Select
									// 								showSearch
									// 								placeholder="Search Asset"
									// 								optionFilterProp="children"
									// 								filterOption={(input, option) =>
									// 									(option!.children as unknown as string)
									// 										.toLowerCase()
									// 										.includes(input)
									// 								}
									// 								filterSort={(optionA, optionB) =>
									// 									(optionA!.children as unknown as string)
									// 										.toLowerCase()
									// 										.localeCompare(
									// 											(
									// 												optionB!.children as unknown as string
									// 											).toLowerCase()
									// 										)
									// 								}
									// 							>
									// 								{assets?.map(
									// 									(
									// 										item: {
									// 											id: number;
									// 											name: string;
									// 											tag: string;
									// 										},
									// 										index: number
									// 									) => (
									// 										<Select.Option
									// 											value={item.id}
									// 										>{`${item.tag} : ${item.name}`}</Select.Option>
									// 									)
									// 								)}
									// 							</Select>
									// 						</Form.Item>
									// 					</Col>
									// 					<Col span={16}>
									// 						<Form.Item
									// 							{...restField}
									// 							name={[name, "description"]}
									// 							rules={[
									// 								{
									// 									required: true,
									// 									message: "Missing Description",
									// 								},
									// 							]}
									// 						>
									// 							<Input placeholder="Description" />
									// 						</Form.Item>
									// 					</Col>
									// 					<Col span={1}>
									// 						<MinusCircleOutlined
									// 							onClick={() => remove(name)}
									// 							style={{ marginTop: "8px" }}
									// 						/>
									// 					</Col>
									// 					<Form.Item
									// 						{...restField}
									// 						name={[name, "status"]}
									// 						rules={[
									// 							{ required: true, message: "Missing Description" },
									// 						]}
									// 						hidden={true}
									// 						initialValue={"Open"}
									// 					/>
									// 				</Row>
									// 			))}
									// 			<Form.Item>
									// 				<Button
									// 					type="dashed"
									// 					onClick={() => add()}
									// 					block
									// 					icon={<PlusOutlined />}
									// 				>
									// 					Add Defects
									// 				</Button>
									// 			</Form.Item>
									// 		</>
									// 	)}
									// </Form.List>
									<>
										<label>Defects:</label>
										<Table
											dataSource={defects}
											columns={defectCols}
											size="small"
											pagination={{ pageSize: 5 }}
										/>
									</>
								) : notificationType === "ITM" ? (
									<Form.Item
										name="procedure_ids"
										label={`Select Procedures`}
										rules={[
											{ required: true, message: "Please select assets" },
										]}
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
														(
															optionB!.children as unknown as string
														).toLowerCase()
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
								<Form.Item
									name="description"
									label="Description"
									rules={[
										{ required: true, message: "Please enter description" },
									]}
								>
									<TextArea rows={4} />
								</Form.Item>
							)}
						</Form>
					</Col>
					<Col span={notificationType === "Corrective" ? 8 : 0}>
						<Card style={{ width: "100%", height: "100%" }} actions={[]}>
							<Row>
								<Title level={5}>{editMode ? "Edit " : "Add a "}Defect:</Title>
							</Row>
							{selectedBuilding && selectedSystem ? (
								!loadingAssets && assets?.length <= 0 ? (
									<Row>
										<Text type="secondary">
											No assets found for this system. Please add assets to this
											system to create notification.
										</Text>
									</Row>
								) : (
									<>
										<Form
											form={defectForm}
											layout="vertical"
											name="form_in_modal"
											initialValues={{}}
											size="small"
										>
											<Form.Item
												name="asset_id"
												label="Select Asset"
												rules={[{ required: true, message: "Select a asset" }]}
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
															item: {
																id: number;
																name: string;
																tag: string;
															},
															index: number
														) => (
															<Select.Option
																value={item.id}
															>{`${item.tag} : ${item.name}`}</Select.Option>
														)
													)}
												</Select>
											</Form.Item>
											<Form.Item
												name="description"
												label="Description"
												rules={[
													{
														required: true,
														message: "Please enter description",
													},
												]}
											>
												<TextArea rows={5} />
											</Form.Item>
										</Form>
										{assetImage ? (
											<Row>
												<Col span={12} offset={6}>
													<div
														style={{ maxWidth: "180px", textAlign: "center" }}
													>
														<img
															src={URL.createObjectURL(
																assetImage.originFileObj
															)}
															height={"100%"}
															width={"100%"}
														/>
														<Button
															icon={<DeleteOutlined />}
															onClick={() => setAssetImage(null)}
															type="default"
															block
														>
															Remove
														</Button>
													</div>
												</Col>
											</Row>
										) : editMode && editingData.url && !removeImageinEdit ? (
											<Row>
												<Col span={12} offset={6}>
													<div
														style={{ maxWidth: "180px", textAlign: "center" }}
													>
														<img
															src={editingData.url}
															height={"100%"}
															width={"100%"}
														/>
														<Button
															icon={<DeleteOutlined />}
															onClick={() => setRemoveImageInEdit(true)}
															type="default"
															block
														>
															Remove
														</Button>
													</div>
												</Col>
											</Row>
										) : (
											<Upload
												showUploadList={false}
												beforeUpload={beforeUpload}
												onChange={(e: any) => {
													console.log(e);
													if (
														e.file.type === "image/jpeg" ||
														e.file.type === "image/png"
													) {
														setAssetImage(e.file);
													}
												}}
												customRequest={dummyRequest}
											>
												<label>Upload Image</label>
												<Button block icon={<UploadOutlined />}>
													Upload
												</Button>
											</Upload>
										)}
										<br />
										<br />
										<Row gutter={8}>
											<Col span={12}>
												<Button
													loading={addingDefect}
													onClick={editMode ? editDefect : addDefect}
													type="primary"
													block
												>
													{editMode ? "Save Changes" : "Add Defect"}
												</Button>
											</Col>
											<Col span={12}>
												<Button
													onClick={editMode ? closeEditMode : resetDefectForm}
													block
												>
													{editMode ? "Cancel" : "Reset"}
												</Button>
											</Col>
										</Row>
										<Divider />

										<Row gutter={6}>
											<Col span={24}>
												<Button
													type="link"
													onClick={openExistingDefectsModal}
													icon={<PlusOutlined />}
													style={{
														whiteSpace: "normal",
														height: "auto",
														marginBottom: "10px",
													}}
												>
													Or Add Existing Defects to this Notification
												</Button>
											</Col>
										</Row>
									</>
								)
							) : (
								<Row>
									<Text type="secondary">
										Please select building and system to add defects to this
										notification.
									</Text>
								</Row>
							)}
						</Card>
					</Col>
				</Row>
			</Card>
			<Modal
				title="Select the Defects you want to add to this notification"
				open={showExistingDefects}
				onCancel={closeExistingDefectsModal}
				onOk={addExistingDefects}
				okText={"Add"}
				confirmLoading={addingED}
			>
				<Table
					rowKey="id"
					size="small"
					rowSelection={rowSelection}
					dataSource={existingDefects.filter(
						(ar: any) => !defects.find((rm: any) => rm.id === ar.id)
					)}
					columns={[
						{
							title: "Defective Asset",
							dataIndex: "id",
							ellipsis: true,
							render: (id: any, row: any) => `${row.tag} : ${row.name}`,
						},
						{
							title: "Description",
							dataIndex: "description",
							ellipsis: true,
						},
					]}
				/>
			</Modal>
			<Modal
				open={exitModalOpen}
				onOk={handleExitOk}
				onCancel={handleExitCancel}
			>
				<Title level={5}>
					{defects.length > 0
						? "Are you sure you want to exit without creating Notification ?"
						: "Are you sure you want to discard all the changes made and exit ?"}
				</Title>
				<Text type="secondary">
					{defects.length > 0
						? `You have added ${
								defects.length === 1
									? "a new defect"
									: `${defects.length} new defects`
						  }.`
						: ""}
				</Text>
			</Modal>
		</div>
	);
};

export default AddNotification;
