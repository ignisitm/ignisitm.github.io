import {
	Button,
	Card,
	Checkbox,
	Col,
	Empty,
	Form,
	Row,
	Table,
	Tabs,
} from "antd";
import { CheckboxValueType } from "antd/es/checkbox/Group";
import { FC, useContext, useState } from "react";
import AddNewProcedure from "./AddNewProcedure";
import ProceduresTable from "./ProceduresTable";
import { AHJFormContext } from "../../../Helpers/Context";

interface props {
	systemId: number;
	ahj: number;
}

const FormCreatorMainSection: FC<props> = ({ systemId, ahj }) => {
	const [activeActivity, setActiveActivity] = useState<string>("inspection");
	const tabItems = [
		{
			label: "Inspection",
			key: "inspection",
		},
		{
			label: "Testing",
			key: "testing",
		},
		{
			label: "Maintenance",
			key: "maintenance",
		},
	];

	const onChange = (key: string) => {
		setActiveActivity(key);
	};

	return (
		<div className="tree-main">
			{systemId ? (
				<>
					{" "}
					<Tabs
						items={tabItems}
						onChange={onChange}
						defaultActiveKey="inspection"
					/>
					<ProceduresTable
						key={`${activeActivity}${systemId}`}
						system={systemId}
						activity={activeActivity}
						ahj={ahj}
					/>{" "}
				</>
			) : (
				<Empty
					description="Select a system to view"
					imageStyle={{ marginTop: 100 }}
				/>
			)}
		</div>
	);
};

export default FormCreatorMainSection;
