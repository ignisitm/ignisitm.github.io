import React, { FC, useContext, useEffect, useState } from "react";
import {
	Button,
	Card,
	Col,
	DatePicker,
	Divider,
	Form,
	List,
	Row,
	Select,
	Typography,
	message,
} from "antd";
import { ReportContext } from "../../Helpers/Context";
import { apiCall } from "../../axiosConfig";
import { filter } from "lodash";
import { degrees, PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { LoadingOutlined } from "@ant-design/icons";

interface props {
	setGeneratedPDF: Function;
}

const GenerateReport: FC<props> = ({ setGeneratedPDF }) => {
	const [form] = Form.useForm();
	const [selectedBuilding, setSelectedBuilding] = useState<any>(null);
	const [selectedSystem, setSelectedSystem] = useState<any>(null);
	const contextVariables = useContext(ReportContext);
	const [systems, setSystems] = useState<any[]>([]);
	const [ahj_pdfs, setAhj_pdfs] = useState<any[]>([]);
	const [loadingSystems, setLoadingSystems] = useState(false);
	const [generating, setGenerating] = useState(-1);

	useEffect(() => {
		if (selectedBuilding) getSystems(selectedBuilding);
	}, [selectedBuilding]);

	useEffect(() => {
		if (selectedSystem) {
			if (selectedBuilding) {
				console.log(contextVariables.ahj_pdfs);
				console.log(selectedBuilding);
				console.log(selectedSystem);

				let sys_type = systems.find((x) => x.id === selectedSystem).type;

				let ahjs = filter(contextVariables.ahj_pdfs, (o) => {
					return [sys_type].includes(o.systemtype);
				});
				console.log(ahjs);
				setAhj_pdfs(ahjs);
			}
		}
	}, [selectedSystem]);

	const getSystems = (building_id: any) => {
		setSystems([]);
		setLoadingSystems(true);
		apiCall({
			method: "GET",
			url: `/dropdown/systems?building_id=${building_id}`,
			handleResponse: (res) => {
				console.log(res);
				setSystems(res.data.message);
				setLoadingSystems(false);
			},
			handleError: () => setLoadingSystems(false),
		});
	};

	const generatePDF = (pdf: number, date: any, item: any) =>
		new Promise((resolve, reject) => {
			apiCall({
				method: "GET",
				url: `/ClientReports?system_id=${selectedSystem}&report_id=${pdf}&date=${date}`,
				handleResponse: (res) => {
					console.log(res);
					let { URL, fields } = res.data.message;
					modifyPdf(URL, fields, resolve, item);
				},
				handleError: (err) => {
					resolve(err);
				},
			});
		});

	const generate = (pdf: number, index: number, item: any) => {
		form.validateFields().then((values) => {
			setGenerating(index);
			let date = values.generateDate.toISOString();
			generatePDF(pdf, date, item).then(() => {
				setGenerating(-1);
			});
		});
	};

	const saveByteArray = (reportName: any, byte: any) => {
		var blob = new Blob([byte], { type: "application/pdf" });
		var link = document.createElement("a");
		link.href = window.URL.createObjectURL(blob);
		var fileName = reportName;
		link.download = fileName;
		link.click();
	};

	async function modifyPdf(
		fileURL: any,
		assignedFields: any,
		resolve: any,
		item: any
	) {
		try {
			const url = fileURL;
			const existingPdfBytes = await fetch(url).then((res) =>
				res.arrayBuffer()
			);

			const pdfDoc = await PDFDocument.load(existingPdfBytes, {
				ignoreEncryption: true,
			});

			const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

			const pages = pdfDoc.getPages();

			assignedFields.map((pageObj: any, index: number) => {
				let page = parseInt(Object.keys(pageObj)[0]);
				console.log(pages, page);
				let curr = pages[page - 1];
				const { width, height } = curr.getSize();
				console.log(width, height);
				const size = 10;

				assignedFields[index][page.toString()].map((field: any) => {
					let text = field.result ? field.result?.toString() : "-";
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
			var blob = new Blob([pdfBytes], { type: "application/pdf" });
			let generatedURL = window.URL.createObjectURL(blob);
			// saveByteArray("Report", pdfBytes);
			let generated = {
				URL: generatedURL,
				heading: `${item.name} / ${item.filepath.name}`,
				filename: item.filepath.name,
			};
			setGeneratedPDF(generated);
		} catch (err) {
			console.error(err);
			message.error("Some Error Occured!");
		} finally {
			resolve("Success");
		}
	}

	return (
		<>
			<Card title="Generate a New Report">
				<Form
					form={form}
					preserve={false}
					name="generateForm"
					autoComplete="off"
					labelCol={{ span: 24, style: { paddingTop: 3 } }}
					wrapperCol={{ span: 24 }}
				>
					<Row>
						<Col span={11} style={{ marginRight: "10px" }}>
							<Form.Item
								label="Select Date"
								name="generateDate"
								rules={[
									{
										required: true,
										message: "Please select date!",
									},
								]}
							>
								<DatePicker format={"DD/MM/YYYY"} style={{ width: "100%" }} />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item
								name="building_id"
								label="Select Building"
								rules={[
									{
										required: true,
										message: "Please select a Building",
									},
								]}
							>
								<Select
									showSearch
									allowClear={true}
									onChange={(e) => setSelectedBuilding(e)}
									placeholder="Search to Select"
									optionFilterProp="children"
									filterOption={(input, option) =>
										(option!.children as unknown as string)
											.toLowerCase()
											.includes(input)
									}
									filterSort={(optionA, optionB) =>
										(optionA!.children as unknown as string)
											.toLowerCase()
											.localeCompare(
												(optionB!.children as unknown as string).toLowerCase()
											)
									}
								>
									{contextVariables.buildings?.map(
										(
											item: {
												id: number;
												building_name: string;
											},
											index: number
										) => (
											<Select.Option value={item.id}>
												{item.building_name}
											</Select.Option>
										)
									)}
								</Select>
							</Form.Item>
						</Col>
					</Row>
					<Form.Item
						name="system_id"
						label="Select System"
						rules={[
							{
								required: true,
								message: "Please select a System",
							},
						]}
					>
						<Select
							showSearch
							allowClear={true}
							loading={loadingSystems}
							onChange={(e) => {
								if (e) setSelectedSystem(e);
								else setSelectedSystem(null);
							}}
							placeholder="Search to Select"
							optionFilterProp="children"
							filterOption={(input, option) =>
								(option!.children as unknown as string)
									.toLowerCase()
									.includes(input)
							}
							filterSort={(optionA, optionB) =>
								(optionA!.children as unknown as string)
									.toLowerCase()
									.localeCompare(
										(optionB!.children as unknown as string).toLowerCase()
									)
							}
						>
							{systems?.map(
								(
									item: {
										id: object;
										name: string;
										tag: string;
										type: number;
									},
									index: number
								) => (
									<Select.Option value={item.id}>
										{`${item.name} - ${item.tag}`}
									</Select.Option>
								)
							)}
						</Select>
					</Form.Item>
					<Typography.Title level={5}>
						Available Report Formats:
					</Typography.Title>
					{selectedBuilding && selectedSystem ? (
						ahj_pdfs && ahj_pdfs?.length > 0 ? (
							<>
								<Typography.Text type="secondary">
									{`Click on a report format to Generate it`}
								</Typography.Text>
								<Divider />
								<List
									grid={{
										gutter: 16,
										xs: 1,
										sm: 2,
										md: 4,
										lg: 4,
										xl: 6,
										xxl: 3,
									}}
									dataSource={ahj_pdfs}
									renderItem={(item, index) => (
										<List.Item>
											<Card style={{ minHeight: "100px" }} title={item.name}>
												{generating === index ? (
													// <>
													// 	<Typography.Text type="secondary">
													// 		{"Generating  "}
													// 		<LoadingOutlined />
													// 	</Typography.Text>
													// </>
													<Button type="link" loading={true}>
														Generating
													</Button>
												) : (
													<Button
														type="link"
														onClick={() => generate(item.id, index, item)}
													>
														{item.filepath.name}
													</Button>
												)}
											</Card>
										</List.Item>
									)}
								/>
							</>
						) : (
							<Typography.Text type="secondary">
								{`No available report formats for the selected system`}
							</Typography.Text>
						)
					) : (
						<Typography.Text type="secondary">
							{`Select building and system to view available report formats`}
						</Typography.Text>
					)}
				</Form>
			</Card>
		</>
	);
};

export default GenerateReport;
