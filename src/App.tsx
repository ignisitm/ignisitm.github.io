import { FC, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import Layout from "./Components/Layout";
import Login from "./Pages/Login";
import Buildings from "./Pages/Buildings";
import Building from "./Pages/Buildings/Building";
import Notifications from "./Pages/Notifications";
import ResetPassword from "./Pages/ResetPassword";
import SuperUser from "./Pages/SuperUser";
import Masters from "./Pages/Masters";
import { ClientContext } from "./Helpers/Context";
import Dashboard from "./Pages/Dashboard";
import WorkOrder from "./Pages/WorkOrders";
// import Home from "./Pages/Landing";
import { ConfigProvider, theme } from "antd";

let DefaultIcon = L.icon({
	iconUrl: icon,
	shadowUrl: iconShadow,
});
L.Marker.prototype.options.icon = DefaultIcon;

const App: FC = () => {
	const getClient = () => {
		let host = window.location.hostname;
		let vars = host.split(".");
		if (vars.length < 2 || vars[0] === "ignis-building-module") {
			return "";
		}
		return vars[0];
	};

	const Client = getClient();

	return Client ? (
		Client !== "invalid" ? (
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
					<ClientContext.Provider value={Client}>
						<BrowserRouter>
							<Routes>
								<Route path="/login" element={<Login />} />
								<Route path="/resetpassword" element={<ResetPassword />} />
								<Route path="" element={<Layout />}>
									<Route path="/" element={<Dashboard />} />
									<Route path="/buildings" element={<Buildings />} />
									<Route path="/building/:id" element={<Building />} />
									<Route path="/notifications" element={<Notifications />} />
									<Route path="/workorders" element={<WorkOrder />} />
									<Route path="/superuser" element={<SuperUser />} />
									<Route path="/masters" element={<Masters />} />
								</Route>
							</Routes>
						</BrowserRouter>
					</ClientContext.Provider>
				</div>
			</ConfigProvider>
		) : (
			<div>ERROR 404: INVALID CLIENT ADDRESS</div>
		)
	) : (
		<div>ERROR 404: Enter through Client Portal</div>
	);
};

export default App;
