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

	const buildingFields = [
		{ label: "ID", value: "id" },
		{ label: "Area", value: "building_area" },
		{
			label: "Completion Certificate Number",
			value: "building_completion_certificate_number",
		},
		{ label: "Height", value: "building_height" },
		{ label: "Name", value: "building_name" },
		{ label: "Building Number", value: "building_no" },
		{ label: "Contact Number", value: "contact_number" },
		{ label: "Hazard Classification", value: "hazard_classification" },
		{ label: "Jurisdiction", value: "jurisdiction" },
		{ label: "Metrics", value: "metrics" },
		{ label: "Occupancy Classification", value: "occupancy_classification" },
		{ label: "Street Number", value: "street_no" },
		{ label: "Type of Construction", value: "type_of_construction" },
		{ label: "Unit Number", value: "unit_no" },
		{ label: "Zone Number", value: "zone_no" },
		{ label: "FM Company", value: "fm_company" },
		{ label: "Attachments", value: "attachments" },
		{ label: "Coordinates", value: "coordinates" },
	];

	const userFields = [
		{ label: "Username", value: "username" },
		{ label: "Password", value: "password" },
		{ label: "First Login", value: "first_login" },
		{ label: "Role", value: "role" },
		{ label: "Status", value: "status" },
		{ label: "Full Name", value: "full_name" },
		{ label: "Designation", value: "designation" },
		{ label: "Email", value: "email" },
		{ label: "Phone", value: "phone" },
	];

	const contractFields = [
		{ label: "ID", value: "id" },
		{ label: "Type", value: "type" },
		{ label: "Total Contract Value", value: "total_contract_value" },
		{ label: "Title", value: "title" },
		{ label: "From Date", value: "from_date" },
		{ label: "To Date", value: "to_date" },
		{ label: "Status", value: "status" },
		{ label: "Contract Attachment", value: "contract_attachment" },
	];

	const { state } = useLocation();
	const navigate = useNavigate();
	const { ahj, heading, file, editMode, systemId } = state;
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
	const [devicetypes, setDeviceTypes] = useState(null);
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
					page
						.render({
							canvasContext: context,
							viewport: page.getViewport({ scale: scale }),
						})
						.promise.catch((err) => console.log(err));
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

	const getDevices = () => {
		apiCall({
			method: "GET",
			url: `/dropdown/devicetypes?system=${systemId}`,
			handleResponse: (res) => {
				setDeviceTypes(res.data.message);
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
						x: (field.startX + field.rectW / 2) * width - textWidth / 2,
						y: height - (field.startY + field.rectH / 2) * height - 3.5,
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
		console.log("Loading From DOCS");

		pdfjsLib
			.getDocument(url)
			.promise.then(async (doc) => {
				setPdfRef(doc);

				// Create array of page numbers
				const pagesArr = Array.from({ length: doc.numPages }, (_, i) => i + 1);

				// Generate thumbnails
				const thumbs = await Promise.all(
					pagesArr.map(async (num) => {
						const page = await doc.getPage(num);
						const thumb = makeThumb(page);
						return { page: num, canvas: thumb };
					})
				);
				setThumbnails(thumbs);

				// Generate page objects (with annotations)
				const pageObjs = await Promise.all(
					pagesArr.map(async (num) => {
						console.log("Getting page: ", num);
						const page = await doc.getPage(num);

						// 🔑 get annotations (form fields)
						const annotations = await page.getAnnotations();

						console.log("EditMode: ", editMode);
						if (!editMode) {
							console.log("Adding new fields in EditMode");
							// Add new points to assignedFields from annotations
							const divW = page.view[2];
							const divH = page.view[3];
							const newFields = annotations
								.filter((ann) => ann.rect)
								.map((ann) => {
									const startX = ann.rect[0];
									const startY = ann.rect[1];
									const rectW = ann.rect[2] - ann.rect[0];
									const rectH = ann.rect[3] - ann.rect[1];
									return {
										startX: startX / divW,
										startY: 1 - (startY + rectH) / divH, // invert Y axis
										rectW: rectW / divW,
										rectH: rectH / divH,
										fillable: true,
										fillableField: ann.fieldName || null,
									};
								});
							setAssignedFields((prev) => ({
								...prev,
								[num]: newFields,
							}));
						}

						return { page: num, canvas: page, annotations };
					})
				);

				console.log("pageObjs: ", pageObjs);
				setPages(pageObjs);
				completeLoading();
				setLoadingPdf(false);
			})
			.catch((error) => {
				console.error("Error loading PDF document:", error);
			});
	};

	const loadFromURL = () => {
		apiCall({
			method: "GET",
			url: `/AHJpdf/${file.id}`,
			handleResponse: (res) => {
				console.log("res: ", res);
				let url = res.data.message.url;
				let newAssignedFields = res.data.message.fields;
				newAssignedFields = JSON.parse(newAssignedFields);
				setAssignedFields(newAssignedFields);
				setFileURL(url);
				loadDocuments(url);
			},
			handleError: (err) => {
				console.log(err);
				return "Error";
			},
		});
	};

	useEffect(() => {
		console.log(assignedFields);
	}, [assignedFields]);

	useEffect(() => {
		getSystems();
		getDevices();
		console.log(file);
		console.log(editMode);
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

	const uploadfile = (file, id) => {
		return new Promise((resolve, reject) => {
			apiCall({
				method: "PUT",
				url: "/fileupload?superadmin=true",
				data: {
					type: "ahj_pdfs",
					type_name: id.toString(),
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
			apiCall({
				url: "/AHJpdf",
				method: "POST",
				data: {
					ahj_id: ahj,
					fields: JSON.stringify(assignedFields),
					systemtype: systemId,
					filepath: {},
				},
				handleResponse: (res) => {
					const id = res.data.message.id;
					console.log(res);
					uploadfile(file, id).then((filepath) => {
						apiCall({
							url: "/AHJpdf",
							method: "PUT",
							data: {
								id,
								filepath,
							},
							handleResponse: (res) => {
								message.success("AHJ File added Successfully!");
								setSaving(false);
								navigate(-1);
							},
							handleError: (err) => {
								console.log(err);
								setSaving(false);
							},
						});
					});
				},
				handleError: (err) => {
					console.log(err);
					setSaving(false);
				},
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
		const [system, setSystem] = useState(systemId);
		const [type, setType] = useState(
			assignedFields?.[selectedPage]?.[assignMode?.index]?.type
				? assignedFields?.[selectedPage]?.[assignMode?.index]?.type
				: "procedures"
		);
		const [procedures, setProcedures] = useState(null);
		const [systemFields, setSystemFields] = useState(null);

		const [procedure, setProcedure] = useState(
			assignedFields?.[selectedPage]?.[assignMode?.index]?.assigned &&
				assignedFields?.[selectedPage]?.[assignMode?.index]?.type ===
					"procedures"
				? assignedFields?.[selectedPage]?.[assignMode?.index]?.assigned
				: null
		);

		const [systemField, setSystemField] = useState(
			assignedFields?.[selectedPage]?.[assignMode?.index]?.assigned &&
				assignedFields?.[selectedPage]?.[assignMode?.index]?.type ===
					"system_values"
				? assignedFields?.[selectedPage]?.[assignMode?.index]?.assigned
				: null
		);

		const [buildingField, setBuildingField] = useState(
			assignedFields?.[selectedPage]?.[assignMode?.index]?.assigned &&
				assignedFields?.[selectedPage]?.[assignMode?.index]?.type === "building"
				? assignedFields?.[selectedPage]?.[assignMode?.index]?.assigned
				: null
		);

		const [userField, setUserField] = useState(
			assignedFields?.[selectedPage]?.[assignMode?.index]?.assigned &&
				assignedFields?.[selectedPage]?.[assignMode?.index]?.type === "user"
				? assignedFields?.[selectedPage]?.[assignMode?.index]?.assigned
				: null
		);

		const [contractField, setContractField] = useState(
			assignedFields?.[selectedPage]?.[assignMode?.index]?.assigned &&
				assignedFields?.[selectedPage]?.[assignMode?.index]?.type === "contract"
				? assignedFields?.[selectedPage]?.[assignMode?.index]?.assigned
				: null
		);

		const [DeviceTypeField, setDeviceTypeField] = useState(
			assignedFields?.[selectedPage]?.[assignMode?.index]?.assigned &&
				assignedFields?.[selectedPage]?.[assignMode?.index]?.type === "device"
				? assignedFields?.[selectedPage]?.[assignMode?.index]?.device
				: null
		);

		const [loadingProcedures, setLoadingProcedures] = useState(false);
		const [systemFieldsLoading, setSystemFieldsLoading] = useState(false);

		const [loadingDeviceFields, setLoadingDeviceFields] = useState(true);
		const [deviceFields, setDeviceFields] = useState(null);
		const [deviceField, setDeviceField] = useState(
			assignedFields?.[selectedPage]?.[assignMode?.index]?.assigned &&
				assignedFields?.[selectedPage]?.[assignMode?.index]?.type === "device"
				? assignedFields?.[selectedPage]?.[assignMode?.index]?.assigned
				: null
		);

		const getProcedures = () => {
			setLoadingProcedures(true);
			apiCall({
				method: "GET",
				url: `/dropdown/system_procedures?system_id=${systemId}&ahj=${ahj}`,
				handleResponse: (res) => {
					setLoadingProcedures(false);
					setProcedures(res.data.message);
				},
				handleError: (err) => setLoadingProcedures(false),
			});
		};

		const getSystemFields = () => {
			setSystemFieldsLoading(true);
			apiCall({
				method: "GET",
				url: `/dropdown/systemfields?id=${systemId}`,
				handleResponse: (res) => {
					setSystemFieldsLoading(false);
					setSystemFields(res.data.message?.general_information);
				},
				handleError: (err) => setSystemFieldsLoading(false),
			});
		};

		const assign = () => {
			setAssignedFields((prev) => {
				let new_arr = prev[selectedPage];
				new_arr[assignMode.index] = {
					...new_arr[assignMode.index],
					system: systemId,
					assigned:
						type === "procedures"
							? procedure
							: type === "system_values"
							? systemField
							: type === "building"
							? buildingField
							: type === "user"
							? userField
							: type === "contract"
							? contractField
							: type === "device"
							? deviceField
							: null,
					type,
					device: type === "device" ? DeviceTypeField : null,
				};
				return { ...prev, [selectedPage]: new_arr };
			});
			setAssignMode(null);
		};

		const getDeviceFields = (id) => {
			setLoadingDeviceFields(true);
			apiCall({
				method: "GET",
				url: `/dropdown/devicefields?id=${id}`,
				handleResponse: (res) => {
					setLoadingDeviceFields(false);
					setDeviceFields(res.data.message?.general_fields);
				},
				handleError: (err) => {
					setLoadingDeviceFields(false);
					console.error(err);
				},
			});
		};

		useEffect(() => {
			console.log("USEEFFECT", type, systemId, DeviceTypeField);
			if (type === "procedures" && systemId) getProcedures();
			else if (type === "system_values" && systemId) getSystemFields();
			else if (type === "device" && DeviceTypeField) {
				setLoadingDeviceFields(true);
				getDeviceFields(DeviceTypeField);
			}
		}, [type, systemId, DeviceTypeField]);

		return (
			<Space direction="vertical" style={{ width: "100%", color: "white" }}>
				<Typography.Title
					level={5}
					ellipsis={{
						tooltip: {
							title: systems?.find((x) => x.id === systemId).name,
							placement: "bottomLeft",
						},
					}}
					style={{
						color: "white",
						marginBottom: 0,
					}}
				>
					System: <br />
					{systems?.find((x) => x.id === systemId).name}
				</Typography.Title>
				<Typography.Title level={5} style={{ color: "white" }}>
					Assigning Field #{assignMode.index + 1}
				</Typography.Title>
				{systemId ? (
					<>
						<div>
							<label style={{ margin: "4px" }}>Select Type:</label>
							<Select
								value={type}
								onChange={(e) => setType(e)}
								placeholder="Select Type"
								style={{ width: "100%" }}
							>
								<Select.Option value="procedures">
									Procedure Results
								</Select.Option>
								<Select.Option value="device">Device Values</Select.Option>
								<Select.Option value="system_values">
									System Values
								</Select.Option>
								<Select.Option value="contract">Contract Values</Select.Option>
								<Select.Option value="building">Building Values</Select.Option>
								<Select.Option value="user">User Values</Select.Option>
							</Select>
						</div>
						{type === "device" ? (
							<>
								<div>
									<label style={{ margin: "4px" }}>Select Device Type</label>
									<Select
										showSearch
										value={DeviceTypeField}
										onChange={(e) => {
											setDeviceTypeField(e);
											getDeviceFields(e);
										}}
										placeholder="Select Device Type"
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
										{devicetypes?.map((dev, index) => (
											<Select.Option key={index} value={dev.id}>
												{dev.name}
											</Select.Option>
										))}
									</Select>
								</div>
								{DeviceTypeField &&
									(loadingDeviceFields ? (
										<span>
											<LoadingOutlined /> Loading Device Fields
										</span>
									) : (
										deviceFields !== undefined && (
											<div>
												<label style={{ margin: "4px" }}>
													Select Device Field
												</label>
												<Select
													showSearch
													value={deviceField}
													onChange={(e) => setDeviceField(e)}
													placeholder="Select Device Field"
													style={{ width: "100%" }}
													filterOption={(input, option) =>
														option?.children.toLowerCase().includes(input)
													}
													filterSort={(optionA, optionB) =>
														optionA?.children
															.toLowerCase()
															.localeCompare(optionB.children.toLowerCase())
													}
												>
													{(deviceFields || []).map((dev, index) => (
														<Select.Option key={index} value={dev.name}>
															{dev.name}
														</Select.Option>
													))}
												</Select>
											</div>
										)
									))}
							</>
						) : type === "procedures" ? (
							loadingProcedures ? (
								<span>
									<LoadingOutlined /> Loading Procedures
								</span>
							) : (
								<div>
									<label style={{ margin: "4px" }}>Select Procedure</label>
									<Select
										showSearch
										value={procedure}
										onChange={(e) => setProcedure(e)}
										placeholder="Select Procedure"
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
										{procedures?.map((proc, index) => (
											<Select.Option key={index} value={proc.id}>
												{`${proc.code} : ${proc.procedure}`}
											</Select.Option>
										))}
									</Select>
								</div>
							)
						) : type === "system_values" ? (
							systemFieldsLoading ? (
								<span>
									<LoadingOutlined /> Loading System Fields
								</span>
							) : (
								<div>
									<label style={{ margin: "4px" }}>Select a System Field</label>
									<Select
										showSearch
										value={systemField}
										onChange={(e) => setSystemField(e)}
										placeholder="Select System Field"
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
										{systemFields?.map((proc, index) => (
											<Select.Option key={index} value={proc.name}>
												{proc.name}
											</Select.Option>
										))}
									</Select>
								</div>
							)
						) : type === "building" ? (
							<div>
								<label style={{ margin: "4px" }}>Select a Building Field</label>
								<Select
									showSearch
									value={buildingField}
									onChange={(e) => setBuildingField(e)}
									placeholder="Select Building Field"
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
									{buildingFields.map((blg, index) => (
										<Select.Option key={index} value={blg.value}>
											{blg.label}
										</Select.Option>
									))}
								</Select>
							</div>
						) : type === "user" ? (
							<div>
								<label style={{ margin: "4px" }}>Select a User Field</label>
								<Select
									showSearch
									value={userField}
									onChange={(e) => setUserField(e)}
									placeholder="Select User Field"
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
									{userFields?.map((user, index) => (
										<Select.Option key={index} value={user.value}>
											{user.label}
										</Select.Option>
									))}
								</Select>
							</div>
						) : type === "contract" ? (
							<div>
								<label style={{ margin: "4px" }}>Select a Contract Field</label>
								<Select
									showSearch
									value={contractField}
									onChange={(e) => setContractField(e)}
									placeholder="Select Contract Field"
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
									{contractFields.map((blg, index) => (
										<Select.Option key={index} value={blg.value}>
											{blg.label}
										</Select.Option>
									))}
								</Select>
							</div>
						) : null}
					</>
				) : null}
				<Space>
					<Button onClick={() => setAssignMode(null)}>Cancel</Button>
					{(procedure ||
						systemField ||
						userField ||
						buildingField ||
						contractField ||
						deviceField) && (
						<Button type="primary" onClick={assign}>
							{assignedFields?.[selectedPage]?.[assignMode?.index]?.assigned
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
											(thumbnail.page === selectedPage ? "-selected" : "")
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
									assignedFields={assignedFields[page.page] || []}
									setAssignedFields={setAssignedFields}
									width={mainContent.current.clientWidth - 420}
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
							<Space direction="vertical" style={{ width: "100%" }}>
								{assignMode ? (
									<Assigner pageSystem={pageSystems?.[selectedPage] || 0} />
								) : (
									<>
										<Typography.Title
											level={5}
											ellipsis={{
												tooltip: {
													title: systems?.find((x) => x.id === systemId).name,
													placement: "bottomLeft",
												},
											}}
											style={{
												color: "white",
												marginBottom: 0,
											}}
										>
											System: <br />
											{systems?.find((x) => x.id === systemId).name}
										</Typography.Title>
										{/* <Select
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
										</Select> */}
										<Typography.Title
											level={5}
											style={{
												color: "white",
												marginBottom: 0,
											}}
										>
											Fields in this page:
										</Typography.Title>
										<Typography.Text style={{ color: "lightgray" }} italic>
											{assignedFields?.[selectedPage]?.length > 0
												? "Click on a field to assign/edit"
												: "No fields added"}
										</Typography.Text>
										{assignedFields?.[selectedPage]?.map((x, index) => (
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
													color={x.assigned ? "green" : "orange"}
													text={`Field #${index + 1}`}
												/>
											</div>
										))}
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
