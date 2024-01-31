import { FC, createContext, useState, useEffect } from "react";
import { Input, Row, Col } from "antd";
import NotificationTable from "./NotificationTable";
import { apiCall } from "../../axiosConfig";
import { useLoaderContext } from "../../Components/Layout";
import { NotificationContext } from "../../Helpers/Context";
const { Search } = Input;

const SuperUser: FC = () => {
	const [buildings, setBuildings] = useState([]);
	const [leadExecutors, setLeadExecutors] = useState([]);
	const [resources, setResources] = useState([]);
	const [employees, setEmployees] = useState([]);
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

	const getLEs = () => {
		apiCall({
			method: "GET",
			url: "/dropdown/leadexecutor",
			handleResponse: (res) => {
				console.log(res);
				setLeadExecutors(res.data.message);
			},
		});
	};

	const getResources = () => {
		apiCall({
			method: "GET",
			url: "/dropdown/resources",
			handleResponse: (res) => {
				console.log(res);
				setResources(res.data.message.resources);
			},
		});
	};

	const getEmployees = () => {
		apiCall({
			method: "GET",
			url: "/dropdown/resources",
			handleResponse: (res) => {
				console.log(res);
				setEmployees(res.data.message.employees);
			},
		});
	};

	useEffect(() => {
		let promises = [getBuildings(), getLEs(), getEmployees(), getResources()];

		Promise.all(promises).then(() => {
			completeLoading();
		});
	}, []);

	return (
		<NotificationContext.Provider
			value={{ buildings, leadExecutors, resources, employees }}
		>
			<Row>
				<Col span={24}>
					<NotificationTable />
				</Col>
			</Row>
		</NotificationContext.Provider>
	);
};

export default SuperUser;
