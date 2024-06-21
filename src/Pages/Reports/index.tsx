import { FC, useEffect, useState } from "react";
import { useLoaderContext } from "../../Components/Layoutv2";
import { ReportContext } from "../../Helpers/Context";
import GenerateReport from "./GenerateReport";
import { apiCall } from "../../axiosConfig";

const Reports: FC = () => {
	const [ahj_pdfs, setAhj_pdfs] = useState<Array<any>>([]);
	const [buildings, setBuildings] = useState<Array<any>>([]);
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

	return (
		<ReportContext.Provider value={{ ahj_pdfs, buildings }}>
			<GenerateReport />
		</ReportContext.Provider>
	);
};

export default Reports;
