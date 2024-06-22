import {
	CloseOutlined,
	DeleteOutlined,
	CopyOutlined,
	DownCircleFilled,
} from "@ant-design/icons";
import {
	Button,
	Dropdown,
	Space,
	FloatButton,
	Typography,
	Tooltip,
} from "antd";
import { useRef, useCallback, useEffect, useState } from "react";
import { useRefer } from "../../../Helpers/Refs";
import Draggable from "react-draggable";

const MainCanvas = ({
	pdfRef,
	style,
	pageNo,
	width,
	setAssignedFields,
	assignedFields,
	assigner,
}) => {
	const canvasRef = useRef();
	const [divW, setDivW] = useState(width);
	const [divH, setDivH] = useState(0);
	const [clipboard, setClipboard] = useState(null);
	const [rightClicked, setRightClicked] = useState(false);

	var cursorInCanvas = false;
	var canvasOfDoc = canvasRef?.current;

	const ctx = useRef();
	const startX = useRef();
	const startY = useRef();
	const rectH = useRef();
	const rectW = useRef();
	const pdf_image = useRef("");
	const zoomScale = useRef(1);

	const rightClickField = [
		{
			label: "Paste Here",
			key: "paste",
			disabled: clipboard === null,
			icon: <CopyOutlined />,
			onClick: () => pasteFromCB(),
		},
	];

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

	useEffect(() => {
		// console.log(assignedFields);
	}, [assignedFields]);

	const saveInitialCanvas = () => {
		if (canvasOfDoc?.getContext) {
			var canvasPic = new Image();
			canvasPic.src = canvasOfDoc.toDataURL();
			pdf_image.current = canvasPic;
		}
	};

	const pasteFromCB = () => {
		let newPointts = {
			startX: startX.current / divW - clipboard.w / 2,
			startY: startY.current / divH - clipboard.h / 2,
			rectW: clipboard.w,
			rectH: clipboard.h,
		};
		console.log(newPointts);
		setAssignedFields((prev) => ({
			...prev,
			...(pointExists(prev[pageNo], newPointts)
				? {}
				: {
						[pageNo]: [
							...(prev[pageNo] ? prev[pageNo] : []),
							newPointts,
						],
				  }),
		}));
		setRightClicked(false);
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

		rectH.current = 0;
		rectW.current = 0;
		cursorInCanvas = true;
	};

	const handleMouseOut = (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (cursorInCanvas) {
			if (ctx.current) {
				ctx.current?.clearRect(
					0,
					0,
					canvasOfDoc.width,
					canvasOfDoc.height
				);
				ctx.current?.drawImage(pdf_image.current, 0, 0);
			}
			if (rectH.current > 10 && rectW.current > 10) {
				let newPointts = {
					startX: startX.current / divW,
					startY: startY.current / divH,
					rectW: rectW.current / divW,
					rectH: rectH.current / divH,
				};
				setAssignedFields((prev) => ({
					...prev,
					...(pointExists(prev[pageNo], newPointts)
						? {}
						: {
								[pageNo]: [
									...(prev[pageNo] ? prev[pageNo] : []),
									newPointts,
								],
						  }),
				}));
			}
		}
		cursorInCanvas = false;
	};

	//test

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

	const pointExists = (arr, newPoints) => {
		if (!arr) return false;
		let idx = arr.findIndex(
			(x) =>
				x.startX === newPoints.startX &&
				x.startY === newPoints.startY &&
				x.rectW === newPoints.rectW &&
				x.rectH === newPoints.rectH
		);
		if (idx < 0) return false;
		else return true;
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
		setAssignedFields((prev) => {
			let curr_page = prev[pageNo];
			curr_page.splice(index, 1);
			return { ...prev, [pageNo]: [...curr_page] };
		});
	};

	const dragToPos = (idx, x, y) => {
		setAssignedFields((prev) => {
			let curr_page = prev[pageNo];
			curr_page[idx] = {
				...curr_page[idx],
				startX: x / divW,
				startY: y / divH,
			};
			return { ...prev, [pageNo]: [...curr_page] };
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
			<Dropdown
				onOpenChange={(open) => {
					setRightClicked(open);
				}}
				menu={{ items: rightClickField }}
				trigger={["contextMenu"]}
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
						style={{ position: "absolute" }}
					></canvas>
					{/* <FloatButton.Group shape="square" style={{ right: 94 }}>
					<FloatButton onClick={zoomIn} icon={<QuestionCircleOutlined />} />
					<FloatButton />
					<FloatButton icon={<SyncOutlined />} />
					<FloatButton.BackTop visibilityHeight={0} />
				</FloatButton.Group> */}
					{divH &&
						assignedFields.map((x, index) => (
							<Draggable
								defaultClassName={`div-blocks${
									x?.assigned ? "-assigned" : ""
								}`}
								defaultClassNameDragging={`div-blocks-dragging${
									x?.assigned ? "-assigned" : ""
								}`}
								defaultPosition={{
									x: x.startX * zoomScale.current * divW,
									y: x.startY * zoomScale.current * divH,
								}}
								onStop={(e, data) => {
									console.log(data.x, data.y);
									dragToPos(index, data.x, data.y);
								}}
								bounds="parent"
							>
								<div
									style={{
										position: "absolute",
										height: `${
											x.rectH * zoomScale.current * divH
										}px`,
										width: `${
											x.rectW * zoomScale.current * divW
										}px`,
										cursor: "move",
									}}
								>
									{x.rectW * divW > 25 * zoomScale.current ? (
										<Typography.Text
											strong
											style={{
												color: x?.assigned
													? "greenyellow"
													: "orange",
											}}
											l
										>
											{index + 1}
										</Typography.Text>
									) : (
										"."
									)}
									<Dropdown
										trigger={["click"]}
										key={index}
										menu={{
											items: [
												{
													key: "Field",
													label: (
														<>
															<Typography.Text
																strong
															>
																{`Field #${
																	index + 1
																} - `}
															</Typography.Text>
															{x?.assigned ? (
																<Typography.Text
																	style={{
																		color: "green",
																	}}
																>
																	Assigned
																</Typography.Text>
															) : (
																<Typography.Text
																	style={{
																		color: "orange",
																	}}
																>
																	Unassigned
																</Typography.Text>
															)}

															<br />
															<Typography.Text
																type="secondary"
																italic
															>
																Click to Edit
															</Typography.Text>
														</>
													),
													onClick: () =>
														assigner(index),
												},

												{
													type: "divider",
												},
												{
													key: "copy",
													label: "Copy",
													icon: <CopyOutlined />,
													onClick: () =>
														setClipboard({
															h: x.rectH,
															w: x.rectW,
														}),
												},
												{
													key: "delete",
													danger: true,
													label: "Delete Field",
													icon: <DeleteOutlined />,
													onClick: () => {
														deleteList(index);
													},
												},
												{
													key: "close",
													label: "Close",
													icon: <CloseOutlined />,
												},
											],
										}}
									>
										<Tooltip title="Click to Edit">
											<div
												className="more-options"
												style={
													x.rectW * divW > 25
														? { right: "5px" }
														: {}
												}
											>
												<DownCircleFilled />
											</div>
										</Tooltip>
									</Dropdown>
								</div>
							</Draggable>
						))}
					{clipboard && rightClicked && (
						<div
							className="div-blocks-preview"
							style={{
								position: "absolute",
								left: `${
									(startX.current -
										(clipboard.w * divW) / 2) *
									zoomScale.current
								}px`,
								top: `${
									(startY.current -
										(clipboard.h * divH) / 2) *
									zoomScale.current
								}px`,
								height: `${
									clipboard.h * zoomScale.current * divH
								}px`,
								width: `${
									clipboard.w * zoomScale.current * divW
								}px`,
								cursor: "pointer",
							}}
						/>
					)}
				</div>
			</Dropdown>
		</div>
	);
};

export default MainCanvas;
