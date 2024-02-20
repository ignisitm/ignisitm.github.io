import { FC, createContext, useState, useEffect } from "react";
import { Input, Row, Col } from "antd";
import { apiCall } from "../../axiosConfig";
import { useLoaderContext } from "../../Components/Layout";
import { SystemContext } from "../../Helpers/Context";
import SystemTable from "./SystemTable";
const { Search } = Input;

const SuperUser: FC = () => {
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
		<SystemContext.Provider
			value={{
				systemTypes: systemTypes,
				buildings: buildings,
				contracts: contracts,
			}}
		>
			<Row>
				<Col span={24}>
					<SystemTable />
				</Col>
			</Row>
		</SystemContext.Provider>
	);
};

export default SuperUser;
