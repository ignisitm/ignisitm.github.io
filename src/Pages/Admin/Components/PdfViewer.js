import { useLocation, useNavigate } from "react-router-dom";
import { useLoaderContext } from "../../../Components/Layout";
import * as pdfjsLib from "pdfjs-dist/webpack";
import { useEffect, useRef, useState } from "react";
import Canvas from "./Canvas";
import MainCanvas from "./MainCanvas";
import { Button, Space, Typography, message } from "antd";
import { CloseOutlined, SaveOutlined } from "@ant-design/icons";
import axios from "axios";
import { apiCall } from "../../../axiosConfig";

const PdfViewer = () => {
	pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsLib.PDFWorker;

	const { state } = useLocation();
	const navigate = useNavigate();
	const { ahj, heading, file } = state;
	const { completeLoading } = useLoaderContext();
	const mainContent = useRef();

	pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsLib.PDFWorker;
	const [thumbnails, setThumbnails] = useState([]);
	const [pages, setPages] = useState([]);
	const [pdfRef, setPdfRef] = useState();
	const [selectedPage, setSelectedPage] = useState(1);
	const [assigned, setAssigned] = useState({});
	const [saving, setSaving] = useState(false);

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

	useEffect(() => {
		console.log(file);
		let url = URL.createObjectURL(file);
		pdfjsLib
			.getDocument(url)
			.promise.then((doc) => {
				setPdfRef(doc);
				var pages = [];
				while (pages.length < doc.numPages) pages.push(pages.length + 1);
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
				while (pages.length < doc.numPages) pages.push(pages.length + 1);
				return Promise.all(
					pages.map((num) => {
						return doc.getPage(num).then((page) => {
							return { page: num, canvas: page };
						});
					})
				).then((res) => {
					setPages(res);
					completeLoading();
				});
			})
			.catch(console.error);
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

	const savePdf = (fields) => {
		fields = [{ test: "test" }, { test: "test" }];
		if (ahj && fields) {
			setSaving(true);
			uploadfile(file).then((filepath) => {
				console.log("filepath", fields);
				apiCall({
					url: "/AHJpdf",
					method: "POST",
					data: {
						ahj_id: ahj,
						fields,
						filepath,
					},
					handleResponse: (res) => {
						setSaving(false);
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
							style={{ marginRight: "7px" }}
						>
							Cancel
						</Button>{" "}
						<Button
							size="small"
							loading={saving}
							type="primary"
							style={{ marginRight: "10px" }}
							onClick={savePdf}
							icon={<SaveOutlined />}
						>
							Save
						</Button>
					</div>
				</Typography.Text>
			</div>
			<div className="pdf-view">
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

				<div className="pdf-main-view-wrapper">
					<div
						className="pdf-main-view"
						ref={mainContent}
						onResize={(e) => console.log(e)}
					>
						{pages.map((page, index) => (
							<MainCanvas
								key={index}
								width={mainContent.current.clientWidth - 100}
								style={
									selectedPage === page.page
										? { display: "flex" }
										: { display: "none" }
								}
								pdfRef={page.canvas}
							/>
						))}
					</div>
				</div>

				<div className="side-panel-wrapper">
					<div className="side-panel-contents"></div>
				</div>
			</div>
		</>
	);
};

export default PdfViewer;
