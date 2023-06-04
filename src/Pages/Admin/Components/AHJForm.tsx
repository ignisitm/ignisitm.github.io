import { Form, Tabs } from "antd";
import { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FormCreator from "./FormCreator";

const AHJForm: FC = () => {
	let { id } = useParams();
	const [pageState, setPageState] = useState("new");
	const [heading, setHeading] = useState("Add a new Form: ");

	useEffect(() => {
		//PAGE LOADING
	}, []);

	return id ? (
		<div>
			<h2>{heading}</h2>
			<FormCreator ahj={parseInt(id)} />
		</div>
	) : null;
};

export default AHJForm;
