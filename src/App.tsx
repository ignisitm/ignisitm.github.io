import { FC, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import Layout from "./Components/NewLayout";
import OldLayout from "./Components/Layout";
import Layoutv2 from "./Components/Layoutv2";
import Login from "./Pages/Login";
import Buildings from "./Pages/Buildings";
import Building from "./Pages/Buildings/Building";
import Contracts from "./Pages/Contracts";
import Notifications from "./Pages/Notifications";
import ResetPassword from "./Pages/ResetPassword";
import SuperUser from "./Pages/SuperUser";
import Masters from "./Pages/Masters";
import { ClientContext } from "./Helpers/Context";
import Dashboard from "./Pages/Dashboard";
import WorkOrder from "./Pages/WorkOrders";
import Invoice from "./Pages/Invoice";
// import Home from "./Pages/Landing";
import { ConfigProvider, Spin, theme } from "antd";
import Admin from "./Pages/Admin";
import AHJForm from "./Pages/Admin/Components/AHJForm";
import { apiCall } from "./axiosConfig";
import { WarningOutlined } from "@ant-design/icons";
import { setClientToken } from "./Auth/Auth";
import SystemsTable from "./Pages/Admin/Components/SystemsTable";
import SystemList from "./Pages/Admin/Components/SystemsList";
import AHJ from "./Pages/Admin/Components/AHJ";
import DevicesTable from "./Pages/Admin/Components/DevicesTable";
import Contract from "./Pages/Contracts/Contract";
import Systems from "./Pages/Systems";
import Assets from "./Pages/Assets";
import TeamPage from "./Pages/Teams";
import PdfViewer from "./Pages/Admin/Components/PdfViewer";

let DefaultIcon = L.icon({
	iconUrl: icon,
	shadowUrl: iconShadow,
});
L.Marker.prototype.options.icon = DefaultIcon;

const App: FC = () => {
	const [state, setState] = useState({
		client_id: "verifying",
		client_name: "",
	});

	const getClient = () => {
		let host = window.location.hostname;
		console.log("host: ", host);
		let vars = host.split(".");
		let _client;
		if (
			vars[1] === "github" ||
			(vars[0] === "www" && vars[2] === "github")
		) {
			_client = "firelink1";
		} else if (vars[0] === "www") _client = vars[1];
		else _client = vars[0];

		console.log("client: ", _client);
		apiCall({
			method: "GET",
			url: `/verifyclient?client=${_client}`,
			handleResponse: (res) => {
				console.log(res);
				setState({
					client_id: res.data.message[0].client_id,
					client_name: res.data.message[0].name,
				});
				// setClientToken(res.data.message.client_token);
			},
			handleError: (err) => {
				setState({
					client_id: "invalid",
					client_name: "",
				});
			},
		});
	};

	useEffect(() => {
		getClient();
	}, []);

	return state.client_id !== "verifying" && state.client_id !== "invalid" ? (
		<ConfigProvider
			theme={{
				algorithm: theme.compactAlgorithm,
				token: {
					colorPrimary: "#F9992E",
					fontFamily: `'Poppins', sans-serif`,
				},
			}}
		>
			<div className="App">
				<ClientContext.Provider value={state}>
					<BrowserRouter>
						<Routes>
							<Route path="/login" element={<Login />} />
							<Route
								path="/resetpassword"
								element={<ResetPassword />}
							/>
							<Route
								path=""
								element={
									state.client_id === "admin" ? (
										<Layout />
									) : (
										<OldLayout />
									)
								}
							>
								<Route
									path="/"
									element={
										state.client_id === "admin" ? (
											<SystemList />
										) : (
											<Dashboard />
										)
									}
								/>

								<Route
									path="/buildings"
									element={<Buildings />}
								/>
								<Route
									path="/building/:id"
									element={<Building />}
								/>
								<Route
									path="/contracts"
									element={<Contracts />}
								/>
								<Route
									path="/contract/:id"
									element={<Contract />}
								/>
								<Route path="/systems" element={<Systems />} />
								<Route path="/assets" element={<Assets />} />
								<Route
									path="/notifications"
									element={<Notifications />}
								/>
								<Route
									path="/workorders"
									element={<WorkOrder />}
								/>
								<Route path="/invoice" element={<Invoice />} />
								{/* <Route path="/devices" element={<DevicesTable />} /> */}
								<Route path="/ahjforms" element={<AHJ />} />
								<Route
									path="/superuser"
									element={<SuperUser />}
								/>
								<Route path="/ahj/:id" element={<AHJForm />} />
								<Route path="/masters" element={<Masters />} />
								<Route path="/teams" element={<TeamPage />} />
								<Route
									path="/pdfview"
									element={<PdfViewer />}
								/>
							</Route>
						</Routes>
					</BrowserRouter>
				</ClientContext.Provider>
			</div>
		</ConfigProvider>
	) : (
		<div className="loginform" style={{ height: "330.5px" }}>
			<img
				style={{ paddingLeft: "47px" }}
				src="logo.png"
				height={100}
			></img>
			<div style={{ height: "25px" }}></div>
			<div style={{ textAlign: "center" }}>
				{state.client_id === "verifying" ? (
					<>
						<Spin size="large" />
						<h4>Intializing Portal</h4>
					</>
				) : (
					<>
						<WarningOutlined style={{ fontSize: "45px" }} />
						<h4>Wrong Client Portal URL</h4>
					</>
				)}
			</div>
		</div>
	);

	// return state ? (
	// 	state === "invalid" ? (
	// 		<ConfigProvider
	// 			theme={{
	// 				algorithm: theme.compactAlgorithm,
	// 				token: {
	// 					colorPrimary: "#F9992E",
	// 					fontFamily: `'Poppins', sans-serif`,
	// 				},
	// 			}}
	// 		>
	// 			<div className="App">
	// 				<ClientContext.Provider value={state}>
	// 					<BrowserRouter>
	// 						<Routes>
	// 							<Route path="/login" element={<Login />} />
	// 							<Route path="/resetpassword" element={<ResetPassword />} />
	// 							<Route path="" element={<Layout />}>
	// 								<Route path="/" element={<Dashboard />} />
	// 								<Route path="/buildings" element={<Buildings />} />
	// 								<Route path="/building/:id" element={<Building />} />
	// 								<Route path="/notifications" element={<Notifications />} />
	// 								<Route path="/workorders" element={<WorkOrder />} />
	// 								<Route path="/invoice" element={<Invoice />} />
	// 								{/* <Route path="/superuser" element={<SuperUser />} /> */}
	// 								<Route path="/admin" element={<Admin />} />
	// 								<Route path="/ahj/:id" element={<AHJForm />} />
	// 								<Route path="/masters" element={<Masters />} />
	// 							</Route>
	// 						</Routes>
	// 					</BrowserRouter>
	// 				</ClientContext.Provider>
	// 			</div>
	// 		</ConfigProvider>
	// 	) : (
	// 		<div>ERROR 404: INVALID CLIENT ADDRESS</div>
	// 	)
	// ) : (
	// 	<div>ERROR 404: Enter through Client Portal</div>
	// );
};

export default App;
