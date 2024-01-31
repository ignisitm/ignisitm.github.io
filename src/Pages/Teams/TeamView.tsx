import { Button, Card, Col, Empty, Row, Spin, Tree } from "antd";
import type { DataNode, TreeProps } from "antd/es/tree";
import TeamMembers from "./TeamMembers";
import { useState } from "react";
import { apiCall } from "../../axiosConfig";

type props = {
	team: any;
	loading: boolean;
	fetchTeamData: any;
};

const TeamView = ({ team, loading, fetchTeamData }: props) => {
	const [selectedAssignedBldgs, setSelectedAssignedBldgs] = useState<
		Array<any>
	>([]);
	const [selectedUnAssignedBldgs, setSelectedUnAssignedBldgs] = useState<
		Array<any>
	>([]);

	const onCheckAssign = (checkedKeys: any, info: any) => {
		console.log(checkedKeys);
		let keys = checkedKeys.filter((x: any) => typeof x === "number");
		setSelectedAssignedBldgs(keys);
	};

	const onCheckUnAssign = (checkedKeys: any, info: any) => {
		let keys = checkedKeys.filter((x: any) => typeof x === "number");
		setSelectedUnAssignedBldgs(keys);
	};

	const assignBuildings = () => {
		apiCall({
			method: "POST",
			url: "/clientteams",
			data: {
				team_id: team.id,
				assigned: selectedUnAssignedBldgs,
				unassigned: [],
			},
			handleResponse: (res) => {
				console.log(res);
				fetchTeamData(team.id);
			},
		});
	};

	const UnassignBuildings = () => {
		apiCall({
			method: "POST",
			url: "/clientteams",
			data: {
				team_id: team.id,
				assigned: [],
				unassigned: selectedAssignedBldgs,
			},
			handleResponse: (res) => {
				console.log(res);
				fetchTeamData(team.id);
			},
		});
	};

	return (
		<>
			{loading ? (
				<div className="team-view-empty">
					<Spin size="large" />
				</div>
			) : !team.id ? (
				<div className="team-view-empty">
					<Empty description="Select a Team to View" />
				</div>
			) : (
				<div className="team-view">
					<TeamMembers
						users={team.team_users}
						teamId={team.id}
						getTeamDetails={fetchTeamData}
					/>
					<h3>{team.id}</h3>
					<Row gutter={[12, 12]}>
						<Col span={12}>
							<Card
								className="team-card"
								title="Assigned Contracts"
								extra={<Button onClick={UnassignBuildings}>Remove</Button>}
							>
								<Tree
									height={290}
									checkable
									onCheck={onCheckAssign}
									treeData={team.assigned || []}
								/>
							</Card>
						</Col>
						<Col span={12}>
							<Card
								className="team-card"
								title="Unassigned Contracts"
								extra={<Button onClick={assignBuildings}>Assign</Button>}
							>
								<Tree
									height={290}
									checkable
									onCheck={onCheckUnAssign}
									treeData={team.unassigned || []}
								/>
							</Card>
						</Col>
					</Row>
				</div>
			)}
		</>
	);
};

export default TeamView;
