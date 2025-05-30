import {
	Table,
	Row,
	Col,
	Input,
	Button,
	Popconfirm,
	message,
	Typography,
	Modal,
	Space,
	Drawer,
	Form,
	Divider,
	Upload,
} from "antd";
import { useContext, useEffect, useState } from "react";
import { apiCall } from "../../axiosConfig";
import {
	SyncOutlined,
	CloseOutlined,
	DeleteOutlined,
	LoadingOutlined,
	PlusOutlined,
} from "@ant-design/icons";
import axios, { AxiosError, AxiosResponse } from "axios";
import AddNewAsset from "./AddNewAsset";
import { RcFile } from "antd/es/upload";
import Filter from "../../Components/Filter";
import { AssetContext } from "../../Helpers/Context";
const { Search } = Input;
const { Text } = Typography;

const AssetTable = () => {
	const contextVariables = useContext(AssetContext);
	const [data, setData] = useState();
	const [filters, setFilters] = useState<object | null>(null);
	const [loading, setLoading] = useState(false);
	const [searchText, setSearchText] = useState("");
	const [showClose, setShowClose] = useState(false);
	const [drawerFields, setDrawerFields] = useState<any>(null);
	const [drawerInfo, setDrawerInfo] = useState<any>(null);
	const [confirmLoading, setConfirmLoading] = useState(false);
	const [drawerVisible, setDrawerVisible] = useState(false);
	const [editMode, setEditMode] = useState(false);
	const [GI_form] = Form.useForm();
	const [selectedAsset, setSelectedAsset] = useState<any>(null);
	const [assetImage, setAssetImage] = useState<any>(null);
	const [newAssetImage, setNewAssetImage] = useState<any>(null);
	const [loadingImage, setLoadingImage] = useState(false);
	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 10,
		total: 0,
	});

	const columns = [
		{
			title: "Name",
			dataIndex: "device_name",
			width: "30%",
		},
		{
			title: "Tag",
			dataIndex: "tag",
		},
		{
			title: "System",
			dataIndex: "system_name",
			render: (text: string, row: any) => `${text} - (${row.system_tag})`,
		},
		{
			title: "Building",
			dataIndex: "building_name",
		},
		{
			title: "Location",
			dataIndex: "location_name",
		},
		{
			title: "General Info",
			dataIndex: "general_info",
			render: (info: any, row: any) => (
				<Button
					onClick={() => {
						setSelectedAsset(row.id);
						setDrawerFields(row.general_fields);
						setDrawerInfo(info);
						if (row.image) getImageUrl(row.image);
						else {
							setAssetImage(null);
							setNewAssetImage(null);
						}
						setTimeout(() => {
							openDrawer();
						}, 200);

						console.log("first");
					}}
					type="link"
				>
					View/Edit
				</Button>
			),
		},
		{
			title: "Action",
			dataIndex: "id",
			render: (id: number) => (
				<Popconfirm
					title="Are you sure to delete?"
					onConfirm={() => deleteRow(id)}
					// onCancel={cancel}
					okText="Delete"
					cancelText="Cancel"
					placement="left"
				>
					<div className="delete-table-action">
						<DeleteOutlined />
					</div>
				</Popconfirm>
			),
			width: "5%",
		},
	];

	const getImageUrl = (filepath: any) => {
		setLoadingImage(true);
		apiCall({
			method: "POST",
			url: "/fileupload",
			data: { filepath },
			handleResponse: (res) => {
				let url = res.data.message;
				setAssetImage(url);
				setNewAssetImage(url);
				setLoadingImage(false);
			},
			handleError: (err) => setLoadingImage(false),
		});
	};

	const deleteRow = (id: number) => {
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			apiCall({
				method: "DELETE",
				url: "/clientassets",
				data: { data: { id } },
				handleResponse: (res) => {
					message.success(res.data.message);
					fetchData();
					resolve(res);
				},
				handleError: (err) => {
					reject(err);
				},
			});
		});
	};

	const fetchData = (
		curr_pagination: any = pagination,
		search: string = searchText
	) => {
		setLoading(true);
		setShowClose(search ? true : false);
		apiCall({
			method: "POST",
			url: `/clientfilters/assets?page=${curr_pagination.current}&limit=${
				curr_pagination.pageSize
			}&searchText=${search || ""}`,
			handleResponse: (res) => {
				setData(res.data.message);
				setLoading(false);
				if (res.data.message.length > 0) {
					let total = res.data.message[0].full_count;
					setPagination({ ...curr_pagination, total });
				} else {
					setPagination({ ...curr_pagination, total: 0 });
				}
			},
			handleError: () => {
				setLoading(false);
			},
			...(filters ? { data: filters } : {}),
		});
	};

	const search = (clear: boolean = false) => {
		let text = clear ? "" : searchText;
		if (clear) setSearchText("");
		fetchData(
			{
				pageSize: 10,
				current: 1,
			},
			text
		);
	};

	useEffect(() => {
		search();
	}, []);

	useEffect(() => {
		fetchData({
			...pagination,
			current: 1,
		});
	}, [filters]);

	const openDrawer = () => {
		setDrawerVisible(true);
	};

	const closeDrawer = () => {
		setDrawerVisible(false);
		setAssetImage(null);
		setNewAssetImage(null);
	};

	const openEditMode = () => {
		setEditMode(true);
	};

	const closeEditMode = () => {
		setEditMode(false);
	};

	const handleTableChange = (newPagination: any) => {
		fetchData(newPagination);
	};

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

	const onCreate = (values: any) => {
		return new Promise<AxiosResponse | AxiosError>(async (resolve, reject) => {
			setConfirmLoading(true);
			console.log("Received values of form: ", values);
			let responseData;
			responseData = {
				data: { general_info: { ...values } },
				id: selectedAsset,
			};
			if (newAssetImage === null) {
				responseData = {
					...responseData,
					data: { ...responseData.data, image: null },
				};
				setAssetImage(null);
			} else if (assetImage !== newAssetImage) {
				let filepath = await uploadfiles(newAssetImage, selectedAsset);
				console.log(filepath);
				responseData = {
					...responseData,
					data: { ...responseData.data, image: filepath },
				};
			}
			console.log(responseData);

			apiCall({
				method: "PUT",
				url: "/clientassets",
				data: responseData,
				handleResponse: (res) => {
					resolve(res);
					setConfirmLoading(false);
					fetchData();
					message.success(res.data.message);
				},
				handleError: (err) => {
					reject(err);
					setConfirmLoading(false);
				},
			});
		});
	};

	const beforeUpload = (file: RcFile) => {
		const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
		if (!isJpgOrPng) {
			message.error("You can only upload JPEG/PNG file!");
		}
		const isLt2M = file.size / 1024 / 1024 < 20;
		if (!isLt2M) {
			message.error("Image must smaller than 20MB!");
		}
		return isJpgOrPng && isLt2M;
	};

	const dummyRequest = ({ file, onSuccess }: any) => {
		setTimeout(() => {
			onSuccess("ok");
		}, 0);
	};

	const GeneralInfoContent = () => (
		<Form
			form={GI_form}
			layout="vertical"
			name="GI_Form"
			preserve={false}
			initialValues={drawerInfo}
			onFinish={(values) => {
				onCreate(values).then(() => {
					closeEditMode();
					setAssetImage(URL.createObjectURL(newAssetImage.originFileObj));
					setNewAssetImage((file: any) =>
						URL.createObjectURL(file.originFileObj)
					);
					setDrawerInfo(values);
				});
			}}
		>
			{loadingImage && (
				<h4>
					<LoadingOutlined /> Loading Asset Image...
				</h4>
			)}
			{(!editMode && assetImage) || (newAssetImage && editMode) ? (
				<img
					width={"100%"}
					src={
						editMode
							? newAssetImage === assetImage
								? assetImage
								: URL.createObjectURL(newAssetImage.originFileObj)
							: assetImage
					}
				/>
			) : loadingImage ? null : editMode ? null : (
				"No Image uploaded for this Asset"
			)}
			{editMode ? (
				newAssetImage ? (
					<Button
						icon={<DeleteOutlined />}
						onClick={() => setNewAssetImage(null)}
						type="default"
						block
					>
						Remove
					</Button>
				) : (
					<div style={{ width: "100%", textAlign: "center" }}>
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
									setNewAssetImage(e.file);
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
					</div>
				)
			) : null}

			<Divider />
			{drawerFields?.length
				? drawerFields.map((field: any) => (
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
								<Input className="selected-building" disabled={!editMode} />
							) : (
								<Input className="selected-building" disabled={!editMode} />
							)}
						</Form.Item>
				  ))
				: null}
		</Form>
	);

	return (
		<Filter
			onApply={(filterValues: any) => {
				setFilters(filterValues);
				console.log(filterValues);
			}}
			items={[
				{
					key: "name",
					label: "Asset Name",
					type: "search",
					group: "devtype",
				},
				{
					key: "tag",
					label: "Asset Tag",
					type: "search",
					group: "asset",
				},
				{
					key: "building_id",
					label: "Buildings",
					type: "dropdown",
					placeholder: "Select one or more",
					group: "system",
					multi: true,
					searchable: true,
					options: contextVariables.buildings.map(
						(bldg: { id: number; building_name: string }) => ({
							value: bldg.id,
							label: bldg.building_name,
						})
					),
				},
				{
					key: "type",
					label: "System Type",
					type: "dropdown",
					placeholder: "Select one or more",
					group: "system",
					multi: true,
					searchable: true,
					options: contextVariables.systemTypes.map(
						(type: { id: number; name: string }) => ({
							value: type.id,
							label: type.name,
						})
					),
				},
				{
					key: "#name",
					label: "System Name",
					type: "search",
					group: "system",
				},
				{
					key: "#tag",
					label: "System Tag",
					type: "search",
					group: "system",
				},
				{
					key: "##name",
					label: "Location",
					type: "search",
					group: "location",
				},
			]}
		>
			<Row style={{ marginBottom: 10 }}>
				<Col span={18}>
					<Search
						className="table-search"
						placeholder="Search using Column Values"
						onChange={(e) => setSearchText(e.target.value)}
						onSearch={() => search()}
						value={searchText}
					/>
					{showClose && (
						<Button onClick={() => search(true)} icon={<CloseOutlined />} />
					)}
				</Col>
				<Col span={6} className="table-button">
					<Button
						icon={<SyncOutlined />}
						style={{ marginRight: "5px" }}
						onClick={() => search()}
					>
						Refresh
					</Button>
					<AddNewAsset fetchData={fetchData} />
				</Col>
			</Row>
			<Row>
				<Col span={24}>
					<Table
						columns={columns}
						rowKey={(record) => record.id}
						dataSource={data}
						pagination={pagination}
						loading={loading}
						onChange={handleTableChange}
						size="small"
						bordered
					/>
					<div className="table-result-label">{`Showing ${
						(pagination.current - 1) * (pagination.pageSize || 10) + 1
					} - ${
						pagination.total <
						(pagination.current - 1) * (pagination.pageSize || 10) +
							(pagination.pageSize || 10)
							? pagination.total
							: (pagination.current - 1) * (pagination.pageSize || 10) +
							  (pagination.pageSize || 10)
					} out of ${pagination.total} records`}</div>
				</Col>
			</Row>
			<Drawer
				destroyOnClose={true}
				title="General Information"
				placement="right"
				onClose={() => {
					if (!editMode) closeDrawer();
					else
						message.info(
							"There might be unsaved changes. Save or Discard the changes."
						);
				}}
				open={drawerVisible}
				extra={
					editMode ? (
						<Space>
							<Button
								onClick={() => {
									closeEditMode();
									GI_form.resetFields();
									setNewAssetImage(assetImage);
								}}
							>
								Cancel
							</Button>
							<Button
								loading={confirmLoading}
								onClick={() => {
									GI_form.submit();
								}}
								type="primary"
							>
								Save
							</Button>
						</Space>
					) : (
						<Button onClick={openEditMode}>Edit</Button>
					)
				}
			>
				<GeneralInfoContent />
			</Drawer>
		</Filter>
	);
};

export default AssetTable;
