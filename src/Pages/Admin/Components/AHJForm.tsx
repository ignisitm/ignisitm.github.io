import { Form, Tabs, Tooltip, Button, Row, Col } from "antd";
import { FC, useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import FormCreator from "./FormCreator";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useLoaderContext } from "../../../Components/Layout";
import { AHJFormContext } from "../../../Helpers/Context";
import { apiCall } from "../../../axiosConfig";

const AHJForm: FC = () => {
	let { id } = useParams();
	const [pageState, setPageState] = useState("new");
	const { state } = useLocation();
	const [heading, setHeading] = useState("Add a new Form: ");
	const { completeLoading } = useLoaderContext();
	const [frequencies, setFrequencies] = useState([]);

	useEffect(() => {
		getFrequencies();
	}, []);

	const getFrequencies = () => {
		apiCall({
			method: "GET",
			url: "/dropdown/frequency",
			handleResponse: (res) => {
				console.log(res);
				setFrequencies(res.data.message);
				completeLoading();
			},
			handleError: () => {
				completeLoading();
			},
		});
	};

	return id ? (
		<AHJFormContext.Provider value={{ frequencies }}>
			<FormCreator ahj={parseInt(id)} heading={state?.heading || heading} />
		</AHJFormContext.Provider>
	) : null;
};

export default AHJForm;
