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
	Table,
	Tooltip,
	Typography,
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

const { Text } = Typography;

interface props {
	fetchData: Function;
	type?: string;
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
			className="add-modal"
			width={"100%"}
			style={{ maxWidth: "800px", top: "20px" }}
			maskClosable={false}
			destroyOnClose={true}
			open={visible}
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
			<Form preserve={false} form={form} layout="vertical" name="form_in_modal">
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
					<Col span={14}>
						<Form.Item
							{...restField}
							name={[name, "name"]}
							rules={[{ required: true, message: "Missing Field" }]}
						>
							<Input placeholder="Field name" />
						</Form.Item>
					</Col>
					<Col span={4} style={{ paddingLeft: "10px" }}>
						<Form.Item
							{...restField}
							name={[name, "type"]}
							rules={[{ required: true, message: "Missing Type" }]}
						>
							<Select placeholder="Field Type">
								<Select.Option value="text">Text</Select.Option>
								<Select.Option value="number">Number</Select.Option>
								<Select.Option value="longtext">Long Text</Select.Option>
								<Select.Option value="dropdown">Dropdown</Select.Option>
								{/* <Select.Option value="condition">Condition</Select.Option> */}
								{/* <Select.Option value="boolean">Yes / No</Select.Option> */}
							</Select>
						</Form.Item>
					</Col>
					<Col span={3} style={{ paddingLeft: "10px" }}>
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
					<Col span={1} style={{ paddingLeft: "10px" }}>
						<MinusCircleOutlined
							className="form-item-icons"
							onClick={() => remove(name)}
						/>
					</Col>
					<Col span={24}>
						<Form.Item
							noStyle
							shouldUpdate={(prevValues, currentValues) =>
								prevValues.general_information[name]?.type !==
								currentValues.general_information[name]?.type
							}
						>
							{({ getFieldValue }) =>
								getFieldValue(["general_information", name, "type"]) ===
								"dropdown" ? (
									<Row>
										<Col style={{ paddingLeft: "35px" }}>{"-"}</Col>
										<Col span={18} style={{ paddingLeft: "8px" }}>
											<Form.Item
												{...restField}
												name={[name, "data"]}
												rules={[
													{
														required: true,
														message: "No options added for dropdown",
													},
												]}
												noStyle
											>
												<Select
													mode="tags"
													placeholder="Insert Dropdown Options"
													tokenSeparators={[","]}
													dropdownStyle={{ display: "none" }}
													style={{ width: "100%" }}
													suffixIcon={<></>}
												>
													{" "}
												</Select>
											</Form.Item>
											<Text type="secondary" italic>
												Use Comma(,) to separate values.
											</Text>
											<Form.Item
												{...restField}
												name={[name, "others"]}
												rules={[
													{
														required: true,
														message: "No options added for dropdown",
													},
												]}
												valuePropName="checked"
												initialValue={false}
											>
												<Checkbox>
													Include 'Others' in dropdown options
												</Checkbox>
											</Form.Item>
										</Col>
										<Col span={2} style={{ paddingLeft: "10px" }}>
											<Tooltip
												placement="right"
												title={
													<div style={{ margin: "10px" }}>
														If the dropdown options are:
														<br />
														Fire
														<br />
														Water
														<br />
														Air
														<br />
														<br />
														Then it has to be entered Like:
														<br />
														<Text style={{ color: "white" }} keyboard>
															Fire, Water, Air
														</Text>
													</div>
												}
											>
												<QuestionCircleOutlined className="form-item-icons" />
											</Tooltip>
										</Col>
									</Row>
								) : null
							}
						</Form.Item>
					</Col>
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

const AddNewSystem: FC<props> = ({ fetchData, type }: props) => {
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
			{type === "normal_small" ? (
				<Button
					style={{ marginTop: "5px" }}
					size="small"
					icon={<PlusOutlined />}
					onClick={() => {
						setVisible(true);
					}}
					type="primary"
				>
					Add a System Type
				</Button>
			) : (
				<Button
					block
					size="small"
					icon={<PlusOutlined />}
					onClick={() => {
						setVisible(true);
					}}
					type="default"
				>
					Add a System Type
				</Button>
			)}

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
