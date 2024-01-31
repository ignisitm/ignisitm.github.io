import { useContext, useEffect, useState } from "react";
import { TeamContext } from "../../Helpers/Context";
import { Button, Input, Menu, Spin, message } from "antd";
import { apiCall } from "../../axiosConfig";
import { PlusOutlined } from "@ant-design/icons";
import AddNewTeam from "./AddNewTeam";

type props = {
	selectTeam: Function;
	setLoading: Function;
	loadingTeams: boolean;
	setFetchTeamData: Function;
	fetchData: Function;
};

const TeamMenu = ({
	selectTeam,
	setLoading,
	loadingTeams,
	setFetchTeamData,
	fetchData,
}: props) => {
	const cv = useContext(TeamContext);
	const init_teams = cv.teams.map((team: any) => ({
		key: `${team.id}`,
		label: `${team.id}`,
	}));

	const [teams, setTeams] = useState<any>(init_teams);
	const [messageApi, contextHolder] = message.useMessage();

	useEffect(() => {
		setTeams(init_teams);
	}, [cv]);

	useEffect(() => {
		setFetchTeamData(
			() =>
				(
					id: any,
					loadThePage: boolean = true,
					message: string = "Updating data..."
				) =>
					getTeamDetails(id, loadThePage, message)
		);
	}, []);

	const mapTree = (data: any) => {
		let treedata: any = [];
		data.map((contracts: any) => {
			console.log(contracts);
			Object.keys(contracts)?.map((contract: any) => {
				let contract_data: any = {};
				let buildings: any = [];
				console.log(contract);
				Object.keys(contracts[contract])?.map((building) => {
					console.log(building);
					let building_data: any = {};
					let systems: any = [];
					contracts[contract][building]?.map((system: any, index: number) => {
						console.log(system);
						let system_data: any = {};
						contract_data.title = "Contract: " + system.title;
						contract_data.key = system.id;
						building_data.title = system.building_name;
						building_data.key = system.building_name + index.toString();
						system_data.title = system.name;
						system_data.key = system.system_id;
						// system_data.checkable = false;
						systems.push(system_data);
					});
					building_data.children = systems;
					buildings.push(building_data);
				});
				contract_data.children = buildings;
				treedata.push(contract_data);
			});
		});
		return treedata;
	};

	const getTeamDetails = (
		id: string,
		loadThePage: boolean = true,
		message: string = "Updating data..."
	) => {
		if (loadThePage) setLoading(true);
		else
			messageApi.open({
				type: "loading",
				content: message,
				duration: 0,
			});
		apiCall({
			method: "GET",
			url: "/clientteams?team_id=" + id,
			handleResponse: (res) => {
				console.log(res.data.message);
				let assigned = mapTree(res.data.message.assigned);
				let unassigned = mapTree(res.data.message.unassigned);
				let team_users = res.data.message.users;
				selectTeam({ id, assigned, unassigned, team_users });
				if (loadThePage) setLoading(false);
				else messageApi.destroy();
			},
			handleError: () => {
				if (loadThePage) setLoading(false);
				else messageApi.destroy();
			},
		});
	};

	const handleInputChange = (e: any) => {
		console.log();
		let teams = init_teams.filter((elm) =>
			elm.label.toLowerCase().includes(e.target.value.toLowerCase())
		);
		setTeams(teams);
	};
	return (
		<div className={`team-menu${loadingTeams ? "-loading" : ""}`}>
			{loadingTeams ? (
				<Spin size="large" />
			) : (
				<>
					<div style={{ padding: "10px", paddingBottom: "2px" }}>
						<Input
							onChange={handleInputChange}
							allowClear
							placeholder="Search teams"
						/>
					</div>
					<Menu
						items={teams}
						onClick={({ key }) => {
							getTeamDetails(key);
						}}
					/>
					<AddNewTeam fetchData={fetchData} />
				</>
			)}
			{contextHolder}
		</div>
	);
};

export default TeamMenu;
