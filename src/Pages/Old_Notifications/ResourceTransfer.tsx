import { Button, Transfer } from "antd";
import type { TransferDirection } from "antd/es/transfer";
import React, { useEffect, useState } from "react";
import { tokenToString } from "typescript";

interface props {
	users: any;
	setAssignedUsers: Function;
}

const ResourceTransfer: React.FC<props> = ({ users, setAssignedUsers }) => {
	const [targetKeys, setTargetKeys] = useState<string[]>([]);

	useEffect(() => {
		console.log(users);
	}, []);

	const filterOption = (inputValue: string, option: any) =>
		option.name.indexOf(inputValue) > -1;

	const handleChange = (newTargetKeys: string[]) => {
		setTargetKeys(newTargetKeys);
		let assignedNewUsers: any = [];
		newTargetKeys.map((x) => {
			let user = users.find((user: any) => user.key === x);
			assignedNewUsers.push({ subject_id: user.id, type: "resource" });
		});
		setAssignedUsers(assignedNewUsers);
		console.log(assignedNewUsers);
	};

	const handleSearch = (dir: TransferDirection, value: string) => {
		console.log("search:", dir, value);
	};

	return (
		<>
			<Transfer
				style={{ width: "100%" }}
				listStyle={{ width: "100%" }}
				dataSource={users}
				showSearch
				titles={[
					<label style={{ fontWeight: "bold" }}>Available</label>,
					<label style={{ fontWeight: "bold" }}>Assigned</label>,
				]}
				locale={{ itemUnit: "user", itemsUnit: "users" }}
				filterOption={filterOption}
				targetKeys={targetKeys}
				onChange={handleChange}
				onSearch={handleSearch}
				render={(item) => <>{item.name}</>}
			/>
			<br />
		</>
	);
};

export default ResourceTransfer;
