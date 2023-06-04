import React, { Children, useEffect, useMemo, useState } from "react";
import { Card, Col, Input, Row, Spin, Tabs, Tree } from "antd";
import type { DataNode } from "antd/es/tree";
import { apiCall } from "../../../axiosConfig";
import type { MenuProps } from "antd";
import { Menu } from "antd";
import FormCreatorMainSection from "./FormCreatorMainSection";
import { useLoaderContext } from "../../../Components/Layout";

type MenuItem = Required<MenuProps>["items"][number];
function getItem(
	label: React.ReactNode,
	key: React.Key,
	icon?: React.ReactNode,
	children?: MenuItem[],
	type?: "group"
): MenuItem {
	return {
		key,
		icon,
		children,
		label,
		type,
	} as MenuItem;
}

interface props {
	ahj: number;
}

const FormCreator: React.FC<props> = ({ ahj }) => {
	const [items, setItems] = useState<MenuProps["items"]>([]);
	const [systems, setSystems] = useState<any>([]);
	const [selectedKey, setSelectedKey] = useState<any>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const { completeLoading } = useLoaderContext();

	useEffect(() => {
		apiCall({
			method: "GET",
			url: "/dropdown/systemtypes",
			handleResponse: (res) => {
				let response = res.data.message;
				setSystems(res.data.message);
				let items: MenuProps["items"] = [];
				if (Array.isArray(response)) {
					response.map((sys) => {
						items?.push(getItem(sys.name, sys.id));
					});
					setItems(items);
				}
				completeLoading();
				setIsLoading(false);
			},
		});
	}, []);

	const onClick: MenuProps["onClick"] = (e) => {
		console.log("click ", e.key);
		setSelectedKey(parseInt(e.key));
	};

	return (
		<Card>
			<div className="tree-with-details">
				{isLoading ? (
					<div className="loader-container">
						<Spin tip="Loading">
							<span />
						</Spin>
					</div>
				) : (
					<>
						<div className="tree-menu">
							<h4>Select a System :</h4>
							<Menu onClick={onClick} items={items} />
						</div>
						<FormCreatorMainSection ahj={ahj} systemId={selectedKey} />
					</>
				)}
			</div>
		</Card>
	);
};

export default FormCreator;
