import {
	Button,
	Checkbox,
	Col,
	Divider,
	Form,
	Input,
	message,
	Modal,
	Row,
	Select,
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
	const contextVariables = useContext(SuperUserContext);

	return (
		<Modal
			visible={visible}
			title="Add a new System"
			okText="Add System"
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
			<Form form={form} layout="vertical" name="form_in_modal">
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
				<Divider type="horizontal" orientation="left">
					<h5>General Information</h5>
				</Divider>
				<Form.List name="general_information">
					{(fields, { add, remove }) => (
						<PropertiesFields fields={fields} add={add} remove={remove} />
					)}
				</Form.List>
			</Form>
		</Modal>
	);
};

const PropertiesFields: FC<any> = ({ fields, add, remove }) => {
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
								{/* <Select.Option value="condition">Condition</Select.Option> */}
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
					{/* <Col span={24}> */}
					{/* <Form.Item
						noStyle
						shouldUpdate={(prevValues, currentValues) =>
							prevValues.general_information[name]?.type !==
							currentValues.general_information[name]?.type
						}
					>
						{({ getFieldValue }) =>
							getFieldValue(["general_information", name, "type"]) ===
							"condition" ? (
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
												{getFieldValue("general_information").map((row: any) =>
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
												prevValues.general_information[name]?.condition !==
												currentValues.general_information[name]?.condition
											}
										>
											{({ getFieldValue }) =>
												getFieldValue([
													"general_information",
													name,
													"condition",
												]) &&
												(getFieldValue([
													"general_information",
													name,
													"condition",
												]) === "in_between" ||
													getFieldValue([
														"general_information",
														name,
														"condition",
													]) === "not_between") ? (
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
															{getFieldValue("general_information").map(
																(row: any) =>
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
											title="Define atleast one numerical field before adding a condition"
										>
											<QuestionCircleOutlined className="form-item-icons" />
										</Tooltip>
									</Col>
								</>
							) : null
						}
					</Form.Item> */}
					{/* </Col> */}
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

const AddNewSystem: FC<props> = ({ fetchData }: props) => {
	const [visible, setVisible] = useState(false);
	const [confirmLoading, setConfirmLoading] = useState(false);

	const onCreate = (values: any) => {
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			console.log("Received values of form: ", values);
			setConfirmLoading(true);
			apiCall({
				method: "POST",
				url: "/systemmaster",
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
