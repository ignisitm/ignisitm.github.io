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
	Row,
	Col,
	Tooltip,
	Divider,
	theme,
} from "antd";
import { useRef, useCallback, useEffect, useState, cloneElement } from "react";
import { useRefer } from "../../../Helpers/Refs";
import Draggable from "react-draggable";

const { useToken } = theme;

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

	const { token } = useToken();

	const contentStyle = {
		backgroundColor: token.colorBgElevated,
		borderRadius: token.borderRadiusLG,
		boxShadow: token.boxShadowSecondary,
	};

	const menuStyle = {
		boxShadow: "none",
	};

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
			startX: startX.current / divW,
			startY: (startY.current - (0.03 * divH) / 2) / divH,
			rectW: clipboard.w,
			rectH: clipboard.h,
			fontSize: clipboard.fontSize,
			text: clipboard.text,
		};
		console.log(newPointts);
		setAssignedFields((prev) => ({
			...prev,
			...(pointExists(prev[pageNo], newPointts)
				? {}
				: {
						[pageNo]: [...(prev[pageNo] ? prev[pageNo] : []), newPointts],
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
				ctx.current?.clearRect(0, 0, canvasOfDoc.width, canvasOfDoc.height);
				ctx.current?.drawImage(pdf_image.current, 0, 0);
			}
			if (e.detail === 1) document.activeElement.blur();
			else if (e.detail === 2) {
				let newPointts = {
					startX: startX.current / divW,
					startY: (startY.current - (0.03 * divH) / 2) / divH,
					rectW: 0.15,
					rectH: 0.03,
					fontSize: 12 / divH,
					text: null,
				};
				setAssignedFields((prev) => ({
					...prev,
					...(pointExists(prev[pageNo], newPointts)
						? {}
						: {
								[pageNo]: [...(prev[pageNo] ? prev[pageNo] : []), newPointts],
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
		// if (ctx.current) {
		// 	ctx.current?.clearRect(0, 0, canvasOfDoc.width, canvasOfDoc.height);
		// 	ctx.current?.drawImage(pdf_image.current, 0, 0);
		// 	ctx.current.beginPath();
		// 	ctx.current.rect(startX.current, startY.current, width, height);
		// 	ctx.current.strokeStyle = "rgba(255, 99, 71, 0.9)";
		// 	ctx.current.lineWidth = 1;
		// 	ctx.current.stroke();
		// }
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

	const increaseFont = (idx) => {
		setAssignedFields((prev) => {
			let curr_page = prev[pageNo];
			curr_page[idx] = {
				...curr_page[idx],
				fontSize: curr_page[idx].fontSize + 1 / divH,
			};
			return { ...prev, [pageNo]: [...curr_page] };
		});
	};

	const decreaseFont = (idx) => {
		setAssignedFields((prev) => {
			let curr_page = prev[pageNo];
			curr_page[idx] = {
				...curr_page[idx],
				fontSize: curr_page[idx].fontSize - 1 / divH,
			};
			return { ...prev, [pageNo]: [...curr_page] };
		});
	};

	const addTextToObj = (idx, text) => {
		setAssignedFields((prev) => {
			let curr_page = prev[pageNo];
			curr_page[idx] = {
				...curr_page[idx],
				text,
			};
			return { ...prev, [pageNo]: [...curr_page] };
		});
		console.log(assignedFields);
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
						cursor: "pointer",
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
								defaultClassName={`div-blocks-input`}
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
										height: `${x.rectH * zoomScale.current * divH}px`,
										cursor: "move",
									}}
								>
									<Dropdown
										trigger={["click"]}
										dropdownRender={(menu) => (
											<div style={contentStyle}>
												<Row
													gutter={2}
													style={{ padding: "5px", paddingBottom: "0px" }}
												>
													<Col span={12}>
														<Button onClick={() => increaseFont(index)} block>
															A+
														</Button>
													</Col>
													<Col span={12}>
														<Button onClick={() => decreaseFont(index)} block>
															A-
														</Button>
													</Col>
												</Row>
												{cloneElement(menu, { style: menuStyle })}
											</div>
										)}
										key={index}
										menu={{
											items: [
												{
													key: "copy",
													label: "Copy",
													icon: <CopyOutlined />,
													onClick: () =>
														setClipboard({
															h: x.rectH,
															w: x.rectW,
															text: x.text,
															fontSize: x.fontSize,
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
											<span className="more-options-input">
												<DownCircleFilled />
											</span>
										</Tooltip>
									</Dropdown>
									<span
										style={{ fontSize: `${x.fontSize * divH}px` }}
										contentEditable
										tabIndex={-1}
										onBlur={(e) => addTextToObj(index, e.target.innerText)}
										placeholder="Add Text..."
									>
										{x.text}
									</span>
								</div>
							</Draggable>
						))}
					{clipboard && rightClicked && (
						<div
							className="div-blocks-preview"
							style={{
								position: "absolute",
								left: `${startX.current * zoomScale.current}px`,
								top: `${
									(startY.current - (0.03 * divH) / 2) * zoomScale.current
								}px`,
								height: `${clipboard.h * zoomScale.current * divH}px`,
								width: `${clipboard.w * zoomScale.current * divW}px`,
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
