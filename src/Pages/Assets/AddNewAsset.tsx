import {
	Button,
	Card,
	Checkbox,
	Col,
	DatePicker,
	Divider,
	Form,
	Input,
	InputNumber,
	message,
	Modal,
	Row,
	Select,
	Tabs,
	Typography,
	Upload,
} from "antd";
import {
	DeleteOutlined,
	LeftCircleOutlined,
	LeftOutlined,
	LoadingOutlined,
	PlusOutlined,
	RightCircleOutlined,
	RightOutlined,
	UploadOutlined,
} from "@ant-design/icons";
import { FC, useState, useContext, useEffect } from "react";
import { AssetContext, NotificationContext } from "../../Helpers/Context";
import { apiCall } from "../../axiosConfig";
import axios, { AxiosError, AxiosResponse } from "axios";
import { RcFile } from "antd/es/upload";
import { CSVLink, CSVDownload } from "react-csv";
import CSVUploader from "./CSVUploader";
const { TextArea } = Input;

interface props {
	fetchData: Function;
}

interface CollectionCreateFormProps {
	visible: boolean;
	confirmLoading: boolean;
	onCreate: (
		values: any,
		multi: boolean,
		systemTag: string
	) => Promise<AxiosResponse | AxiosError>;
	onCancel: () => void;
}

const CollectionCreateForm: FC<CollectionCreateFormProps> = ({
	visible,
	confirmLoading,
	onCreate,
	onCancel,
}) => {
	const [form] = Form.useForm();
	const contextVariables = useContext(AssetContext);
	const [assetDetails, setAssetDetails] = useState<Array<any>>([]);
	const [selectedBuilding, setSelectedBuilding] = useState<any>(null);
	const [selectedSystem, setSelectedSystem] = useState<any>(null);
	const [selectedAssetType, setSelectedAssetType] = useState<any>(null);
	const [loadingSystems, setLoadingSystems] = useState(false);
	const [systems, setSystems] = useState<any[]>([]);
	const [loadingDeviceTypes, setLoadingDeviceTypes] = useState(false);
	const [deviceTypes, setDeviceTypes] = useState<any[]>([]);
	const [loadingGeneralInfo, setLoadingGeneralInfo] = useState(false);
	const [generalInfo, setGeneralInfo] = useState<any[]>([]);
	const [assetImage, setAssetImage] = useState<any>(null);
	const [showCommonFieldsModal, setShowCommonFieldsModal] = useState(false);
	const [commonFieldsSelected, setCommonFieldsSelected] = useState(false);
	const [assetQty, setAssetQty] = useState<number>();
	const [assetPage, setAssetPage] = useState<number>(0);
	const [entryType, setEntryType] = useState<string>("single");
	const [frequency, setFrequency] = useState<any>(null);
	const [showNFPAError, setShowNFPAError] = useState(false);
	const [systemTag, setSystemTag] = useState("/");
	const [commonFields, setCommonFields] = useState<any>({
		frequency: false,
		last_service: false,
	});

	useEffect(() => {
		if (selectedBuilding) getSystems(selectedBuilding);
		else {
			setSelectedBuilding(null);
			setSystemTag("/");
			setSelectedSystem(null);
			setSelectedAssetType(null);
			setSystems([]);
			setDeviceTypes([]);
			setGeneralInfo([]);
			form.setFieldValue("system_id", null);
			form.setFieldValue("type_id", null);
		}
	}, [selectedBuilding]);

	useEffect(() => {
		if (selectedSystem) getDeviceTypes(selectedSystem);
		else {
			setSelectedSystem(null);
			setSystemTag("/");
			setSelectedAssetType(null);
			setDeviceTypes([]);
			setGeneralInfo([]);
			form.setFieldValue("type_id", null);
		}
	}, [selectedSystem]);

	useEffect(() => {
		if (selectedAssetType) {
			getGeneralInfo(selectedAssetType);
			if (entryType === "multiple") setShowCommonFieldsModal(true);
		} else {
			setSelectedSystem(null);
			setSystemTag("/");
			setSelectedAssetType(null);
			generalInfo.map((info: any) => form.setFieldValue(info.name, null));
			setGeneralInfo([]);
		}
	}, [selectedAssetType]);

	const dummyRequest = ({ file, onSuccess }: any) => {
		setTimeout(() => {
			onSuccess("ok");
		}, 0);
	};

	const beforeUpload = (file: RcFile) => {
		const isJpgOrPng =
			file.type === "image/jpeg" || file.type === "image/png";
		if (!isJpgOrPng) {
			message.error("You can only upload JPEG/PNG file!");
		}
		const isLt2M = file.size / 1024 / 1024 < 20;
		if (!isLt2M) {
			message.error("Image must be smaller than 20MB!");
		}
		return isJpgOrPng && isLt2M;
	};

	const resetModal = () => {
		form.resetFields();
		setSelectedBuilding(null);
		setSelectedSystem(null);
		setSelectedAssetType(null);
		setSystems([]);
		setSystemTag("/");
		setDeviceTypes([]);
		setGeneralInfo([]);
		setAssetImage(null);
		setAssetQty(0);
		setAssetPage(0);
		setEntryType("single");
		setCommonFieldsSelected(false);
		setCommonFields({});
		setAssetDetails([]);
	};

	const getSystems = (building_id: any) => {
		setLoadingSystems(true);
		apiCall({
			method: "GET",
			url: `/dropdown/systems?building_id=${building_id}`,
			handleResponse: (res) => {
				console.log(res);
				setSystems(res.data.message);
				setLoadingSystems(false);
			},
			handleError: () => setLoadingSystems(false),
		});
	};

	const getDeviceTypes = (system_id: any) => {
		setLoadingDeviceTypes(true);
		apiCall({
			method: "GET",
			url: `/dropdown/devicetypes?system_id=${system_id}`,
			handleResponse: (res) => {
				console.log(res);
				setDeviceTypes(res.data.message);
				setLoadingDeviceTypes(false);
			},
			handleError: () => setLoadingDeviceTypes(false),
		});
	};

	const getGeneralInfo = (asset_type: any) => {
		setLoadingGeneralInfo(true);
		apiCall({
			method: "GET",
			url: `/dropdown/devicefields?id=${asset_type}`,
			handleResponse: (res) => {
				console.log(res);
				setGeneralInfo(res.data.message.general_fields);
				let new_fields: any = {};
				res.data.message.general_fields?.map((field: any) => {
					new_fields[field.name] = false;
				});
				setCommonFields((curr: any) => ({ ...curr, ...new_fields }));
				setLoadingGeneralInfo(false);
			},
			handleError: () => setLoadingGeneralInfo(false),
		});
	};

	const onChangeEntryType = (e: any) => {
		resetModal();
		setEntryType(e);
	};

	const onClickNextPage = (direction: string) => {
		let curr_assetDetails: Array<any> = assetDetails;
		curr_assetDetails[assetPage] = form.getFieldsValue();
		setAssetDetails(curr_assetDetails);
		let next_asset =
			curr_assetDetails[
				direction === "prev" ? assetPage - 1 : assetPage + 1
			];
		if (next_asset) {
			form.setFieldsValue(next_asset);
			if (next_asset.frequency !== frequency) setShowNFPAError(true);
			else setShowNFPAError(false);
		} else {
			console.log(commonFields);
			Object.keys(commonFields)
				.filter((x) => commonFields[x] === false)
				.map((field: any) => {
					form.setFieldValue(field, "");
				});
			form.setFieldValue("tag", "");
			form.setFieldValue("frequency", frequency);
			setShowNFPAError(false);
		}
	};

	const SingleEntry = () => (
		<Row align="middle" justify="space-around">
			<Col
				span={8}
				style={{
					textAlign: "center",
					marginTop: "20px",
					paddingRight: "15px",
				}}
			>
				{assetImage ? (
					<>
						<img
							src={URL.createObjectURL(assetImage.originFileObj)}
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
					</>
				) : (
					<Upload
						listType="picture-card"
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
						<div>
							<PlusOutlined />
							<div style={{ marginTop: 8 }}>
								Upload
								<br />
								Image
							</div>
						</div>
					</Upload>
				)}
			</Col>
			<Col span={16}>
				<Form
					form={form}
					layout="vertical"
					name="form_in_modal"
					initialValues={{ modifier: "public" }}
				>
					<Form.Item
						name="building_id"
						label="Select Building"
						rules={[
							{
								required: true,
								message: "Please select a Building",
							},
						]}
					>
						<Select
							showSearch
							allowClear={true}
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
										(
											optionB!
												.children as unknown as string
										).toLowerCase()
									)
							}
						>
							{contextVariables.buildings?.map(
								(
									item: { id: number; building_name: string },
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
								{
									required: true,
									message: "Please select a System",
								},
							]}
						>
							<Select
								showSearch
								allowClear={true}
								onChange={(e) => {
									setSelectedSystem(e);
									let tag = systems?.find(
										(x: any) => x.id === e
									).tag;
									setSystemTag(`${tag}/`);
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
											(
												optionB!
													.children as unknown as string
											).toLowerCase()
										)
								}
							>
								{systems?.map(
									(
										item: { id: object; name: string },
										index: number
									) => (
										<Select.Option value={item.id}>
											{item.name}
										</Select.Option>
									)
								)}
							</Select>
						</Form.Item>
					) : null}
					{loadingDeviceTypes && (
						<h4>
							<LoadingOutlined /> Loading Asset Types...
						</h4>
					)}
					{deviceTypes.length > 0 ? (
						<Form.Item
							name="type_id"
							label="Select Asset Type"
							rules={[
								{
									required: true,
									message: "Please select asset type",
								},
							]}
						>
							<Select
								showSearch
								allowClear={true}
								placeholder="Search to Select"
								onChange={(e) => {
									setSelectedAssetType(e);
									form.setFieldValue(
										"frequency",
										deviceTypes.find((o) => o.id === e)
											.frequency
									);
									setFrequency(
										deviceTypes.find((o) => o.id === e)
											.frequency
									);
								}}
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
												optionB!
													.children as unknown as string
											).toLowerCase()
										)
								}
							>
								{deviceTypes?.map(
									(
										item: { id: object; name: string },
										index: number
									) => (
										<Select.Option value={item.id}>
											{item.name}
										</Select.Option>
									)
								)}
							</Select>
						</Form.Item>
					) : null}
					{selectedAssetType && (
						<>
							<Form.Item
								name="tag"
								label="Asset Tag"
								rules={[
									{
										required: true,
										message:
											"Please input the tag of Asset!",
									},
								]}
							>
								<Input prefix={systemTag} />
							</Form.Item>
						</>
					)}
					{loadingGeneralInfo && (
						<h4>
							<LoadingOutlined /> Loading General Fields...
						</h4>
					)}

					{generalInfo.length > 0
						? generalInfo.map((field: any) => (
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
										<InputNumber
											style={{ width: "100%" }}
										/>
									) : field.type === "text" ? (
										<Input />
									) : field.type === "boolean" ? (
										<Select>
											<Select.Option value={true}>
												YES
											</Select.Option>
											<Select.Option value={false}>
												NO
											</Select.Option>
										</Select>
									) : null}
								</Form.Item>
						  ))
						: null}
				</Form>
			</Col>
		</Row>
	);

	const MultipleEntry = () => (
		<Form
			form={form}
			layout="vertical"
			name="form_in_modal"
			initialValues={{ modifier: "public" }}
		>
			<Row>
				<Col span={24}>
					{" "}
					<Form.Item
						name="building_id"
						label="Select Building"
						rules={[
							{
								required: true,
								message: "Please select a Building",
							},
						]}
					>
						<Select
							showSearch
							allowClear={true}
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
										(
											optionB!
												.children as unknown as string
										).toLowerCase()
									)
							}
						>
							{contextVariables.buildings?.map(
								(
									item: { id: number; building_name: string },
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
								{
									required: true,
									message: "Please select a System",
								},
							]}
						>
							<Select
								showSearch
								allowClear={true}
								onChange={(e) => {
									setSelectedSystem(e);
									let tag = systems?.find(
										(x: any) => x.id === e
									).tag;
									setSystemTag(`${tag}/`);
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
											(
												optionB!
													.children as unknown as string
											).toLowerCase()
										)
								}
							>
								{systems?.map(
									(
										item: { id: object; name: string },
										index: number
									) => (
										<Select.Option value={item.id}>
											{item.name}
										</Select.Option>
									)
								)}
							</Select>
						</Form.Item>
					) : null}
					{loadingDeviceTypes && (
						<h4>
							<LoadingOutlined /> Loading Asset Types...
						</h4>
					)}
					{deviceTypes.length > 0 ? (
						<>
							<Form.Item
								name="type_id"
								label="Select Asset Type"
								rules={[
									{
										required: true,
										message: "Please select asset type",
									},
								]}
							>
								<Select
									showSearch
									allowClear={true}
									placeholder="Search to Select"
									onChange={(e) => {
										setSelectedAssetType(e);
										// form.setFieldValue(
										// 	"frequency",
										// 	deviceTypes.find((o) => o.id === e).frequency
										// );
										// setFrequency(deviceTypes.find((o) => o.id === e).frequency);
									}}
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
													optionB!
														.children as unknown as string
												).toLowerCase()
											)
									}
								>
									{deviceTypes?.map(
										(
											item: { id: object; name: string },
											index: number
										) => (
											<Select.Option value={item.id}>
												{item.name}
											</Select.Option>
										)
									)}
								</Select>
							</Form.Item>
							{showCommonFields(true)}
						</>
					) : null}
				</Col>
			</Row>

			{commonFieldsSelected && (
				<>
					<Divider orientation="right" orientationMargin="0">
						<Button
							type="link"
							onClick={() => setShowCommonFieldsModal(true)}
						>
							Modify Common Fields
						</Button>
					</Divider>
					<h3>
						Asset # {assetPage + 1} / {assetQty}
					</h3>

					<Row align="middle" justify="space-around">
						<Col
							span={2}
							style={{
								textAlign: "center",
								fontSize: "28px",
							}}
						>
							<Button
								disabled={assetPage === 0}
								shape="circle"
								icon={<LeftOutlined />}
								onClick={() => {
									onClickNextPage("prev");
									setAssetPage((curr) => curr - 1);
								}}
							/>
						</Col>
						{/* <Col
							span={6}
							style={{
								textAlign: "center",
								marginTop: "20px",
								paddingRight: "15px",
							}}
						>
							{assetImage ? (
								<>
									<img
										src={URL.createObjectURL(assetImage.originFileObj)}
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
								</>
							) : (
								<Upload
									listType="picture-card"
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
									<div>
										<PlusOutlined />
										<div style={{ marginTop: 8 }}>
											Upload
											<br />
											Image
										</div>
									</div>
								</Upload>
							)}
						</Col> */}
						<Col span={20}>
							{selectedAssetType && (
								<>
									<Form.Item
										name="tag"
										label="Asset Tag"
										rules={[
											{
												required: true,
												message:
													"Please input the tag of Asset!",
											},
										]}
									>
										<Input prefix={systemTag} />
									</Form.Item>
								</>
							)}
							{loadingGeneralInfo && (
								<h4>
									<LoadingOutlined /> Loading General
									Fields...
								</h4>
							)}
							{showCommonFields(false)}
						</Col>
						<Col
							span={2}
							style={{
								textAlign: "center",
								fontSize: "28px",
							}}
						>
							<Button
								disabled={assetPage + 1 === assetQty}
								shape="circle"
								icon={<RightOutlined />}
								onClick={() => {
									onClickNextPage("next");
									setAssetPage((curr) => curr + 1);
								}}
							/>
						</Col>
					</Row>
				</>
			)}
		</Form>
	);

	const ModifyCommonFieldForAllAssets = (field: string, value: any) => {
		if (commonFields[field]) {
			let curr_assets = assetDetails;
			curr_assets.forEach((asset) => {
				if (Object.keys(asset).includes(field)) asset[field] = value;
			});
			setAssetDetails(curr_assets);
		}
	};

	const showCommonFields = (val: boolean) => {
		return (
			<>
				{/* {commonFields["frequency"] === val && (
					<>
						<Form.Item
							label="Frequency"
							name="frequency"
							rules={[
								{
									required: true,
									message: "Please enter the Frequency",
								},
							]}
						>
							<Select
								onChange={(e) => {
									if (e !== frequency) setShowNFPAError(true);
									else setShowNFPAError(false);
									ModifyCommonFieldForAllAssets("frequency", e);
								}}
							>
								{contextVariables.frequency?.map(
									(item: { id: number; name: string }, index: number) => (
										<Select.Option value={item.id}>{item.name}</Select.Option>
									)
								)}
							</Select>
						</Form.Item>
						{showNFPAError ? (
							<Typography.Text className="nfpa-overriding" type="danger">
								You are overriding NFPA Frequency
							</Typography.Text>
						) : null}
					</>
				)}
				{commonFields["last_service"] === val && (
					<Form.Item
						label="Last Service Date"
						name="last_service"
						rules={[
							{
								required: true,
								message: "Please enter the Last Service Date",
							},
						]}
					>
						<DatePicker
							onChange={(e) => ModifyCommonFieldForAllAssets("last_service", e)}
							format={"DD/MM/YYYY"}
							style={{ width: "100%" }}
						/>
					</Form.Item>
				)} */}

				{generalInfo.length > 0
					? generalInfo.map((field: any) =>
							commonFields[field.name] === val ? (
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
										<InputNumber
											style={{ width: "100%" }}
											onBlur={(e) =>
												ModifyCommonFieldForAllAssets(
													field.name,
													e.target.value
												)
											}
										/>
									) : field.type === "text" ? (
										<Input
											onBlur={(e) =>
												ModifyCommonFieldForAllAssets(
													field.name,
													e.target.value
												)
											}
										/>
									) : field.type === "boolean" ? (
										<Select
											onBlur={(e) =>
												ModifyCommonFieldForAllAssets(
													field.name,
													e
												)
											}
										>
											<Select.Option value={true}>
												YES
											</Select.Option>
											<Select.Option value={false}>
												NO
											</Select.Option>
										</Select>
									) : null}
								</Form.Item>
							) : null
					  )
					: null}
			</>
		);
	};

	const onChangeCommonFields = (e: any) => {
		console.log("checked = ", e.target.value);
		setCommonFields((curr: any) => ({
			...curr,
			[e.target.value]: !curr[e.target.value],
		}));
	};

	const handleChangeQty = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { value: inputValue } = e.target;
		const reg = /^-?\d*(\.\d*)?$/;
		if (reg.test(inputValue) || inputValue === "") {
			setAssetQty(parseInt(inputValue) || 0);
		}
	};

	const validateMultipleEntry = (assetDetails: any) => {
		let mandatory_fields = [
			// "last_service",
			"building_id",
			"system_id",
			"type_id",
			"tag",
			// "frequency",
			...generalInfo
				.filter((x) => x.mandatory === true)
				.map((x) => x.name),
		];
		return new Promise((resolve, reject) => {
			if (assetDetails.length !== assetQty)
				reject(`No. of assets added are less than ${assetQty}`);
			else {
				let failed_assets: Array<string> = [];
				assetDetails.forEach((asset: any, index: number) => {
					let allMandatoryFieldsExists = mandatory_fields.every(
						(field) => asset[field]
					);
					if (!allMandatoryFieldsExists)
						failed_assets.push((index + 1).toString());
				});
				console.log(failed_assets.length);
				if (failed_assets.length !== 0)
					reject(
						`There are missing asset details for the following assets: ${failed_assets}`
					);
				else resolve(assetDetails);
			}
		});
	};

	return (
		<>
			<Modal
				// title="Select Common Fields"
				zIndex={1001}
				open={showCommonFieldsModal}
				closable={false}
				style={{ top: "20px" }}
				maskClosable={false}
				onCancel={() => {
					setShowCommonFieldsModal(false);
					setCommonFieldsSelected(true);
				}}
				footer={
					<Button
						disabled={assetQty === 0}
						onClick={() => {
							setShowCommonFieldsModal(false);
							setCommonFieldsSelected(true);
						}}
						type="primary"
					>
						Done
					</Button>
				}
			>
				<h4>Select Common Fields: </h4>
				{loadingGeneralInfo ? (
					<h4>
						Loading... <LoadingOutlined />
					</h4>
				) : (
					<Row>
						<Col span={11}>
							<Checkbox
								className="selected-building"
								disabled={true}
								checked={true}
							>
								Building
							</Checkbox>
						</Col>
						<Col span={11}>
							<Checkbox
								className="selected-building"
								disabled={true}
								checked={true}
							>
								System
							</Checkbox>
						</Col>
						<Col span={11}>
							<Checkbox
								className="selected-building"
								disabled={true}
								checked={true}
							>
								Asset Type
							</Checkbox>
						</Col>
						{Object.keys(commonFields).map((field) => (
							<Col span={11}>
								<Checkbox
									onChange={onChangeCommonFields}
									checked={commonFields[field]}
									value={field}
								>
									{field}
								</Checkbox>
							</Col>
						))}
					</Row>
				)}
				<Divider />
				<h4>Enter No. of Assets: </h4>
				<Input
					value={assetQty ? assetQty : ""}
					onChange={handleChangeQty}
				/>
				<div style={{ width: "100%", textAlign: "center" }}>
					<h4>OR</h4>
				</div>
				<h4>Import from CSV File: </h4>
				<Card style={{ width: "100%" }}>
					<CSVUploader
						onChange={(data) => {
							console.log(data);
							if (data.length > 1) {
								let uploaded_data: Array<any> = [];
								let i, j;
								let formData = form.getFieldsValue();
								for (i = 1; i < data.length; i++) {
									let new_obj: any = {};
									for (j = 0; j < data[0].length; j++) {
										let header_value = data[0][j]
											.trim()
											.replace(/(\r\n|\n|\r)/gm, "");
										let column_value =
											data[i]?.[j]
												?.trim()
												.replace(
													/(\r\n|\n|\r)/gm,
													""
												) || null;
										new_obj[
											header_value === "Asset tag"
												? "tag"
												: header_value
										] = column_value || null;
									}
									if (new_obj.tag)
										uploaded_data.push({
											...formData,
											...new_obj,
										});
								}
								console.log(uploaded_data);
								setAssetQty(uploaded_data.length);
								setAssetDetails(uploaded_data);
								setCommonFieldsSelected(true);
								setShowCommonFieldsModal(false);
								form.setFieldsValue(uploaded_data[0]);
							} else {
								message.error("No data in the file.");
							}
						}}
					/>
					<CSVLink
						style={{ float: "right" }}
						filename={`ASSETS_${new Date()
							.toISOString()
							.slice(0, 10)
							.replace(/-/g, "")}.csv`}
						data={[
							[
								"Asset tag",
								...Object.keys(commonFields).filter(
									(x) => commonFields[x] === false
								),
							],
						]}
					>
						Download CSV Template
					</CSVLink>
					<br /> <br />
					<div>
						<Typography.Text italic type="danger">
							Download the CSV Template and fill the columns
							(Non-Common Fields) and upload it here.
						</Typography.Text>
					</div>
				</Card>
			</Modal>
			<Modal
				open={visible}
				title="Add a new Asset"
				okText="Add Asset"
				maskClosable={false}
				destroyOnClose={true}
				cancelText="Cancel"
				style={{
					maxWidth: "850px",
					maxHeight: "500px",
					height: "80%",
					top: "20px",
				}}
				bodyStyle={{ height: "100%" }}
				width={"95%"}
				onCancel={() => {
					resetModal();
					onCancel();
				}}
				onOk={() => {
					if (entryType === "single") {
						form.validateFields()
							.then((values) => {
								values["image"] = assetImage;
								values["tag"] = systemTag + values["tag"];
								onCreate(values, false, systemTag).then(() => {
									resetModal();
								});
							})
							.catch((info) => {
								console.log("Validate Failed:", info);
							});
					} else {
						let curr_assetDetails: Array<any> = assetDetails;
						curr_assetDetails[assetPage] = form.getFieldsValue();
						validateMultipleEntry(curr_assetDetails)
							.then(() => {
								setAssetDetails(curr_assetDetails);
								onCreate(
									curr_assetDetails,
									true,
									systemTag
								).then(() => {
									resetModal();
								});
							})
							.catch((err) => message.error(err));
					}
				}}
				confirmLoading={confirmLoading}
			>
				<Tabs
					defaultActiveKey="1"
					destroyInactiveTabPane={true}
					items={[
						{
							key: "single",
							label: "Single Entry",
							children: <SingleEntry />,
						},
						{
							key: "multiple",
							label: "Multiple Entries",
							children: <MultipleEntry />,
						},
					]}
					onChange={onChangeEntryType}
				/>
			</Modal>
		</>
	);
};

const AddNewAsset: FC<props> = ({ fetchData }: props) => {
	const [visible, setVisible] = useState(false);
	const [confirmLoading, setConfirmLoading] = useState(false);

	const uploadfiles = (file: any, id: number) => {
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			apiCall({
				method: "PUT",
				url: "/fileupload",
				data: {
					type: "Assets",
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

	const onCreate = (
		values: any,
		multi: boolean = false,
		systemTag: string
	) => {
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			if (!multi) {
				let GeneralInfoData = { ...values };
				let { system_id, type_id, tag, image }: any = {
					...GeneralInfoData,
				};
				delete GeneralInfoData["building_id"];
				delete GeneralInfoData["system_id"];
				delete GeneralInfoData["type_id"];
				delete GeneralInfoData["tag"];
				delete GeneralInfoData["image"];

				let responseData = {
					system_id,
					type_id,
					tag,
					// next_service: last_service.add(frequency, "days").toISOString(),
					general_info: GeneralInfoData,
				};
				console.log("Received values of form: ", responseData);
				setConfirmLoading(true);
				apiCall({
					method: "POST",
					url: "/clientassets",
					data: responseData,
					handleResponse: (res) => {
						console.log(res.data.message);
						if (image)
							uploadfiles(image, res.data.message.id).then(
								(uf_res) => {
									console.log("File Upload Res: ", uf_res);
									apiCall({
										method: "PUT",
										url: "/clientassets",
										data: {
											id: res.data.message.id,
											data: { image: uf_res },
										},
										handleResponse: (up_res) => {
											resolve(res);
											setConfirmLoading(false);
											setVisible(false);
											fetchData();
										},
									});
								}
							);
						else {
							resolve(res);
							setConfirmLoading(false);
							setVisible(false);
							fetchData();
						}
					},
					handleError: (err) => {
						reject(err);
						setConfirmLoading(false);
					},
				});
			} else {
				const test = false;
				if (test) {
					console.log(values);
				} else {
					let finalAssetList: Array<any> = [];
					values.forEach((value: any) => {
						let GeneralInfoData = { ...value };
						let { system_id, type_id, tag }: any = {
							...GeneralInfoData,
						};
						delete GeneralInfoData["building_id"];
						delete GeneralInfoData["system_id"];
						delete GeneralInfoData["type_id"];
						delete GeneralInfoData["frequency"];
						delete GeneralInfoData["last_service"];
						delete GeneralInfoData["tag"];
						delete GeneralInfoData["image"];

						let responseData = {
							system_id,
							type_id,
							// frequency,
							tag: `${systemTag}${tag}`,
							// next_service: last_service.add(frequency, "days").toISOString(),
							general_info: GeneralInfoData,
						};
						finalAssetList.push(responseData);
					});
					console.log("Received values of form: ", finalAssetList);
					setConfirmLoading(true);
					apiCall({
						method: "POST",
						url: "/clientMassUpdate",
						data: finalAssetList,
						handleResponse: (res) => {
							console.log(res.data.message);
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
				}
			}
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
				Add Asset
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

export default AddNewAsset;
