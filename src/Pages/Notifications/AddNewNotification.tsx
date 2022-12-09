import { Button, Form, Input, message, Modal, Select } from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { FC, useState, useContext } from "react";
import { SuperUserContext } from "../../Helpers/Context";
import { apiCall } from "../../axiosConfig";
import { AxiosError, AxiosResponse } from "axios";
import Schedule from "./Schedule";

interface props {
	fetchData: Function;
	buildingNames: any;
}

const itm_options = [
	{
		label: "Inspection",
		value: "Inspection",
	},
	{
		label: "Testing",
		value: "Testing",
	},
	{
		label: "Maintenance",
		value: "Maintenance",
	},
];

interface CollectionCreateFormProps {
	visible: boolean;
	confirmLoading: boolean;
	onCreate: (values: any) => Promise<AxiosResponse | AxiosError>;
	onCancel: () => void;
	buildingNames: any;
	fetchdata: Function;
}

const CollectionCreateForm: FC<CollectionCreateFormProps> = ({
	visible,
	confirmLoading,
	onCreate,
	onCancel,
	buildingNames,
	fetchdata,
}) => {
	const [form] = Form.useForm();
	const contextVariables = useContext(SuperUserContext);
	const [showAsset, setShowAsset] = useState(false);
	const [assets, setAssets] = useState([]);
	const [loadingContracts, setLoadingContracts] = useState(false);
	const [showContracts, setShowContracts] = useState(false);
	const [contracts, setContracts] = useState<any>([]);
	const [systems, setSystems] = useState<any>([]);
	const [showSystems, setShowSystems] = useState(false);
	const [record, setRecord] = useState<any>({});

	const handleITMChange = (value: any) => {
		console.log(value);
	};

	return (
		<Modal
			visible={visible}
			title="Add a new WorkOrder"
			okText="Create Notification"
			cancelText="Cancel"
			onCancel={() => {
				form.resetFields();
				onCancel();
			}}
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
		>
			<Form
				form={form}
				layout="vertical"
				name="form_in_modal"
				initialValues={{ type: "Corrective Maintanance" }}
				// onValuesChange={(cv, av) => {
				// 	let fire_protection_systems = av.systems?.map((system: any) => {
				// 		return { system };
				// 	});
				// 	let newSys = {
				// 		...av,
				// 		fire_protection_systems,
				// 		notification_type: av.itm.join("") || "",
				// 	};
				// 	setRecord(newSys);
				// }}
			>
				<Form.Item
					name="type"
					label="Type"
					rules={[
						{
							required: true,
							message: "Please input the name of client!",
						},
					]}
				>
					<Select>
						<Select.Option value="Corrective Maintanance">
							Corrective Maintanance
						</Select.Option>
					</Select>
				</Form.Item>
				<Form.Item
					name="building_id"
					label="Select Building"
					rules={[
						{
							required: true,
							message: "Please input the name of client!",
						},
					]}
				>
					<Select
						onSelect={(value: any) => {
							setLoadingContracts(true);
							apiCall({
								method: "GET",
								url: `assets/getContractforBldg?id=${value}`,
								// handleResponse: (res) => {
								// 	console.log("wo assets: ", res);
								// 	let new_assets = res.data.message;
								// 	console.log(res.data.message);

								// 	new_assets = new_assets.map((asset: any) => {
								// 		return { label: asset.device, value: asset.asset_id };
								// 	});
								// 	console.log(new_assets);
								// 	setAssets(new_assets);
								// 	setShowAsset(true);
								// },
								handleResponse: (res) => {
									let new_contracts = res.data.message;
									console.log(new_contracts);
									new_contracts = new_contracts.map((asset: any) => {
										return { label: asset.contract_number, value: asset.id };
									});
									apiCall({
										method: "GET",
										url: `assets/getSystemsforContract?id=${
											new_contracts[0].value ? new_contracts[0].value : "0"
										}`,
										handleResponse: (res) => {
											console.log(res);
											let systems = res.data.message || [];
											systems = systems.map((system: any) => {
												return { label: system.name, value: system.id };
											});
											setSystems(systems);
											setContracts(new_contracts);
											setShowContracts(true);
											setShowSystems(true);
											setLoadingContracts(false);
										},
									});
								},
							});
						}}
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
							<Select.Option value={bldg.id}>
								{bldg.building_name}
							</Select.Option>
						))}
					</Select>
				</Form.Item>
				{loadingContracts ? (
					<>
						<LoadingOutlined /> Loading details...
					</>
				) : null}
				{showContracts ? (
					<>
						<Form.Item
							name="contract_id"
							label="Select Contract"
							rules={[
								{
									required: true,
									message: "Please Select a Contract!",
								},
							]}
						>
							<Select
								style={{ width: "100%" }}
								placeholder="Select Contract"
								// defaultValue={contracts[0].value}
								// onChange={handleITMChange}
								options={contracts}
							/>
						</Form.Item>
					</>
				) : null}
				{showSystems ? (
					<>
						<Form.Item
							name="systems"
							label="Select Systems"
							rules={[
								{
									required: true,
									message: "Please input the name of client!",
								},
							]}
						>
							<Select
								// mode="multiple"
								allowClear
								style={{ width: "100%" }}
								placeholder="Select Systems"
								// defaultValue={[]}
								// onChange={handleITMChange}
								options={systems}
							/>
						</Form.Item>
						<Form.Item
							name="itm"
							label="Activity"
							rules={[
								{
									required: true,
									message: "Select Activity",
								},
							]}
						>
							<Select
								// mode="multiple"
								allowClear
								style={{ width: "100%" }}
								placeholder="Select Activity"
								// defaultValue={[]}
								// onChange={handleITMChange}
								options={itm_options}
							/>
						</Form.Item>
						<Form.Item
							name="reason"
							label="Description"
							rules={[
								{
									required: true,
									message: "Please give your reason",
								},
							]}
						>
							<Input />
						</Form.Item>
					</>
				) : null}
				{/* {showAsset ? (
					<>
						<Form.Item
							name="asset"
							label="Select Asset"
							rules={[
								{
									required: true,
									message: "Please input the name of client!",
								},
							]}
						>
							<Select
								// mode="multiple"
								// allowClear
								style={{ width: "100%" }}
								placeholder="Select Assets"
								// defaultValue={[]}
								// onChange={handleITMChange}
								options={assets}
							/>
						</Form.Item>
						<Form.Item
							name="itm"
							label="Activity"
							rules={[
								{
									required: true,
									message: "Please input the name of client!",
								},
							]}
						>
							<Select
								mode="multiple"
								allowClear
								style={{ width: "100%" }}
								placeholder="Please Select Activity or Activities"
								defaultValue={[]}
								onChange={handleITMChange}
								options={itm_options}
							/>
						</Form.Item>
						<Form.Item
							name="reason"
							label="Description"
							rules={[
								{
									required: true,
									message: "Please input the name of client!",
								},
							]}
						>
							<Input />
						</Form.Item>
					</>
				) : null} */}
			</Form>
		</Modal>
	);
};

const AddNewNotification: FC<props> = ({ fetchData, buildingNames }: props) => {
	const [visible, setVisible] = useState(false);
	const [confirmLoading, setConfirmLoading] = useState(false);

	const info = (clientId: string) => {
		Modal.info({
			title: "Client Successfully Added",
			content: (
				<div>
					<p>Log in to the following url using admin credentials:</p>
					<p>
						<a href={`http://${clientId}.localhost:3000/`}>
							www.{clientId}.ignis.com
						</a>
					</p>
				</div>
			),
			onOk() {},
		});
	};

	const onCreate = (values: any) => {
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			console.log("Received values of form: ", values);
			setConfirmLoading(true);
			// console.log("notoficaitopm: ", values);
			apiCall({
				method: "POST",
				url: "/notifications",
				data: { notification: values },
				handleResponse: (res) => {
					resolve(res);
					setConfirmLoading(false);
					// info(values.clientId);
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
				Create Notification
			</Button>
			<CollectionCreateForm
				buildingNames={buildingNames}
				visible={visible}
				onCreate={onCreate}
				onCancel={() => {
					setVisible(false);
				}}
				confirmLoading={confirmLoading}
				fetchdata={fetchData}
			/>
		</div>
	);
};

export default AddNewNotification;
