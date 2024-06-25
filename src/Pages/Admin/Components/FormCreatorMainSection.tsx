import {
	Button,
	Card,
	Checkbox,
	Col,
	Divider,
	Empty,
	Form,
	List,
	Row,
	Space,
	Table,
	Tabs,
	Tooltip,
	Typography,
	Upload,
	UploadFile,
	UploadProps,
} from "antd";
import { CheckboxValueType } from "antd/es/checkbox/Group";
import { FC, useContext, useEffect, useState } from "react";
import AddNewProcedure from "./AddNewProcedure";
import ProceduresTable from "./ProceduresTable";
import { AHJFormContext } from "../../../Helpers/Context";
import { apiCall } from "../../../axiosConfig";
import {
	FilePdfOutlined,
	LoadingOutlined,
	PlusOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

interface props {
	systemId: number;
	ahj: number;
	heading: any;
}

const FormCreatorMainSection: FC<props> = ({ systemId, ahj, heading }) => {
	const [activeActivity, setActiveActivity] = useState<string>("inspection");
	const [loadingFiles, setLoadingFiles] = useState(false);
	const [files, setFiles] = useState<any>([]);
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const navigate = useNavigate();

	const tabItems = [
		{
			label: "Inspection",
			key: "inspection",
		},
		{
			label: "Testing",
			key: "testing",
		},
		{
			label: "Maintenance",
			key: "maintenance",
		},
	];

	const onChange = (key: string) => {
		setActiveActivity(key);
	};

	const getFiles = () => {
		setLoadingFiles(true);
		apiCall({
			method: "GET",
			url: `/dropdown/ahj_pdf?id=${ahj}&system_id=${systemId}`,
			handleResponse: (res) => {
				let new_files = res.data.message;
				setFiles(new_files);
				setLoadingFiles(false);
			},
		});
	};

	useEffect(() => {
		getFiles();
	}, [systemId]);

	const uploadProps: UploadProps = {
		onRemove: (file) => {
			const index = fileList.indexOf(file);
			const newFileList = fileList.slice();
			newFileList.splice(index, 1);
			setFileList(newFileList);
		},
		beforeUpload: (file) => {
			setFileList([...fileList, file]);
			navigate("/pdfview", {
				state: { ahj, heading, file, editMode: false, systemId },
			});

			return false;
		},
		itemRender: (node, file) => <> </>,
		fileList,
	};

	return (
		<div className="tree-main">
			{systemId ? (
				<>
					{" "}
					<Row>
						<Space>
							<Typography.Title level={4}>Files: </Typography.Title>
							<Tooltip title="Upload File">
								<Upload {...uploadProps}>
									<Button
										style={{ marginTop: "14px" }}
										size="small"
										shape="circle"
										icon={<PlusOutlined />}
									/>
								</Upload>
							</Tooltip>
						</Space>
					</Row>
					{loadingFiles ? (
						<Typography.Text>
							Loading Files... <LoadingOutlined />
						</Typography.Text>
					) : files?.length > 0 ? (
						<List
							grid={{ gutter: 16 }}
							loading={loadingFiles}
							dataSource={files}
							renderItem={(file: any) => (
								<List.Item>
									<Card>
										<Space>
											<FilePdfOutlined style={{ fontSize: "25px" }} />{" "}
											<Button
												style={{ padding: 0 }}
												type="link"
												onClick={() => {
													navigate("/pdfview", {
														state: {
															ahj,
															heading,
															file: {
																...file,
																name: file.filepath.name,
															},
															editMode: true,
															systemId,
														},
													});
												}}
											>
												{file.filepath.name}
											</Button>
										</Space>
									</Card>
								</List.Item>
							)}
						/>
					) : (
						<Typography.Text>No Files Found</Typography.Text>
					)}
					<Divider />
					<Tabs
						items={tabItems}
						onChange={onChange}
						defaultActiveKey="inspection"
					/>
					<ProceduresTable
						key={`${activeActivity}${systemId}`}
						system={systemId}
						activity={activeActivity}
						ahj={ahj}
					/>{" "}
				</>
			) : (
				<Empty
					description="Select a system to view"
					imageStyle={{ marginTop: 100 }}
				/>
			)}
		</div>
	);
};

export default FormCreatorMainSection;
