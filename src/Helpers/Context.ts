import { createContext } from "react";

export let SuperUserContext = createContext({ countries: [] });

export let NotificationContext = createContext({
	buildings: [],
	leadExecutors: [],
	resources: [],
	employees: [],
});

export let TeamContext = createContext({ teams: [], users: [] });

export let AssetContext = createContext({ buildings: [], frequency: [] });

export let BCcontext = createContext({ users: [] });

export let SystemContext = createContext({
	systemTypes: [],
	buildings: [],
	contracts: [],
});

export let ClientContext = createContext({ client_id: "", client_name: "" });

export let AHJFormContext = createContext<any>({ frequencies: [] });
