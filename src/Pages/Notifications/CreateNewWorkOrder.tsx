import {
	Button,
	Card,
	Checkbox,
	DatePicker,
	Form,
	Input,
	List,
	message,
	Modal,
	Row,
	Select,
	Space,
	Tree,
	TreeDataNode,
	TreeProps,
} from "antd";
import {
	AudioFilled,
	DeleteOutlined,
	FileDoneOutlined,
} from "@ant-design/icons";
import { FC, useState, useContext, useEffect, useRef } from "react";
import { NotificationContext } from "../../Helpers/Context";
import { apiCall } from "../../axiosConfig";
import { AxiosError, AxiosResponse } from "axios";
import { AudioRecorder, useAudioRecorder } from "react-audio-voice-recorder";
import { getUser } from "../../Auth/Auth";
import { createFromIconfontCN } from "@ant-design/icons";
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const treeData: TreeDataNode[] = [
	{
		title: "parent 1",
		key: "0-0",
		children: [
			{
				title: "parent 1-0",
				key: "0-0-0",
				disabled: true,
				children: [
					{
						title: "leaf",
						key: "0-0-0-0",
						disableCheckbox: true,
					},
					{
						title: "leaf",
						key: "0-0-0-1",
					},
				],
			},
			{
				title: "parent 1-1",
				key: "0-0-1",
				children: [
					{
						title: <span style={{ color: "#1677ff" }}>sss</span>,
						key: "0-0-1-0",
					},
				],
			},
		],
	},
];

interface props {
	fetchData: Function;
	notification_id: number;
	pending_procedures: Array<number>;
}

interface CollectionCreateFormProps {
	notification_id: number;
	visible: boolean;
	confirmLoading: boolean;
	onCreate: (values: any) => Promise<AxiosResponse | AxiosError>;
	onCancel: () => void;
}

const CollectionCreateForm: FC<CollectionCreateFormProps> = ({
	visible,
	confirmLoading,
	notification_id,
	onCreate,
	onCancel,
}) => {
	const user = getUser();
	const [form] = Form.useForm();
	const contextVariables = useContext(NotificationContext);
	const [startDate, setStartDate] = useState<any>(null);
	const [endDate, setEndDate] = useState<any>(null);
	const [loadingResources, setLoadingResources] = useState(false);
	const [leadExecutors, setLeadExecutors] = useState(
		contextVariables.leadExecutors
	);
	const [equipments, setEquipments] = useState(contextVariables.resources);
	const [employees, setEmployees] = useState(contextVariables.employees);
	const [voiceNote, setVoiceNote] = useState<any>(null);
	const [newMessage, setNewMessage] = useState("");
	const mssgsBottom = useRef<HTMLDivElement>(null);
	const [onlyAvailableResources, setOnlyAvailableResources] = useState(false);
	const [cancelRecording, setCancelRecording] = useState(false);
	const [assets, setAssets] = useState<any[]>([]);
	const [loadingAssets, setLoadingAssets] = useState(false);
	const [selectedAssets, setSelectedAssets] = useState<any[]>([]);
	const [procedures, setProcedures] = useState<any[]>([]);
	const [remarks, setRemarks] = useState<any[]>([
		// {
		// 	username: "0009",
		// 	type: "message",
		// 	content:
		// 		"Work Order new create test message Work Order new create test message Work Order new create test message Work Order new create test message Work Order new create test message",
		// 	time: "2023-07-14T10:26:32.270Z",
		// },
		// {
		// 	username: "New-admin",
		// 	type: "message",
		// 	content: "Noted and Prcededd",
		// 	time: "2023-07-22T10:26:36.270Z",
		// },
	]);
	const {
		startRecording,
		stopRecording,
		togglePauseResume,
		recordingBlob,
		isRecording,
		isPaused,
		recordingTime,
		mediaRecorder,
	} = useAudioRecorder();

	const getAssets = () => {
		setLoadingAssets(true);
		apiCall({
			method: "GET",
			url: `/clientnotifications/${notification_id}`,
			handleResponse: (res) => {
				console.log("assets : ", notification_id, res.data.message.procedures);

				let response = res.data.message.procedures;
				setProcedures(response);

				//get all rows that have unique asset_id, remove duplicate asset_id rows
				let uniqueAssets = response.filter(
					(v: any, i: any, a: any) =>
						a.findIndex((t: any) => t.asset_id === v.asset_id) === i
				);

				console.log(uniqueAssets);

				// there is location_name for each unique asset. i want to convert the unique assets to a tree structure where location_name is the parent and asset_name is the child
				let treeData: any = [];
				uniqueAssets.forEach((asset: any) => {
					let locationIndex = treeData.findIndex(
						(e: any) => e.title === asset.location_name
					);
					if (locationIndex === -1) {
						treeData.push({
							title: asset.location_name,
							key: asset.location_name,
							children: [
								{
									title: `${asset.device} - ${asset.tag}`,
									key: asset.asset_id,
								},
							],
						});
					} else {
						treeData[locationIndex].children.push({
							title: `${asset.device} - ${asset.tag}`,
							key: asset.asset_id,
						});
					}
				});

				setAssets(treeData);
				setLoadingAssets(false);
			},
			handleError: () => {
				setLoadingAssets(false);
			},
		});
	};

	useEffect(() => {
		getAssets();
	}, []);

	useEffect(() => {
		if (!recordingBlob) return;
		console.log(recordingBlob);
		// recordingBlob will be present at this point after 'stopRecording' has been called
		if (!cancelRecording) {
			const url = URL.createObjectURL(recordingBlob);
			let content = (
				<audio controls>
					<source src={url} type={recordingBlob.type}></source>
				</audio>
			);
			submitChat(content);
		} else setCancelRecording(false);
	}, [recordingBlob]);

	useEffect(() => {
		scrollToBottom();
	}, [remarks]);

	useEffect(() => {
		if (startDate && endDate && onlyAvailableResources) loadResources();
		else resetResources();
	}, [onlyAvailableResources]);

	const submitChat = (content: any = newMessage) => {
		setRemarks((e) => [
			...e,
			{
				createdby: user.username,
				type: content !== newMessage ? "Voice" : "Text",
				message: content,
			},
		]);
		console.log({
			createdby: user.username,
			type: content !== newMessage ? "Voice" : "Text",
			message: content,
		});
		setNewMessage("");
	};

	const saveVoiceNote = (e: any) => {
		console.log(e);
		let voice_note = new File([e], "VoiceNote.webm", {
			type: e.type,
			lastModified: new Date().getTime(),
		});
		console.log(voice_note);
	};

	const resetResources = () => {
		setLeadExecutors(contextVariables.leadExecutors);
		setEmployees(contextVariables.employees);
		setEquipments(contextVariables.resources);
	};

	const loadResources = (start: any = startDate, end: any = endDate) => {
		setLoadingResources(true);
		let promises = [getLEs(start, end), getResources(start, end)];
		Promise.all(promises).then(() => {
			setLoadingResources(false);
		});
	};

	const getLEs = (start: any = startDate, end: any = endDate) => {
		apiCall({
			method: "GET",
			url: `/dropdown/leadexecutor?start=${start}&end=${end}`,
			handleResponse: (res) => {
				console.log(res);
				setLeadExecutors(res.data.message);
			},
		});
	};

	const getResources = (start: any = startDate, end: any = endDate) => {
		apiCall({
			method: "GET",
			url: `/dropdown/resources?start=${start}&end=${end}`,
			handleResponse: (res) => {
				console.log(res);
				setEmployees(res.data.message.employees);
				setEquipments(res.data.message.resources);
			},
		});
	};

	const onDateChange = (value: any) => {
		let start = value?.[0]?.toISOString();
		let end = value?.[1]?.toISOString();
		console.log("Start: ", start);
		console.log("End: ", end);
		if (value?.[0]) setStartDate(start);
		else setStartDate(null);
		if (value?.[1]) {
			setEndDate(end);
			if (onlyAvailableResources) loadResources(start, end);
			else resetResources();
		} else setEndDate(null);
	};

	const scrollToBottom = () => {
		mssgsBottom.current?.scrollIntoView({ behavior: "smooth" });
	};

	const onSelect: TreeProps["onSelect"] = (selectedKeys, info) => {
		console.log("selected", selectedKeys, info);
	};

	const onCheck: TreeProps["onCheck"] = (checkedKeys, info) => {
		// sel_assets will be all numbers in checkedKeys.
		let sel_assets = Array.isArray(checkedKeys)
			? checkedKeys.filter((e) => !isNaN(parseInt(e as string)))
			: checkedKeys.checked.filter((e) => !isNaN(parseInt(e as string)));
		console.log("checked", sel_assets, info);
		setSelectedAssets(sel_assets);
	};

	return (
		<Modal
			open={visible}
			title="Create Work Order"
			okText="Create"
			maskClosable={false}
			style={{ top: "20px" }}
			cancelText="Cancel"
			onCancel={() => {
				form.resetFields();
				onCancel();
				setRemarks([]);
				setStartDate(null);
				setEndDate(null);
			}}
			onOk={() => {
				if (selectedAssets.length === 0) {
					message.error("Please select atleast one asset");
					return;
				}

				form
					.validateFields()
					.then((values) => {
						values["wo_start"] = startDate;
						values["wo_end"] = endDate;
						values["status"] = "Pending";
						values["assets"] = selectedAssets;
						values["procedures"] = procedures;

						onCreate(values).then((res) => {
							console.log(res);
							let ress: any = res;
							if (ress?.message?.id) {
								remarks.map((mssg) => {
									apiCall({
										method: "POST",
										url: "/clientmessages/" + ress?.message?.id,
										data: {
											wo_id: ress?.message?.id,
											message: mssg.message,
											type: mssg.type,
										},
										handleResponse: (res) => console.log(res),
									});
								});
							}
							form.resetFields();
							setRemarks([]);
							setStartDate(null);
							setEndDate(null);
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
				initialValues={{ modifier: "public" }}
			>
				{/* <Form.Item
					name="name"
					label="Client Name"
					rules={[
						{
							required: true,
							message: "Please input the name of client!",
						},
					]}
				>
					<Input />
				</Form.Item> */}
				<label>Select Assets: </label>
				<Card>
					{assets.length > 0 ? (
						<Tree
							checkable
							onSelect={onSelect}
							onCheck={onCheck}
							treeData={assets}
						/>
					) : (
						"Loading Assets..."
					)}
				</Card>
				<br />
				<label>Select Dates: </label>
				<Row>
					<RangePicker
						style={{ width: "100%" }}
						showTime={{ format: "HH:mm" }}
						format="DD-MM-YYYY HH:mm"
						onChange={onDateChange}
					/>
				</Row>
				<Checkbox
					checked={onlyAvailableResources}
					onChange={(e) => setOnlyAvailableResources(e.target.checked)}
				>
					Show only resources available between these dates
				</Checkbox>
				<br />
				<br />
				<Form.Item
					name="lead_executor"
					label="Select Lead Executor"
					rules={[{ required: true, message: "Please select a lead executor" }]}
				>
					<Select
						showSearch
						allowClear
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
						{leadExecutors?.map(
							(item: { username: string; name: string }, index: number) => (
								<Select.Option value={item.username}>{item.name}</Select.Option>
							)
						)}
					</Select>
				</Form.Item>
				<Form.Item
					name="employees"
					label="Select Employees"
					rules={[
						{ required: true, message: "Please select atleast one resource" },
					]}
				>
					<Select
						showSearch
						allowClear
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
						{employees?.map(
							(item: { id: string; full_name: string }, index: number) => (
								<Select.Option value={item.id}>{item.full_name}</Select.Option>
							)
						)}
					</Select>
				</Form.Item>
				<Form.Item
					name="resources"
					label="Select Equipments"
					rules={[
						{ required: true, message: "Please select atleast one resource" },
					]}
				>
					<Select
						showSearch
						allowClear
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
						{equipments?.map(
							(item: { id: number; name: string }, index: number) => (
								<Select.Option value={item.id}>{item.name}</Select.Option>
							)
						)}
					</Select>
				</Form.Item>
				{/*
				<Form.Item name="remarks" label="Remarks">
					<TextArea rows={4} />
				</Form.Item>
				 <label>Add a Voice Note: </label>
				<Row>
					{isRecording ? (
						<Button
							block
							onClick={() => {
								stopRecording();
							}}
							type="default"
						>
							<span style={{ float: "left" }}>
								{new Date(recordingTime * 1000).toISOString().substring(14, 19)}{" "}
								- Recording...
							</span>
							<span style={{ float: "right" }}>
								<svg width="12" height="12">
									<rect
										x="6"
										y="6"
										rx="2"
										ry="20"
										width="6"
										height="6"
										style={{
											fill: "red",
											stroke: "black",
											strokeWidth: "1",
										}}
									/>
								</svg>
								Stop Recording
							</span>
						</Button>
					) : (
						<Button
							block
							onClick={() => {
								startRecording();
							}}
							icon={
								<svg height="12" width="12">
									<circle
										cx="6"
										cy="7.5"
										r="4"
										stroke="black"
										stroke-width="1"
										fill="red"
									/>
								</svg>
							}
							type="default"
						>
							Start Recording
						</Button>
					)}
				</Row> */}
				<label>Comments:</label>
				<List
					size="small"
					split={false}
					bordered
					locale={{
						emptyText: "No Messages",
					}}
					dataSource={remarks}
					renderItem={(item) =>
						item.createdby === user.username ? (
							<List.Item style={{ justifyContent: "end" }}>
								<div className="bubble-self" style={{ float: "right" }}>
									<label style={{ fontWeight: "bold" }}>You</label>
									<br />
									{item.message}
								</div>
							</List.Item>
						) : (
							<List.Item>
								<div className="bubble" style={{ float: "right" }}>
									<label style={{ fontWeight: "bold" }}>{item.name}</label>
									<br />
									{item.message}
								</div>
							</List.Item>
						)
					}
					style={{ height: "200px", overflow: "scroll" }}
					footer={<div ref={mssgsBottom} />}
				/>
				<Space.Compact style={{ width: "100%", marginTop: "4px" }}>
					{isRecording ? (
						<Input
							value={`Recording... ${new Date(recordingTime * 1000)
								.toISOString()
								.substring(14, 19)}`}
							disabled={true}
							className="selected-building"
						/>
					) : (
						<Input
							placeholder="Type here or Record to add a comment"
							value={newMessage}
							onChange={(e) => setNewMessage(e.currentTarget.value)}
							onPressEnter={() => submitChat()}
						/>
					)}
					<Button onClick={() => submitChat()}>Send</Button>
					{isRecording ? (
						<Button
							onClick={() =>
								setCancelRecording((e) => {
									stopRecording();
									return true;
								})
							}
							icon={<DeleteOutlined />}
						/>
					) : (
						<Button onClick={startRecording} icon={<AudioFilled />} />
					)}
				</Space.Compact>

				{/* <AudioRecorder
					onRecordingComplete={(e) => saveVoiceNote(e)}
					onNotAllowedOrFound={(err) => console.table(err)}
					downloadOnSavePress={false}
					showVisualizer={true}
				/> */}
			</Form>
		</Modal>
	);
};

const CreateNewWorkOrder: FC<props> = ({
	fetchData,
	notification_id,
	pending_procedures,
}: props) => {
	const [visible, setVisible] = useState(false);
	const [confirmLoading, setConfirmLoading] = useState(false);

	const onCreate = (values: any) => {
		values["notification_id"] = notification_id;

		let procedures = values["procedures"];
		delete values["procedures"];

		let selectedAssets = values["assets"];
		delete values["assets"];

		// p_procedures should be list of id from procedures where asset_id is in selectedAssets
		let p_procedures = procedures
			.filter((p: any) => selectedAssets.includes(p.asset_id))
			.map((p: any) => p.id);
		values["pending_procedures"] = p_procedures;

		// values["pending_procedures"] = pending_procedures;
		return new Promise<any>((resolve, reject) => {
			console.log("Received values of form: ", values);
			setConfirmLoading(true);
			apiCall({
				method: "POST",
				url: "/clientworkorders",
				data: values,
				handleResponse: (res) => {
					let resdata: any = res.data;
					resolve(resdata);
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
				icon={<FileDoneOutlined />}
				onClick={() => {
					setVisible(true);
				}}
				type="link"
			>
				Create Work-Order
			</Button>
			<CollectionCreateForm
				visible={visible}
				onCreate={onCreate}
				notification_id={notification_id}
				onCancel={() => {
					setVisible(false);
				}}
				confirmLoading={confirmLoading}
			/>
		</div>
	);
};

export default CreateNewWorkOrder;
