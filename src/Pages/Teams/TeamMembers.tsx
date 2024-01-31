import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Modal, Popconfirm, Table, message } from "antd";
import { FC, useState } from "react";
import { apiCall } from "../../axiosConfig";
import EditTeam from "./EditTeam";

type props = {
	users: Array<any>;
	teamId: any;
	getTeamDetails: Function;
};

const TeamMembers: FC<props> = ({ users, teamId, getTeamDetails }) => {
	const [open, setOpen] = useState(false);
	const columns = [
		{
			title: "User Id",
			dataIndex: "username",
		},
		{
			title: "Name",
			dataIndex: "name",
		},
	];

	return (
		<>
			<div className="team-view-buttons">
				<Button onClick={() => setOpen(true)} type="link">
					View Members
				</Button>
			</div>
			<Modal
				footer={false}
				style={{ top: "20px" }}
				open={open}
				title="Team Members"
				onCancel={() => setOpen(false)}
			>
				<EditTeam fetchData={getTeamDetails} assigned={users} id={teamId} />

				<br />
				<br />
				<Table dataSource={users} columns={columns} pagination={false} />
			</Modal>
		</>
	);
};

export default TeamMembers;
