import { useLocation, useNavigate } from "react-router-dom";
import { useLoaderContext } from "../../../Components/Layout";
import * as pdfjsLib from "pdfjs-dist/webpack";
import { useEffect, useRef, useState } from "react";
import Canvas from "./Canvas";
import MainCanvas from "./MainCanvas";
import {
	Popconfirm,
	Button,
	Space,
	Typography,
	message,
	Badge,
	Select,
	Spin,
} from "antd";
import {
	CloseOutlined,
	DeleteOutlined,
	LoadingOutlined,
	SaveOutlined,
	EyeOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { apiCall } from "../../../axiosConfig";
import { degrees, PDFDocument, rgb, StandardFonts } from "pdf-lib";

const PdfViewer = () => {
	pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsLib.PDFWorker;

	const { state } = useLocation();
	const navigate = useNavigate();
	const { ahj, heading, file, editMode } = state;
	const { completeLoading } = useLoaderContext();
	const mainContent = useRef();

	pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsLib.PDFWorker;
	const [thumbnails, setThumbnails] = useState([]);
	const [pages, setPages] = useState([]);
	const [pdfRef, setPdfRef] = useState();
	const [selectedPage, setSelectedPage] = useState(1);
	const [assignedFields, setAssignedFields] = useState({});
	const [saving, setSaving] = useState(false);
	const [assignMode, setAssignMode] = useState(null);
	const [systems, setSystems] = useState(null);
	const [pageSystems, setPageSystems] = useState({});
	const [loadingPdf, setLoadingPdf] = useState(true);
	const [fileURL, setFileURL] = useState(null);
	const [deleting, setDeleting] = useState(false);
	const [creatingSample, setCreatingSample] = useState(false);

	const makeThumb = (page) => {
		var vp = page.getViewport({ scale: 1 });
		var height = 96;
		var width = (vp.width / vp.height) * 96;
		return (
			<Canvas
				height={height}
				width={width}
				draw={(context) => {
					var scale = Math.min(width / vp.width, height / vp.height);
					page.render({
						canvasContext: context,
						viewport: page.getViewport({ scale: scale }),
					}).promise.catch((err) => console.log(err));
				}}
			/>
		);
	};

	const getSystems = () => {
		apiCall({
			method: "GET",
			url: "/dropdown/systemtypes",
			handleResponse: (res) => {
				setSystems(res.data.message);
			},
		});
	};

	useEffect(() => {
		console.log(assignedFields);
	}, [assignedFields]);

	const saveByteArray = (reportName, byte) => {
		var blob = new Blob([byte], { type: "application/pdf" });
		var link = document.createElement("a");
		link.href = window.URL.createObjectURL(blob);
		var fileName = reportName;
		link.download = fileName;
		link.click();
	};

	async function modifyPdf() {
		try {
			const url = editMode ? fileURL : URL.createObjectURL(file);
			const existingPdfBytes = await fetch(url).then((res) =>
				res.arrayBuffer()
			);

			const pdfDoc = await PDFDocument.load(existingPdfBytes, {
				ignoreEncryption: true,
			});

			const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

			const pages = pdfDoc.getPages();
			const firstPage = pages[0];

			Object.keys(assignedFields).map((page) => {
				console.log(pages, page);
				let curr = pages[page - 1];
				const { width, height } = curr.getSize();
				console.log(width, height);
				const size = 10;

				assignedFields[page].map((field) => {
					let text = field.assigned.toString() || "-";
					let textWidth = font.widthOfTextAtSize(text, size);

					curr.drawText(text, {
						x:
							(field.startX + field.rectW / 2) * width -
							textWidth / 2,
						y:
							height -
							(field.startY + field.rectH / 2) * height -
							3.5,
						size,
						font,
						color: rgb(0, 0, 0),
					});
				});
			});

			const pdfBytes = await pdfDoc.save();
			saveByteArray("Sample Report", pdfBytes);
		} catch {
			message.error("Some fields have not been assigned values");
		} finally {
			setCreatingSample(false);
		}
	}

	const loadDocuments = (url) => {
		pdfjsLib
			.getDocument(url)
			.promise.then((doc) => {
				setPdfRef(doc);
				var pages = [];
				while (pages.length < doc.numPages)
					pages.push(pages.length + 1);
				return Promise.all(
					pages.map((num) => {
						return doc
							.getPage(num)
							.then(makeThumb)
							.then((canvas) => {
								return { page: num, canvas };
							});
					})
				).then((res) => {
					setThumbnails(res);
				});
			})
			.catch(console.error);

		pdfjsLib
			.getDocument(url)
			.promise.then((doc) => {
				setPdfRef(doc);
				var pages = [];
				while (pages.length < doc.numPages)
					pages.push(pages.length + 1);
				return Promise.all(
					pages.map((num) => {
						return doc.getPage(num).then((page) => {
							return { page: num, canvas: page };
						});
					})
				).then((res) => {
					setPages(res);
					completeLoading();
					setLoadingPdf(false);
				});
			})
			.catch(console.error);
	};

	const loadFromURL = () => {
		apiCall({
			method: "GET",
			url: `/AHJpdf/${file.id}`,
			handleResponse: (res) => {
				let url = res.data.message.url;
				let newAssignedFields = res.data.message.fields;
				newAssignedFields = JSON.parse(newAssignedFields);
				setAssignedFields(newAssignedFields);
				setFileURL(url);
				loadDocuments(url);
			},
			handleError: () => {
				return "Error";
			},
		});
	};

	useEffect(() => {
		getSystems();
		console.log(file);
		let url;
		if (editMode) {
			loadFromURL();
		} else {
			url = URL.createObjectURL(file);
			loadDocuments(url);
		}
	}, []);

	const scrollToRef = (ref) => {
		ref.current.scroll({
			top: 0,
			behavior: "smooth",
		});
	};

	const uploadfile = (file) => {
		return new Promise((resolve, reject) => {
			apiCall({
				method: "PUT",
				url: "/fileupload?superadmin=true",
				data: {
					type: "ahj_pdfs",
					type_name: ahj.toString(),
					file_name: file.name,
					content_type: file.type,
				},
				handleResponse: (res) => {
					let url = res.data.message.uploadURL;
					axios
						.put(url, file, {
							headers: { "Content-Type": file.type },
						})
						.then(() => {
							resolve({
								name: file.name,
								path: res.data.message.filepath,
							});
						})
						.catch((err) => reject(err));
				},
				handleError: (err) => reject(err),
			});
		});
	};

	const saveDummy = () => {
		setCreatingSample(true);
		console.log(assignedFields);
		modifyPdf();
	};

	const savePdf = () => {
		if (ahj && assignedFields) {
			setSaving(true);
			uploadfile(file).then((filepath) => {
				apiCall({
					url: "/AHJpdf",
					method: "POST",
					data: {
						ahj_id: ahj,
						fields: JSON.stringify(assignedFields),
						filepath,
					},
					handleResponse: (res) => {
						message.success(res.data.message);
						setSaving(false);
						navigate(-1);
						console.log(res);
					},
					handleError: (err) => {
						console.log(err);
						setSaving(false);
					},
				});
			});
		} else message.error("Missing Fields!");
	};

	const deleteFile = () => {
		return new Promise((resolve, reject) => {
			setDeleting(true);
			apiCall({
				method: "DELETE",
				url: "/AHJpdf",
				data: { data: { id: file.id } },
				handleResponse: (res) => {
					message.success(res.data.message);
					deleteAttachment(file.filepath.path);
					navigate(-1);
					resolve(res);
				},
				handleError: (err) => {
					reject(err);
					setDeleting(false);
				},
			});
		});
	};

	const deleteAttachment = (filepath) => {
		return apiCall({
			method: "DELETE",
			url: "/fileupload?superadmin=true",
			data: { data: { filepath } },
			handleResponse: (res) => {
				console.log(res.data.message);
				setDeleting(false);
			},
			handleError: (err) => {
				setDeleting(false);
			},
		});
	};

	const updatePdf = () => {
		if (editMode && assignedFields) {
			setSaving(true);
			apiCall({
				url: "/AHJpdf",
				method: "PUT",
				data: {
					id: file.id,
					fields: JSON.stringify(assignedFields),
				},
				handleResponse: (res) => {
					message.success(res.data.message);
					setSaving(false);
					navigate(-1);
					console.log(res);
				},
				handleError: (err) => {
					console.log(err);
					setSaving(false);
				},
			});
		} else message.error("Missing Fields!");
	};

	const Assigner = ({ pageSystem }) => {
		const [system, setSystem] = useState(
			assignedFields?.[selectedPage]?.[assignMode?.index]?.system
				? assignedFields?.[selectedPage]?.[assignMode?.index]?.system
				: pageSystem > 0
				? pageSystem
				: null
		);
		const [type, setType] = useState(
			assignedFields?.[selectedPage]?.[assignMode?.index]?.type
				? assignedFields?.[selectedPage]?.[assignMode?.index]?.type
				: "procedures"
		);
		const [procedures, setProcedures] = useState(null);
		const [procedure, setProcedure] = useState(
			assignedFields?.[selectedPage]?.[assignMode?.index]?.assigned
				? assignedFields?.[selectedPage]?.[assignMode?.index]?.assigned
				: null
		);
		const [loadingProcedures, setLoadingProcedures] = useState(false);

		const getProcedures = () => {
			setLoadingProcedures(true);
			apiCall({
				method: "GET",
				url: `/dropdown/system_procedures?system_id=${system}`,
				handleResponse: (res) => {
					setLoadingProcedures(false);
					setProcedures(res.data.message);
				},
				handleError: (err) => setLoadingProcedures(false),
			});
		};

		const assign = () => {
			setAssignedFields((prev) => {
				let new_arr = prev[selectedPage];
				new_arr[assignMode.index] = {
					...new_arr[assignMode.index],
					system,
					assigned: procedure,
					type,
				};
				return { ...prev, [selectedPage]: new_arr };
			});
			setAssignMode(null);
		};

		useEffect(() => {
			if (type === "procedures" && system) getProcedures();
		}, [system]);

		return (
			<Space
				direction="vertical"
				style={{ width: "100%", color: "white" }}
			>
				<Typography.Title level={5} style={{ color: "white" }}>
					Assigning Field #{assignMode.index + 1}
				</Typography.Title>
				<div>
					<label style={{ margin: "4px" }}>Select System: </label>
					<Select
						showSearch
						value={system}
						onChange={(e) => setSystem(e)}
						placeholder="Select System"
						style={{ width: "100%" }}
						filterOption={(input, option) =>
							option.children.toLowerCase().includes(input)
						}
						filterSort={(optionA, optionB) =>
							optionA.children
								.toLowerCase()
								.localeCompare(optionB.children.toLowerCase())
						}
					>
						{systems?.map((sys, index) => (
							<Select.Option key={index} value={sys.id}>
								{sys.name}
							</Select.Option>
						))}
					</Select>
				</div>
				{system ? (
					<>
						<div>
							<label style={{ margin: "4px" }}>
								Select Type:
							</label>
							<Select
								value={type}
								onChange={(e) => setType(e)}
								placeholder="Select Type"
								style={{ width: "100%" }}
							>
								<Select.Option value="procedures">
									Procedure Results
								</Select.Option>
								<Select.Option value="system_values">
									System Values
								</Select.Option>
							</Select>
						</div>
						{type === "procedures" ? (
							loadingProcedures ? (
								<span>
									<LoadingOutlined /> Loading Procedures
								</span>
							) : (
								<div>
									<label style={{ margin: "4px" }}>
										Select Procedure
									</label>
									<Select
										showSearch
										value={procedure}
										onChange={(e) => setProcedure(e)}
										placeholder="Select System"
										style={{ width: "100%" }}
										filterOption={(input, option) =>
											option.children
												.toLowerCase()
												.includes(input)
										}
										filterSort={(optionA, optionB) =>
											optionA.children
												.toLowerCase()
												.localeCompare(
													optionB.children.toLowerCase()
												)
										}
									>
										{procedures?.map((proc, index) => (
											<Select.Option
												key={index}
												value={proc.id}
											>
												{`${proc.code} : ${proc.procedure}`}
											</Select.Option>
										))}
									</Select>
								</div>
							)
						) : null}
					</>
				) : null}
				<Space>
					<Button onClick={() => setAssignMode(null)}>Cancel</Button>
					{procedure && (
						<Button type="primary" onClick={assign}>
							{assignedFields?.[selectedPage]?.[assignMode?.index]
								?.assigned
								? "Change"
								: "Assign"}
						</Button>
					)}
				</Space>
			</Space>
		);
	};

	return (
		<>
			<div className="pdf-header">
				<Typography.Text strong style={{ color: "white" }}>
					{heading} / {file.name}
					<div style={{ float: "right" }}>
						<Button
							onClick={() => navigate(-1)}
							size="small"
							icon={<CloseOutlined />}
							style={{ marginRight: "9px" }}
						>
							Cancel
						</Button>
						<Button
							loading={creatingSample}
							onClick={saveDummy}
							size="small"
							icon={<EyeOutlined />}
							style={{ marginRight: "9px" }}
						>
							Show Sample
						</Button>
						{editMode && (
							<Popconfirm
								title="Are you sure to delete?"
								onConfirm={() => deleteFile()}
								// onCancel={cancel}
								okText="Delete"
								cancelText="Cancel"
								placement="left"
							>
								<Button
									danger
									type="primary"
									// onClick={deleteFile}
									size="small"
									icon={<DeleteOutlined />}
									style={{ marginRight: "9px" }}
								>
									Delete
								</Button>
							</Popconfirm>
						)}
						<Button
							size="small"
							loading={saving}
							type="primary"
							style={{ marginRight: "9px" }}
							onClick={editMode ? updatePdf : savePdf}
							icon={<SaveOutlined />}
						>
							Save
						</Button>
					</div>
				</Typography.Text>
			</div>
			<div className="pdf-view">
				{!loadingPdf && (
					<div className="thumbnail-wrapper">
						<div className="thumbnail-contents">
							{thumbnails.map((thumbnail, index) => {
								return (
									<div
										className={
											"thumbnail" +
											(thumbnail.page === selectedPage
												? "-selected"
												: "")
										}
										key={index}
										onClick={() => {
											setSelectedPage(thumbnail.page);
											scrollToRef(mainContent);
										}}
									>
										{thumbnail.canvas}
										<br />
										{thumbnail.page}
									</div>
								);
							})}
						</div>
					</div>
				)}

				<div className="pdf-main-view-wrapper">
					<div
						className="pdf-main-view"
						ref={mainContent}
						style={loadingPdf ? { alignContent: "center" } : {}}
						onResize={(e) => console.log(e)}
					>
						{loadingPdf ? (
							<Spin size="large" tip="Loading PDF">
								<div />
							</Spin>
						) : (
							pages.map((page, index) => (
								<MainCanvas
									key={index}
									pageNo={page.page}
									assignedFields={
										assignedFields[page.page] || []
									}
									setAssignedFields={setAssignedFields}
									width={
										mainContent.current.clientWidth - 420
									}
									style={
										selectedPage === page.page
											? { display: "flex" }
											: { display: "none" }
									}
									pdfRef={page.canvas}
									assigner={(index) => {
										setAssignMode({ index });
									}}
								/>
							))
						)}
					</div>
				</div>

				{!loadingPdf && (
					<div className="side-panel-wrapper">
						<div className="side-panel-contents">
							<Space
								direction="vertical"
								style={{ width: "100%" }}
							>
								{assignMode ? (
									<Assigner
										pageSystem={
											pageSystems?.[selectedPage] || 0
										}
									/>
								) : (
									<>
										<Typography.Title
											level={5}
											style={{
												color: "white",
												marginBottom: 0,
											}}
										>
											Select a System for this Page:
										</Typography.Title>
										<Select
											showSearch
											value={
												pageSystems?.[selectedPage] || 0
											}
											onChange={(e) =>
												setPageSystems((prev) => ({
													...prev,
													[selectedPage]: e,
												}))
											}
											placeholder="Select System"
											style={{ width: "100%" }}
											filterOption={(input, option) =>
												option.children
													.toLowerCase()
													.includes(input)
											}
											filterSort={(optionA, optionB) =>
												optionA.children
													.toLowerCase()
													.localeCompare(
														optionB.children.toLowerCase()
													)
											}
										>
											<Select.Option value={0}>
												Multiple Systems
											</Select.Option>
											{systems?.map((sys, index) => (
												<Select.Option
													key={index}
													value={sys.id}
												>
													{sys.name}
												</Select.Option>
											))}
										</Select>
										<Typography.Title
											level={5}
											style={{
												color: "white",
												marginBottom: 0,
											}}
										>
											Fields in this page:
										</Typography.Title>
										<Typography.Text
											style={{ color: "lightgray" }}
											italic
										>
											{assignedFields?.[selectedPage]
												?.length > 0
												? "Click on a field to assign/edit"
												: "No fields added"}
										</Typography.Text>
										{assignedFields?.[selectedPage]?.map(
											(x, index) => (
												<div
													onClick={() => {
														setAssignMode({
															index,
														});
													}}
													key={index}
													className="side-field-list-item"
												>
													<Badge
														style={{
															color: "inherit",
														}}
														color={
															x.assigned
																? "green"
																: "orange"
														}
														text={`Field #${
															index + 1
														}`}
													/>
												</div>
											)
										)}
									</>
								)}
							</Space>
						</div>
					</div>
				)}
			</div>
		</>
	);
};

export default PdfViewer;
