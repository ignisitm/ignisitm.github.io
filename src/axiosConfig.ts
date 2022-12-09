import axios, { AxiosError, AxiosResponse } from "axios";
import { message } from "antd";

type apiMethods = "GET" | "POST" | "DELETE" | "PUT";
let response: AxiosResponse;

type params = {
	method: apiMethods;
	url: string;
	data?: object;
	handleResponse: (res: AxiosResponse) => void;
	handleError?: (err: any) => void;
	percentage?: (progress: any) => void;
};

const baseurl = "https://lu2p3mkeu3.execute-api.us-east-1.amazonaws.com/Prod";

async function apiCall({
	method,
	url,
	data,
	handleResponse,
	handleError,
	percentage,
}: params) {
	const api = axios.create({
		baseURL: baseurl,
		onDownloadProgress: (progress) => {
			percentage?.(progress);
		},
	});

	try {
		if (method === "GET") {
			response = await api.get(url);
		} else if (method === "POST") {
			response = await api.post(url, data);
		} else if (method === "DELETE") {
			response = await api.delete(url, data);
		} else if (method === "PUT") {
			response = await api.put(url, data);
		}
		handleResponse(response);
	} catch (error: any) {
		message.error(error?.response?.data?.message || "Network Error");
		handleError?.(error);
	}
}

export { baseurl, apiCall };
