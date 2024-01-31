import {
	DeleteOutlined,
	QuestionCircleOutlined,
	SyncOutlined,
} from "@ant-design/icons";
import { Button, Dropdown, Space, FloatButton } from "antd";
import { useRef, useCallback, useEffect, useState } from "react";
import { useRefer } from "../../../Helpers/Refs";

const MainCanvas = ({ pdfRef, style, width }) => {
	const canvasRef = useRef();
	const [divW, setDivW] = useState(width);
	const [divH, setDivH] = useState(0);
	const [assigned, setAssigned] = useState([]);

	var cursorInCanvas = false;
	var canvasOfDoc = canvasRef?.current;

	const ctx = useRef();
	const startX = useRef();
	const startY = useRef();
	const rectH = useRef();
	const rectW = useRef();
	const pdf_image = useRef("");
	const zoomScale = useRef(1);

	const renderPage = useCallback(
		(page) => {
			const canvas = canvasRef.current;
			const viewport = page.getViewport({
				scale: divW / page.getViewport({ scale: 1 }).width,
			});
			canvas.height = viewport?.height;
			canvas.width = viewport?.width;
			setDivH(canvas.height);
			setDivW(canvas.width);
			const renderContext = {
				canvasContext: canvas?.getContext("2d"),
				viewport: viewport,
				textContent: pdfRef,
			};

			const renderTask = page.render(renderContext);

			renderTask.promise.catch((err) => console.log("mainC: ", err));
		},
		[pdfRef, zoomScale]
	);

	useEffect(() => {
		canvasOfDoc?.addEventListener("mousedown", (e) => {
			handleMouseIn(e);
		});
		canvasOfDoc?.addEventListener("mousemove", (e) => {
			handleMouseMove(e);
		});
		canvasOfDoc?.addEventListener("mouseup", (e) => {
			handleMouseOut(e);
		});
		canvasOfDoc?.addEventListener("mouseout", (e) => {
			handleMouseOut(e);
		});
		return () => {
			canvasOfDoc?.removeEventListener("mousedown", (e) => {
				handleMouseIn(e);
			});
			canvasOfDoc?.removeEventListener("mousemove", (e) => {
				handleMouseMove(e);
			});
			canvasOfDoc?.removeEventListener("mouseup", (e) => {
				handleMouseOut(e);
			});
			canvasOfDoc?.removeEventListener("mouseout", (e) => {
				handleMouseOut(e);
			});
		};
	}, [canvasOfDoc]);

	useEffect(() => {
		if (canvasOfDoc) {
			ctx.current = canvasOfDoc.getContext("2d");
		}
	}, [canvasOfDoc, pdfRef, renderPage]);

	useEffect(() => {
		if (pdfRef) renderPage(pdfRef);
	}, [pdfRef]);

	useEffect(() => {
		console.log(width);
	}, [width]);

	const saveInitialCanvas = () => {
		if (canvasOfDoc?.getContext) {
			var canvasPic = new Image();
			canvasPic.src = canvasOfDoc.toDataURL();
			pdf_image.current = canvasPic;
		}
	};

	const handleMouseIn = (e) => {
		if (typeof pdf_image.current == "string") {
			saveInitialCanvas();
		}
		e.preventDefault();
		e.stopPropagation();
		startX.current =
			((e.offsetX * canvasOfDoc.width) / canvasOfDoc.clientWidth) | 0;
		startY.current =
			((e.offsetY * canvasOfDoc.width) / canvasOfDoc.clientWidth) | 0;

		rectH.current = 25;
		rectW.current = 130;
		cursorInCanvas = true;
	};

	const handleMouseOut = (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (cursorInCanvas) {
			if (ctx.current) {
				ctx.current?.clearRect(0, 0, canvasOfDoc.width, canvasOfDoc.height);
				ctx.current?.drawImage(pdf_image.current, 0, 0);
			}
			setAssigned((prev) => [
				...prev,
				{
					startX: startX.current,
					startY: startY.current,
					rectW: rectW.current,
					rectH: rectH.current,
				},
			]);
		}
		cursorInCanvas = false;
	};

	const handleMouseMove = (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (!cursorInCanvas) {
			return;
		}
		let mouseX =
			((e.offsetX * canvasOfDoc.width) / canvasOfDoc.clientWidth) | 0;
		let mouseY =
			((e.offsetY * canvasOfDoc.width) / canvasOfDoc.clientWidth) | 0;

		var width = mouseX - startX.current;
		var height = mouseY - startY.current;
		rectW.current = width;
		rectH.current = height;
		if (ctx.current) {
			ctx.current?.clearRect(0, 0, canvasOfDoc.width, canvasOfDoc.height);
			ctx.current?.drawImage(pdf_image.current, 0, 0);
			ctx.current.beginPath();
			ctx.current.rect(startX.current, startY.current, width, height);
			ctx.current.strokeStyle = "rgba(255, 99, 71, 0.9)";
			ctx.current.lineWidth = 1;
			ctx.current.stroke();
		}
	};

	const clearcanvas = () => {
		if (ctx.current) {
			let current_transform = ctx.current.getTransform();
			ctx.current.setTransform(
				zoomScale.current + 0.1,
				0,
				0,
				zoomScale.current + 0.1,
				0,
				0
			);
			ctx.current.clearRect(
				0,
				0,
				canvasOfDoc.width * zoomScale.current,
				canvasOfDoc.height * zoomScale.current
			);
			ctx.current.setTransform(current_transform);
		}
	};

	const zoomIn = () => {
		clearcanvas();
		zoomScale.current = zoomScale.current + 0.1;
		renderPage(pdfRef);
	};

	const deleteList = (index) => {
		setAssigned((arr) => {
			arr.splice(index, 1);
			return [...arr];
		});
	};

	return (
		<div
			className="main-canvas"
			style={{
				...(style || {}),
				...{ justifyContent: "center" },
			}}
		>
			<div
				style={{
					position: "absolute",
					zIndex: 3,
					height: `${divH}px`,
					width: `${divW}px`,
					cursor: "crosshair",
				}}
			>
				<canvas
					onMouseDown={(e) => {
						handleMouseIn(e);
					}}
					onMouseUp={(e) => {
						handleMouseOut(e);
					}}
					onMouseMove={(e) => {
						handleMouseMove(e);
					}}
					onMouseOut={(e) => {
						handleMouseOut(e);
					}}
					ref={canvasRef}
					width={"100%"}
				></canvas>
				<FloatButton.Group shape="square" style={{ right: 94 }}>
					<FloatButton onClick={zoomIn} icon={<QuestionCircleOutlined />} />
					<FloatButton />
					<FloatButton icon={<SyncOutlined />} />
					<FloatButton.BackTop visibilityHeight={0} />
				</FloatButton.Group>
				{assigned.map((x, index) => (
					<Dropdown
						trigger={["click"]}
						key={index}
						menu={{
							items: [
								{
									key: "delete",
									danger: true,
									label: "Delete Field",
									icon: <DeleteOutlined />,
									onClick: () => {
										deleteList(index);
									},
								},
							],
						}}
					>
						<div
							className="div-blocks"
							style={{
								position: "absolute",
								left: `${x.startX * zoomScale.current}px`,
								top: `${x.startY * zoomScale.current}px`,
								height: `${x.rectH * zoomScale.current}px`,
								width: `${x.rectW * zoomScale.current}px`,
								cursor: "pointer",
							}}
						>
							<input
								onClick={(e) => {
									e.stopPropagation();
								}}
								className="div-block-input"
								placeholder="Enter code"
							/>
						</div>
					</Dropdown>
				))}
			</div>
		</div>
	);
};

export default MainCanvas;
