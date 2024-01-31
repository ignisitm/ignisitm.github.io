import { FC, createContext, useState, useEffect } from "react";
import { Input, Row, Col } from "antd";
import { apiCall } from "../../axiosConfig";
import { SuperUserContext } from "../../Helpers/Context";
import ContractsTable from "./ContractsTable";
import { useLoaderContext } from "../../Components/Layout";
const { Search } = Input;

const SuperUser: FC = () => {
	const [countries, setCountries] = useState([]);
	const { completeLoading } = useLoaderContext();

	useEffect(() => {
		apiCall({
			method: "GET",
			url: "/dropdown/countries",
			handleResponse: (res) => {
				console.log(res);
				setCountries(res.data.message);
				completeLoading();
			},
		});
	}, []);

	return (
		<SuperUserContext.Provider value={{ countries: countries }}>
			<Row>
				<Col span={24}>
					<ContractsTable />
				</Col>
			</Row>
		</SuperUserContext.Provider>
	);
};

export default SuperUser;
