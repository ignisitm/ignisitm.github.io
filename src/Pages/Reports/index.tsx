import { FC, useEffect, useState } from "react";
import { useLoaderContext } from "../../Components/Layoutv2";
import { ReportContext } from "../../Helpers/Context";
import GenerateReport from "./GenerateReport";
import { apiCall } from "../../axiosConfig";
import GeneratedPdfViewer from "./PDFViewer/GeneratedPdfViewer";
import { Tabs } from "antd";
import KPIReport from "./KPIReport";

const Reports: FC = () => {
	const [ahj_pdfs, setAhj_pdfs] = useState<Array<any>>([]);
	const [buildings, setBuildings] = useState<Array<any>>([]);
	const [generatedPDF, setGeneratedPDF] = useState<any>(null);
	const { completeLoading } = useLoaderContext();

	const loadAll = () => {
		let promises = [getAHJpdfs(), getBuildings()];
		Promise.all(promises).then(() => {
			completeLoading();
		});
	};

	const getBuildings = () => {
		apiCall({
			method: "GET",
			url: "/dropdown/buildings",
			handleResponse: (res) => {
				console.log(res);
				setBuildings(res.data.message);
			},
		});
	};

	const getAHJpdfs = () => {
		apiCall({
			method: "GET",
			url: "/dropdown/ahj_pdf_list",
			handleResponse: (res) => {
				setAhj_pdfs(res.data.message);
			},
		});
	};

	useEffect(() => {
		loadAll();
	}, []);

	const tabItems = [
		{
			key: "ahj",
			label: "Generate AHJ Report",
			children: <GenerateReport setGeneratedPDF={setGeneratedPDF} />,
		},
		{
			key: "kpi",
			label: "View KPI Report",
			children: <KPIReport />,
		},
	];

	const onChange = (key: string) => {
		console.log(key);
	};

	return (
		<ReportContext.Provider value={{ ahj_pdfs, buildings }}>
			{generatedPDF ? (
				<GeneratedPdfViewer
					file={generatedPDF?.URL || ""}
					heading={generatedPDF?.heading || ""}
					filename={generatedPDF?.filename || "Report"}
					close={() => setGeneratedPDF(null)}
				/>
			) : null}
			<div style={generatedPDF ? { display: "none" } : {}}>
				<Tabs onChange={onChange} items={tabItems} destroyInactiveTabPane />
			</div>
		</ReportContext.Provider>
	);
};

export default Reports;
