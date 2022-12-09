import { useState, useRef, useEffect } from "react";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import {
	Form,
	Row,
	Col,
	Select,
	Input,
	Button,
	Table,
	Modal,
	InputRef,
	Space,
} from "antd";
import { apiCall } from "../../axiosConfig";
import DeviceTable from "./DeviceTable";

const { Option } = Select;
let index = 0;

const Systems = () => {
	const [form] = Form.useForm();
	const [name, setName] = useState("");
	const [systems, setSystems] = useState<Array<{ id: number; name: string }>>(
		[]
	);
	const [system, setSystem] = useState<number>(0);
	const [loadingSystems, setLoadingSystems] = useState(false);
	const inputRef = useRef<InputRef>(null);

	useEffect(() => {
		getSystems();
	}, []);

	const getSystems = () => {
		setLoadingSystems(true);
		apiCall({
			method: "GET",
			url: "/assets/systems",
			handleResponse: (res) => {
				setSystems(res.data.message);
				setLoadingSystems(false);
			},
			handleError: (err) => {
				setLoadingSystems(false);
			},
		});
	};

	const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setName(event.target.value);
	};

	const addItem = (e: React.MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault();
		setSystems([
			...systems,
			{
				id: systems.length + 1,
				name: name || `New System ${index++}`,
			},
		]);
		setName("");
		setTimeout(() => {
			inputRef.current?.focus();
		}, 0);
	};

	const onFinishFailed = (errorInfo: any) => {
		console.log("Failed:", errorInfo);
	};

	return (
		<div>
			<Form
				form={form}
				onFinishFailed={onFinishFailed}
				autoComplete="off"
				size="small"
				onValuesChange={(changedValues, av) => {
					console.log(changedValues);
					if (changedValues.system) {
						console.log(changedValues.system);
						setSystem(changedValues.system);
					}
				}}
			>
				<Row>
					<Col span={12}>
						<Form.Item
							name="system"
							label="Select System"
							style={{ display: "inline-block" }}
							rules={[
								{
									required: true,
									message: "Missing System",
								},
							]}
						>
							<Select
								style={{ width: 300, display: "inline-block" }}
								placeholder="Select System"
								dropdownRender={(menu) => {
									return (
										<>
											{menu}
											<Space style={{ padding: "0 8px 4px" }}>
												<Input
													placeholder="Please enter System"
													ref={inputRef}
													value={name}
													onChange={onNameChange}
												/>
												<Button
													type="text"
													icon={<PlusOutlined />}
													onClick={addItem}
												>
													Add System
												</Button>
											</Space>
										</>
									);
								}}
							>
								{systems.map((item: { id: number; name: string }) => (
									<Option key={item.id} value={item.id}>
										{item.name}
									</Option>
								))}
							</Select>
						</Form.Item>
						<div style={{ marginLeft: "10px", display: "inline-block" }}>
							{loadingSystems && <LoadingOutlined />}
						</div>
					</Col>
				</Row>
			</Form>
			{system ? (
				<DeviceTable sys_id={system} />
			) : (
				<div style={{ width: "100%", textAlign: "center" }}>
					<h3>Select a System</h3>
				</div>
			)}
		</div>
	);
};

export default Systems;
