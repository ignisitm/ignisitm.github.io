import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import * as pdfjsLib from "pdfjs-dist";
import { Drawer, Spin, message } from "antd";
import "antd/dist/reset.css";
import { apiCall } from "../../../axiosConfig";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function PdfViewerFromURL() {
	const { state } = useLocation();
	const { ahj, heading, file, editMode, systemId } = state;
	const containerRef = useRef();
	const [fileURL, setFileURL] = useState(null);
	const [pages, setPages] = useState([]);
	const [selectedField, setSelectedField] = useState(null);
	const [loading, setLoading] = useState(true);

	// Load file URL from API using apiCall
	useEffect(() => {
		if (!editMode) {
			setFileURL(URL.createObjectURL(file));
			return;
		}

		apiCall({
			method: "GET",
			url: `/AHJpdf/${file.id}`,
			handleResponse: (res) => {
				const url = res.data.message.url;
				setFileURL(url);
			},
			handleError: (err) => {
				console.error(err);
				message.error("Failed to fetch PDF URL");
			},
		});
	}, [file, editMode]);

	// Load PDF and pages
	useEffect(() => {
		if (!fileURL) return;

		const loadPdf = async () => {
			try {
				const loadingTask = pdfjsLib.getDocument({ url: fileURL });
				const pdf = await loadingTask.promise;

				const pagePromises = [];
				for (let i = 1; i <= pdf.numPages; i++) {
					pagePromises.push(pdf.getPage(i));
				}

				const loadedPages = await Promise.all(pagePromises);
				setPages(loadedPages);
				setLoading(false);
			} catch (err) {
				console.error(err);
				message.error("Failed to load PDF");
				setLoading(false);
			}
		};

		loadPdf();
	}, [fileURL]);

	// Render pages with clickable fields
	useEffect(() => {
		if (!pages.length) return;

		const container = containerRef.current;
		container.innerHTML = "";

		pages.forEach(async (page, pageIndex) => {
			const viewport = page.getViewport({ scale: 1.2 });

			const canvas = document.createElement("canvas");
			canvas.width = viewport.width;
			canvas.height = viewport.height;
			const ctx = canvas.getContext("2d");

			const pageDiv = document.createElement("div");
			pageDiv.style.position = "relative";
			pageDiv.style.marginBottom = "20px";
			pageDiv.appendChild(canvas);
			container.appendChild(pageDiv);

			await page.render({ canvasContext: ctx, viewport }).promise;

			// Get annotations (form fields)
			const annotations = await page.getAnnotations();
			annotations
				.filter((ann) => ann.subtype === "Widget" && ann.fieldName)
				.forEach((ann) => {
					const [x1, y1, x2, y2] = pdfjsLib.Util.normalizeRect(ann.rect);

					const el = document.createElement("div");
					el.style.position = "absolute";
					el.style.left = `${x1}px`;
					el.style.top = `${viewport.height - y2}px`; // invert Y
					el.style.width = `${x2 - x1}px`;
					el.style.height = `${y2 - y1}px`;
					el.style.background = "rgba(0,0,255,0.15)";
					el.style.cursor = "pointer";
					el.onclick = () => setSelectedField({ ...ann, page: pageIndex + 1 });

					pageDiv.appendChild(el);
				});
		});
	}, [pages]);

	return (
		<div style={{ display: "flex", height: "100vh" }}>
			{/* PDF Viewer */}
			<div
				ref={containerRef}
				style={{
					flex: 1,
					overflowY: "auto",
					background: "#f0f2f5",
					padding: 10,
				}}
			>
				{loading && <Spin style={{ marginTop: 50 }} />}
			</div>

			{/* Drawer */}
			<Drawer
				title="Field Details"
				placement="right"
				width={320}
				onClose={() => setSelectedField(null)}
				open={!!selectedField}
			>
				{selectedField && (
					<>
						<p>
							<strong>Name:</strong> {selectedField.fieldName}
						</p>
						<p>
							<strong>Type:</strong> {selectedField.fieldType || "Unknown"}
						</p>
						<p>
							<strong>Page:</strong> {selectedField.page}
						</p>
						<p>
							<strong>Rect:</strong> {JSON.stringify(selectedField.rect)}
						</p>
					</>
				)}
			</Drawer>
		</div>
	);
}
