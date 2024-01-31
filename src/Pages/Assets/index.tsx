import { FC, createContext, useState, useEffect } from "react";
import { Input, Row, Col } from "antd";
import { apiCall } from "../../axiosConfig";
import { useLoaderContext } from "../../Components/Layout";
import { AssetContext } from "../../Helpers/Context";
import AssetTable from "./AssetTable";

const SuperUser: FC = () => {
	const [buildings, setBuildings] = useState([]);
	const [frequency, setFrequency] = useState([]);
	const { completeLoading } = useLoaderContext();

	useEffect(() => {
		let promises = [getBuildings(), getFrequency()];
		Promise.all(promises).then(() => {
			completeLoading();
		});
	}, []);

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

	const getFrequency = () => {
		apiCall({
			method: "GET",
			url: "/dropdown/frequency",
			handleResponse: (res) => {
				console.log(res);
				setFrequency(res.data.message);
			},
		});
	};

	return (
		<AssetContext.Provider value={{ buildings, frequency }}>
			<Row>
				<Col span={24}>
					<AssetTable />
				</Col>
			</Row>
		</AssetContext.Provider>
	);
};

export default SuperUser;
