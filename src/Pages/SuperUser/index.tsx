import { FC, createContext, useState, useEffect } from "react";
import { Input, Row, Col } from "antd";
import ClientTable from "./clientTable";
import { apiCall } from "../../axiosConfig";
import { useLoaderContext } from "../../Components/Layout";
import { SuperUserContext } from "../../Helpers/Context";
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
					<ClientTable />
				</Col>
			</Row>
		</SuperUserContext.Provider>
	);
};

export default SuperUser;
