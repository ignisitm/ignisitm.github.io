import { FC, useEffect } from "react";
import { Tabs } from "antd";
import SystemsTable from "./Components/SystemsTable";
import { useLoaderContext } from "../../Components/Layout";
import DeviceTable from "./Components/DevicesTable";
import AHJForms from "./Components/AHJForms";
import AHJ from "./Components/AHJ";
import SuperUser from "../SuperUser";

const tab_items = [
	{
		label: "Systems",
		key: "1",
		children: <SystemsTable />,
	},
	// {
	// 	label: "Devices",
	// 	key: "2",
	// 	children: <DeviceTable />,
	// },
	{
		label: "AHJ Forms",
		key: "3",
		children: <AHJ />,
	},
	{
		label: "Clients",
		key: "4",
		children: <SuperUser />,
	},
];
const Admin: FC = () => {
	const { completeLoading } = useLoaderContext();

	useEffect(() => {
		completeLoading();
	}, []);
	return (
		<div>
			<Tabs type="card" items={tab_items} />
		</div>
	);
};

export default Admin;
