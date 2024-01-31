import { Button, Transfer } from "antd";
import type { TransferDirection } from "antd/es/transfer";
import React, { useEffect, useState } from "react";
import { tokenToString } from "typescript";

interface props {
	users: any;
	enable: Function;
	setAssignedUsers: Function;
}

const UserTransfer: React.FC<props> = ({ users, enable, setAssignedUsers }) => {
	const [targetKeys, setTargetKeys] = useState<string[]>([]);
	const [availableLeader, setAL] = useState<string[]>([]);
	const [leader, setLeader] = useState("");

	useEffect(() => {
		console.log(users);
	}, []);

	const filterOption = (inputValue: string, option: any) =>
		option.name.indexOf(inputValue) > -1;

	const handleChange = (newTargetKeys: string[]) => {
		if (newTargetKeys.length > 0) enable(false);
		else enable(true);
		setTargetKeys(newTargetKeys);
		let assignedNewUsers: any = [];
		newTargetKeys.map((x) => {
			let user = users.find((user: any) => user.key === x);
			assignedNewUsers.push({ subject_id: user.id, type: "employee" });
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
				onSelectChange={(ssk, tsk) => {
					setAL(tsk);
				}}
				render={(item) => (
					<>
						{item.name} {item.user ? "(User)" : ""}
					</>
				)}
			/>
			<Button
				type="link"
				disabled={availableLeader.length === 1 ? false : true}
				style={{ float: "right" }}
				onClick={() => {
					let new_leader = users.find((x: any) => x.key === availableLeader[0]);
					setLeader(new_leader?.name || "");
				}}
			>
				{leader ? leader + " (Lead)" : "Assign as Leader"}
			</Button>
			<br />
		</>
	);
};

export default UserTransfer;
