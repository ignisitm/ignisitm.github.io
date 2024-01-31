import { useState, FC, useEffect } from "react";
import type { DatePickerProps } from "antd";
import { Form, Row, Col, Select, Input, Button, DatePicker, Tag } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { apiCall } from "../../axiosConfig";
const { Option } = Select;

interface props {
	nextFunc: Function;
	prevFunc: Function;
	contractType: any;
	setContractDetails: Function;
	systems: any;
	contractDetails: any;
	buildings: any;
}

const statusColors = {
	ACTIVE: "green",
	INACTIVE: "darkorange",
	INVALID: "",
	EXPIRED: "red",
};

const AddContract: FC<props> = ({
	nextFunc,
	prevFunc,
	contractType,
	setContractDetails,
	systems,
	contractDetails,
	buildings,
}) => {
	const [fromDate, setFromDate] = useState<any>(
		contractDetails.from_date || null
	);
	const [toDate, setToDate] = useState<any>(contractDetails.to_date || null);
	const [status, setStatus] = useState<string>(
		contractDetails.status || "Invalid"
	);

	const onFinish = (values: any) => {
		console.log(values);
		values["status"] = status;
		nextFunc();
		setContractDetails(values);
	};

	const onChangeFrom: DatePickerProps["onChange"] = (
		date: any,
		dateString: any
	) => {
		console.log(date, dateString);
		setFromDate(date);
	};

	const onChangeTo: DatePickerProps["onChange"] = (
		date: any,
		dateString: any
	) => {
		console.log(date, dateString);
		setToDate(date);
	};

	const handleChangeBuildings = (value: string[]) => {
		console.log(`selected ${value}`);
	};

	const getStatus = () => {
		let curr_date = new Date();
		if (fromDate && toDate && toDate > fromDate) {
			if (curr_date > fromDate && curr_date < toDate) setStatus("ACTIVE");
			if (curr_date > toDate) setStatus("EXPIRED");
			if (curr_date < fromDate) setStatus("INACTIVE");
		} else setStatus("INVALID");
	};

	useEffect(() => {
		getStatus();
	}, [fromDate, toDate]);

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
				<Col md={8} xs={24} style={{ paddingRight: "10px" }}>
					<Form.Item
						label="Contract Number"
						name="id"
						rules={[
							{
								required: true,
								message: "Please enter the Contract No.",
							},
						]}
					>
						<Input />
					</Form.Item>
				</Col>
				<Col md={8} xs={24} style={{ paddingRight: "10px" }}>
					<Form.Item
						label="Contract Type"
						name="type"
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

				<Col md={8} xs={24} style={{ paddingRight: "10px" }}>
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
				{/* <Col md={6} xs={24}>
					<Form.Item
						label="FM Company"
						name="fm_company"
						rules={[
							{
								required: true,
								message: "Please enter the FM Company",
							},
						]}
					>
						<Input />
					</Form.Item>
				</Col> */}
				<Col md={12} xs={24} style={{ paddingRight: "10px" }}>
					<Form.Item
						label="Title"
						name="title"
						rules={[
							{
								required: true,
								message: "Please enter the Contract title",
							},
						]}
					>
						<Input />
					</Form.Item>
				</Col>
				<Col md={4} xs={24} style={{ paddingRight: "10px" }}>
					<Form.Item
						label="From"
						name="from_date"
						rules={[
							{
								required: true,
								message: "Please enter the From Date",
							},
						]}
					>
						<DatePicker
							format={"DD/MM/YYYY"}
							style={{ width: "100%" }}
							onChange={onChangeFrom}
						/>
					</Form.Item>
				</Col>
				<Col md={4} xs={24} style={{ paddingRight: "10px" }}>
					<Form.Item
						label="To"
						name="to_date"
						rules={[
							{
								required: true,
								message: "Please enter the To Date",
							},
						]}
					>
						<DatePicker
							style={{ width: "100%" }}
							format={"DD/MM/YYYY"}
							onChange={onChangeTo}
						/>
					</Form.Item>
				</Col>
				<Col md={4} xs={24} style={{ paddingTop: "17px", paddingLeft: "5px" }}>
					<p>
						{" "}
						Status :{" "}
						<Tag color={statusColors[status as keyof typeof statusColors]}>
							{status}
						</Tag>
					</p>
				</Col>
			</Row>
			{/* <Row>
				<Col md={24} xs={24} style={{ paddingRight: "10px" }}>
					<Form.Item
						label="Select Buildings"
						name="building_ids"
						rules={[
							{
								required: true,
								message: "Please select the buildings",
							},
						]}
					>
						<Select
							mode="multiple"
							allowClear
							style={{ width: "100%" }}
							placeholder="Please select"
							onChange={handleChangeBuildings}
							options={buildings?.map((building: any) => ({
								label: building.building_name,
								value: building.id,
							}))}
						/>
					</Form.Item>
				</Col>
			</Row> */}
			{/* <h3>Add Systems:</h3>
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
			</Row> */}
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
