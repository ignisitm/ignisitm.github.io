import { useEffect, useState } from "react";
import { TeamContext } from "../../Helpers/Context";
import { useLoaderContext } from "../../Components/Layout";
import TeamMenu from "./TeamMenu";
import { apiCall } from "../../axiosConfig";
import TeamView from "./TeamView";
import { Col, Row } from "antd";

const TeamPage = () => {
	const { completeLoading } = useLoaderContext();
	const [teams, setTeams] = useState<any>([]);
	const [selectedTeam, setSelectedTeam] = useState<any>({});
	const [ViewLoading, setViewLoading] = useState(false);
	const [users, setUsers] = useState<any>([]);
	const [loadingTeams, setLoadingTeams] = useState(false);
	const [fetchTeamData, setFetchTeamData] = useState<any>(false);

	useEffect(() => {
		fetchData();
		getUsers();
	}, []);

	const fetchData = () => {
		setLoadingTeams(true);
		apiCall({
			method: "GET",
			url: "/clientteams",
			handleResponse: (res) => {
				setTeams(res.data.message);
				setLoadingTeams(false);
				completeLoading();
			},
			handleError: (err) => {
				setLoadingTeams(false);
				completeLoading();
			},
		});
	};

	const getUsers = () => {
		apiCall({
			method: "GET",
			url: "/dropdown/users",
			handleResponse: (res) => {
				console.log(res);
				setUsers(res.data.message);
			},
		});
	};

	return (
		<TeamContext.Provider value={{ teams, users }}>
			<Row>
				<TeamMenu
					selectTeam={setSelectedTeam}
					setLoading={setViewLoading}
					loadingTeams={loadingTeams}
					setFetchTeamData={setFetchTeamData}
					fetchData={fetchData}
				/>
				<TeamView
					fetchTeamData={fetchTeamData}
					team={selectedTeam}
					loading={ViewLoading}
				/>
			</Row>
		</TeamContext.Provider>
	);
};

export default TeamPage;
