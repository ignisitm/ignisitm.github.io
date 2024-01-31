import React, { Children, useEffect, useMemo, useState } from "react";
import {
	Button,
	Card,
	Col,
	Input,
	Row,
	Spin,
	Tabs,
	Tooltip,
	Tree,
	Typography,
	Upload,
} from "antd";
import type { DataNode } from "antd/es/tree";
import { apiCall } from "../../../axiosConfig";
import type { MenuProps, UploadFile, UploadProps } from "antd";
import { Menu } from "antd";
import FormCreatorMainSection from "./FormCreatorMainSection";
import { useLoaderContext } from "../../../Components/Layout";
import { Link, useNavigate } from "react-router-dom";
import {
	ArrowLeftOutlined,
	ControlOutlined,
	FilePdfOutlined,
	LoadingOutlined,
	PlusOutlined,
} from "@ant-design/icons";
import AHJSystemList from "./AHJSystemList";

type MenuItem = Required<MenuProps>["items"][number];
function getItem(
	label: React.ReactNode,
	key: React.Key,
	icon?: React.ReactNode,
	children?: MenuItem[],
	type?: "group"
): MenuItem {
	return {
		key,
		icon,
		children,
		label,
		type,
	} as MenuItem;
}

interface props {
	ahj: number;
	heading: any;
}

const FormCreator: React.FC<props> = ({ ahj, heading }) => {
	const [items, setItems] = useState<MenuProps["items"]>([]);
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [systems, setSystems] = useState<any>([]);
	const [selectedKey, setSelectedKey] = useState<any>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const { completeLoading } = useLoaderContext();
	const navigate = useNavigate();

	const uploadProps: UploadProps = {
		onRemove: (file) => {
			const index = fileList.indexOf(file);
			const newFileList = fileList.slice();
			newFileList.splice(index, 1);
			setFileList(newFileList);
		},
		beforeUpload: (file) => {
			setFileList([...fileList, file]);
			navigate("/pdfview", { state: { ahj, heading, file } });

			return false;
		},
		itemRender: (node, file) => <> </>,
		fileList,
	};

	useEffect(() => {
		console.log(fileList);
	}, [fileList]);

	useEffect(() => {
		apiCall({
			method: "GET",
			url: "/dropdown/systemtypes",
			handleResponse: (res) => {
				let response = res.data.message;
				setSystems(res.data.message);
				let items: MenuProps["items"] = [];
				if (Array.isArray(response)) {
					response.map((sys) => {
						items?.push(getItem(sys.name, sys.id));
					});
					setItems(items);
				}
				completeLoading();
				setIsLoading(false);
			},
		});
	}, []);

	const onClick: MenuProps["onClick"] = (e) => {
		console.log("click ", e.key);
		setSelectedKey(parseInt(e.key));
	};

	return (
		// <Card>
		// 	<div className="tree-with-details">
		// 		{isLoading ? (
		// 			<div className="loader-container">
		// 				<Spin tip="Loading">
		// 					<span />
		// 				</Spin>
		// 			</div>
		// 		) : (
		// 			<>
		// 				<div className="tree-menu">
		// 					<h4>Select a System :</h4>
		// 					<Menu onClick={onClick} items={items} />
		// 				</div>
		// 				<FormCreatorMainSection ahj={ahj} systemId={selectedKey} />
		// 			</>
		// 		)}
		// 	</div>
		// </Card>
		<div className="content-wrapper">
			<div className="content-fixed">
				<div className="content-fixed-item" style={{ display: "flex" }}>
					<div
						style={{
							width: "36px",
							display: "flex",
							flexWrap: "wrap",
							alignContent: "center",
						}}
					>
						<Tooltip title="Go Back">
							<Link to="../ahjforms">
								<Button
									size="small"
									shape="circle"
									icon={<ArrowLeftOutlined />}
								/>
							</Link>
						</Tooltip>
					</div>
					<div style={{ flexGrow: "1" }}>
						<Typography.Text strong style={{ fontSize: "16px" }}>
							{heading}
						</Typography.Text>
					</div>
				</div>
				<br />
				<div className="content-fixed-item">
					<Typography.Text type="secondary">
						Files ({fileList.length})
					</Typography.Text>
					<Typography.Text
						strong
						style={{ float: "right", cursor: "pointer" }}
						type="secondary"
					>
						<Upload style={{ width: "100%" }} {...uploadProps}>
							<PlusOutlined />
						</Upload>
					</Typography.Text>
				</div>
				<div className="content-fixed-item">
					{fileList.length ? null : (
						<div className={"system-list-item"}>
							<Upload style={{ width: "100%" }} {...uploadProps}>
								<PlusOutlined />{" "}
								<Typography.Text italic style={{ width: "80%" }}>
									Upload a file
								</Typography.Text>
							</Upload>
						</div>
					)}
					{fileList.map((file: any, index: number) => (
						<div
							key={index}
							className={"system-list-item"}
							onClick={() => {
								navigate("/pdfview", { state: { ahj, heading, file } });
							}}
						>
							{/* <Upload style={{ width: "100%" }} {...uploadProps}> */}
							<FilePdfOutlined />{" "}
							<Typography.Text
								ellipsis={{
									tooltip: { title: file.name, placement: "bottomLeft" },
								}}
								style={{ width: "80%" }}
							>
								{file.name}
							</Typography.Text>
							{/* </Upload> */}
						</div>
					))}
				</div>
				<br />
				<div className="content-fixed-item">
					<Typography.Text type="secondary">
						System Types ({items?.length})
					</Typography.Text>
					{isLoading ? (
						<Typography.Text strong style={{ float: "right" }} type="secondary">
							<LoadingOutlined />
						</Typography.Text>
					) : null}
				</div>
				<div className="content-fixed-item">
					<AHJSystemList
						items={items}
						onClick={(item: any) => setSelectedKey(parseInt(item.key))}
					/>
				</div>
			</div>
			<div className="content-flex">
				{selectedKey ? (
					<FormCreatorMainSection ahj={ahj} systemId={selectedKey} />
				) : (
					<div className="content-flex-empty">
						<Card style={{ width: 400 }}>
							<Typography.Title style={{ marginTop: "5px" }} level={5}>
								{heading}
							</Typography.Title>
							<Typography.Text type="secondary">
								Select a system type from the navigation panel on the left to
								view the procedures.
							</Typography.Text>
						</Card>
					</div>
				)}
			</div>
		</div>
	);
};

export default FormCreator;
