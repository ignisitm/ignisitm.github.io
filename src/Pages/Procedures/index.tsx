import { FC, createContext, useState, useEffect } from "react";
import { Input, Row, Col } from "antd";
import { apiCall } from "../../axiosConfig";
import { useLoaderContext } from "../../Components/Layout";
import { ProcedureContext } from "../../Helpers/Context";
import ProcedureTable from "./ProcedureTable";
const { Search } = Input;

const Procedures: FC = () => {
	const [systemTypes, setSystemTypes] = useState([]);
	const [buildings, setBuildings] = useState([]);
	const [contracts, setContracts] = useState([]);
	const { completeLoading } = useLoaderContext();

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

	const getSystemTypes = () => {
		apiCall({
			method: "GET",
			url: "/dropdown/systemtypes",
			handleResponse: (res) => {
				console.log(res);
				setSystemTypes(res.data.message);
			},
		});
	};

	const getContracts = () => {
		apiCall({
			method: "GET",
			url: "/dropdown/contracts",
			handleResponse: (res) => {
				console.log(res);
				setContracts(res.data.message);
			},
		});
	};

	useEffect(() => {
		let promises = [getBuildings(), getSystemTypes(), getContracts()];
		Promise.all(promises).then(() => {
			completeLoading();
		});
	}, []);

	return (
		<ProcedureContext.Provider
			value={{
				systemTypes: systemTypes,
				buildings: buildings,
				contracts: contracts,
			}}
		>
			<Row>
				<Col span={24}>
					<ProcedureTable />
				</Col>
			</Row>
		</ProcedureContext.Provider>
	);
};

export default Procedures;
