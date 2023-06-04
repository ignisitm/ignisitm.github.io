import {
	Button,
	Checkbox,
	Col,
	Form,
	Input,
	message,
	Modal,
	Row,
	Select,
	Space,
	Tabs,
	Tooltip,
} from "antd";
import {
	MinusCircleOutlined,
	PlusOutlined,
	QuestionCircleOutlined,
} from "@ant-design/icons";
import { FC, useState, useContext, Fragment } from "react";
import { SuperUserContext } from "../../../Helpers/Context";
import { apiCall } from "../../../axiosConfig";
import { AxiosError, AxiosResponse } from "axios";

interface props {
	fetchData: Function;
	systems: any[];
}

interface CollectionCreateFormProps {
	visible: boolean;
	confirmLoading: boolean;
	systems: any[];
	onCreate: (values: any) => Promise<AxiosResponse | AxiosError>;
	onCancel: () => void;
}

const PropertiesFields: FC<any> = ({ fields, add, remove, parent_name }) => {
	return (
		<Row>
			{fields.map(({ key, name, ...restField }: any, index: number) => (
				<Fragment key={key}>
					<Col className="field-list-number" span={1}>
						{index + 1}
					</Col>
					<Col span={8}>
						<Form.Item
							{...restField}
							name={[name, "name"]}
							rules={[{ required: true, message: "Missing Field" }]}
						>
							<Input placeholder="Field name" />
						</Form.Item>
					</Col>
					<Col span={6} style={{ paddingLeft: "10px" }}>
						<Form.Item
							{...restField}
							name={[name, "type"]}
							rules={[{ required: true, message: "Missing Type" }]}
						>
							<Select placeholder="Field Type">
								<Select.Option value="text">Text</Select.Option>
								<Select.Option value="number">Number</Select.Option>
								{parent_name !== "general_fields" ? (
									<Select.Option value="condition">Condition</Select.Option>
								) : null}
								<Select.Option value="boolean">Yes / No</Select.Option>
							</Select>
						</Form.Item>
					</Col>
					<Col span={6} style={{ paddingLeft: "10px" }}>
						<Form.Item
							{...restField}
							name={[name, "mandatory"]}
							rules={[{ required: true, message: "Enter a value" }]}
							valuePropName="checked"
							initialValue={false}
						>
							{/* <Select
								className="selected-building"
								placeholder="Optional/Required"
							>
								<Select.Option value={1}>Required</Select.Option>
								<Select.Option value={0}>Optional</Select.Option>
							</Select> */}
							<Checkbox>Required</Checkbox>
						</Form.Item>
					</Col>
					<Col span={2} style={{ paddingLeft: "10px" }}>
						<MinusCircleOutlined
							className="form-item-icons"
							onClick={() => remove(name)}
						/>
					</Col>
					<Form.Item
						noStyle
						shouldUpdate={(prevValues, currentValues) =>
							prevValues[parent_name][name]?.type !==
							currentValues[parent_name][name]?.type
						}
					>
						{({ getFieldValue }) =>
							getFieldValue([parent_name, name, "type"]) === "condition" ? (
								<>
									<Col style={{ paddingLeft: "35px" }}>{"-"}</Col>
									<Col span={7} style={{ paddingLeft: "8px" }}>
										<Form.Item
											{...restField}
											name={[name, "condition"]}
											rules={[{ required: true, message: "Missing Field" }]}
										>
											<Select
												className="selected-building"
												placeholder="Condition"
											>
												<Select.Option value="in_between">
													In Between
												</Select.Option>
												<Select.Option value="not_between">
													Not Between
												</Select.Option>
												<Select.Option value="equals_to">
													Equals To
												</Select.Option>
												<Select.Option value="not_equals_to">
													Not Equals To
												</Select.Option>
												<Select.Option value="greater_than">
													Greater Than
												</Select.Option>
												<Select.Option value="lesser_than">
													Lesser Than
												</Select.Option>
											</Select>
										</Form.Item>
									</Col>
									<Col span={6} style={{ paddingLeft: "10px" }}>
										<Form.Item
											{...restField}
											name={[name, "value_1"]}
											rules={[{ required: true, message: "Missing Field" }]}
										>
											<Select
												className="selected-building"
												placeholder="Value 1"
											>
												{getFieldValue("general_fields").map((row: any) =>
													row?.type && row?.type === "number" ? (
														<Select.Option value={row.name}>
															{row.name}
														</Select.Option>
													) : null
												)}
											</Select>
										</Form.Item>
									</Col>
									<Col span={6} style={{ paddingLeft: "10px" }}>
										<Form.Item
											noStyle
											shouldUpdate={(prevValues, currentValues) =>
												prevValues[parent_name][name]?.condition !==
												currentValues[parent_name][name]?.condition
											}
										>
											{({ getFieldValue }) =>
												getFieldValue([parent_name, name, "condition"]) &&
												(getFieldValue([parent_name, name, "condition"]) ===
													"in_between" ||
													getFieldValue([parent_name, name, "condition"]) ===
														"not_between") ? (
													<Form.Item
														{...restField}
														name={[name, "value_2"]}
														rules={[
															{ required: true, message: "Missing Field" },
														]}
													>
														<Select
															className="selected-building"
															placeholder="Value 2"
														>
															{getFieldValue("general_fields").map((row: any) =>
																row?.type && row?.type === "number" ? (
																	<Select.Option value={row.name}>
																		{row.name}
																	</Select.Option>
																) : null
															)}
														</Select>
													</Form.Item>
												) : null
											}
										</Form.Item>
									</Col>
									<Col span={2} style={{ paddingLeft: "10px" }}>
										<Tooltip
											placement="right"
											title="Define atleast one numerical field before adding a condition in General Fields Section"
										>
											<QuestionCircleOutlined className="form-item-icons" />
										</Tooltip>
									</Col>
								</>
							) : null
						}
					</Form.Item>
				</Fragment>
			))}
			<Col span={24}>
				<Form.Item>
					<Button
						type="dashed"
						onClick={() => add()}
						block
						icon={<PlusOutlined />}
					>
						Add field
					</Button>
				</Form.Item>
			</Col>
		</Row>
	);
};

const GeneralProperties: FC = () => {
	const parent_name = "general_fields";
	return (
		<Form.List name={parent_name}>
			{(fields, { add, remove }) => (
				<PropertiesFields
					fields={fields}
					add={add}
					remove={remove}
					parent_name={parent_name}
				/>
			)}
		</Form.List>
	);
};

const InspectionProperties: FC = () => {
	const parent_name = "inspection_fields";
	return (
		<Form.List name={parent_name}>
			{(fields, { add, remove }) => (
				<PropertiesFields
					fields={fields}
					add={add}
					remove={remove}
					parent_name={parent_name}
				/>
			)}
		</Form.List>
	);
};

const TestingProperties: FC = () => {
	const parent_name = "testing_fields";
	return (
		<Form.List name={parent_name}>
			{(fields, { add, remove }) => (
				<PropertiesFields
					fields={fields}
					add={add}
					remove={remove}
					parent_name={parent_name}
				/>
			)}
		</Form.List>
	);
};

const MaintenanceProperties: FC = () => {
	const parent_name = "maintenance_fields";
	return (
		<Form.List name={parent_name}>
			{(fields, { add, remove }) => (
				<PropertiesFields
					fields={fields}
					add={add}
					remove={remove}
					parent_name={parent_name}
				/>
			)}
		</Form.List>
	);
};

const CollectionCreateForm: FC<CollectionCreateFormProps> = ({
	visible,
	confirmLoading,
	systems,
	onCreate,
	onCancel,
}) => {
	const [form] = Form.useForm();
	const contextVariables = useContext(SuperUserContext);

	return (
		<Modal
			visible={visible}
			title="Add a new Device"
			okText="Add Device"
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
				onFinish={() => {
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
			>
				<Form.Item
					name="name"
					label="Device Name"
					rules={[
						{
							required: true,
							message: "Please input the name of Device!",
						},
					]}
				>
					<Input />
				</Form.Item>
				<Form.Item
					name="systemid"
					label="Select System"
					rules={[
						{
							required: true,
							message: "Please select the system!",
						},
					]}
				>
					<Select
						showSearch
						placeholder="Search to Select"
						optionFilterProp="children"
						filterOption={(input, option) =>
							(option?.label ?? "").toLowerCase().includes(input)
						}
						filterSort={(optionA, optionB) =>
							(optionA?.label ?? "")
								.toLowerCase()
								.localeCompare((optionB?.label ?? "").toLowerCase())
						}
						options={systems.map((x: any) => ({ label: x.name, value: x.id }))}
					/>
				</Form.Item>
				<label>Fields: </label>
				<Tabs
					style={{ marginTop: "10px" }}
					type="card"
					items={[
						{
							key: "1",
							label: "General",
							children: <GeneralProperties />,
						},
						{
							key: "2",
							label: "Inspection",
							children: <InspectionProperties />,
						},
						{
							key: "3",
							label: "Testing",
							children: <TestingProperties />,
						},
						{
							key: "4",
							label: "Maintenance",
							children: <MaintenanceProperties />,
						},
					]}
				/>
			</Form>
		</Modal>
	);
};

const AddNewDevice: FC<props> = ({ fetchData, systems }: props) => {
	const [visible, setVisible] = useState(false);
	const [confirmLoading, setConfirmLoading] = useState(false);

	const onCreate = (values: any) => {
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			console.log("Received values of form: ", values);
			setConfirmLoading(true);
			// values["itm_fields"] = {
			// 	inspection: values.inspection_fields,
			// 	testing: values.testing_fields,
			// 	maintenance: values.maintenance_fields,
			// };
			// delete values.inspection_fields;
			// delete values.testing_fields;
			// delete values.maintenance_fields;
			apiCall({
				method: "POST",
				url: "/devicemaster",
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
				type="primary"
			>
				Add Device
			</Button>
			<CollectionCreateForm
				systems={systems}
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

export default AddNewDevice;
