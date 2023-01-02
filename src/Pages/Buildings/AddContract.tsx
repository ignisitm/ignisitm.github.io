import { useState, FC, useEffect } from "react";
import { Form, Row, Col, Select, Input, Button } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
const { Option } = Select;

interface props {
	nextFunc: Function;
	prevFunc: Function;
	contractType: any;
	setContractDetails: Function;
	systems: any;
	contractDetails: any;
}

const AddContract: FC<props> = ({
	nextFunc,
	prevFunc,
	contractType,
	setContractDetails,
	systems,
	contractDetails,
}) => {
	const onFinish = (values: any) => {
		console.log(values);
		nextFunc();
		setContractDetails(values);
	};

	useEffect(() => {
		console.log(contractType);
	}, []);

	return (
		<Form
			size="small"
			preserve={false}
			autoComplete="off"
			onFinish={onFinish}
			labelCol={{ span: 24, style: { paddingTop: 3 } }}
			wrapperCol={{ span: 24 }}
			onValuesChange={(changedValues, allValues) => {}}
			initialValues={contractDetails}
		>
			<Row>
				<Col md={6} xs={24} style={{ paddingRight: "10px" }}>
					<Form.Item
						label="Contract Number"
						name="contract_number"
						rules={[
							{
								// required: props.requiredFields.contract_number,
								message: "Please enter the Contract No.",
							},
						]}
					>
						<Input />
					</Form.Item>
				</Col>
				<Col md={6} xs={24} style={{ paddingRight: "10px" }}>
					<Form.Item
						label="Contract Type"
						name="contract_type"
						rules={[
							{
								required: true,
								message: "Please select Contract type",
							},
						]}
					>
						<Select>
							{contractType.map((item: any) => (
								<Option value={item.id}>{item.value}</Option>
							))}
						</Select>
					</Form.Item>
				</Col>

				<Col md={8} xs={18} style={{ paddingRight: "10px" }}>
					<Form.Item
						label="Total Contract Value"
						name="total_contract_value"
						rules={[
							{
								required: true,
								message: "Please enter the Total Contract Value",
							},
						]}
					>
						<Input />
					</Form.Item>
				</Col>
				<Col md={4} xs={6}>
					<Form.Item name="currency" label="." rules={[{ required: false }]}>
						<Select defaultValue="QAR">
							<Option value={0}>INR</Option>
							<Option value={1}>QAR</Option>
						</Select>
					</Form.Item>
				</Col>
			</Row>
			<h3>Add Systems:</h3>
			<Row>
				<Col span={24}>
					<Form.List name="fire_protection_systems">
						{(fields, { add, remove }) => (
							<>
								{fields.map(({ key, name, ...restField }) => (
									<Row>
										<Col span={12}>
											<Form.Item
												{...restField}
												name={[name, "system"]}
												rules={[{ required: true, message: "Missing System" }]}
											>
												<Select placeholder="System">
													{systems.map(
														(option: { id: number; name: string }) => (
															<Option value={option.id}>{option.name}</Option>
														)
													)}
												</Select>
											</Form.Item>
										</Col>
										<Col span={10} style={{ paddingLeft: "10px" }}>
											<Form.Item
												{...restField}
												name={[name, "frequency"]}
												rules={[
													{ required: true, message: "Missing Frequency" },
												]}
											>
												<Select placeholder="frequency">
													<Select.Option value="Daily">Daily</Select.Option>
													<Select.Option value="Weekly">Weekly</Select.Option>
													<Select.Option value="Every 2 weeks">
														Every 2 weeks
													</Select.Option>
													<Select.Option value="Monthly">Monthly</Select.Option>
													<Select.Option value="Quarterly">
														Quarterly
													</Select.Option>
													<Select.Option value="SemiAnnually">
														SemiAnnually
													</Select.Option>
													<Select.Option value="Annually">
														Annually
													</Select.Option>
													<Select.Option value="Every 2 years">
														Every 2 years
													</Select.Option>
													<Select.Option value="Every 5 years">
														Every 5 years
													</Select.Option>
													<Select.Option value="Every 10 years">
														Every 10 years
													</Select.Option>
													<Select.Option value="Others">Others</Select.Option>
												</Select>
											</Form.Item>
										</Col>
										<Col span={2} style={{ paddingLeft: "10px" }}>
											<MinusCircleOutlined onClick={() => remove(name)} />
										</Col>
									</Row>
								))}
								<Form.Item>
									<Button
										type="dashed"
										onClick={() => add()}
										block
										icon={<PlusOutlined />}
									>
										Add System
									</Button>
								</Form.Item>
							</>
						)}
					</Form.List>
				</Col>
			</Row>
			<Row>
				<Col md={6} xs={0} style={{ paddingLeft: "10px" }} />
				<Col md={6} xs={6} style={{ paddingLeft: "10px" }}>
					<Button size="middle" block type="default" onClick={() => prevFunc()}>
						Back
					</Button>
				</Col>
				<Col md={6} xs={6} style={{ paddingLeft: "10px" }}>
					<Button size="middle" block type="primary" htmlType="submit">
						Next
					</Button>
				</Col>
				<Col md={6} xs={0} style={{ paddingLeft: "10px" }} />
			</Row>
		</Form>
	);
};

export default AddContract;
