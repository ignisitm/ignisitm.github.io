import axios, { AxiosError, AxiosResponse } from "axios";
import { message } from "antd";
import { getToken, getClientToken } from "./Auth/Auth";

type apiMethods = "GET" | "POST" | "DELETE" | "PUT";
let response: AxiosResponse;

type params = {
	method: apiMethods;
	url: string;
	data?: object;
	handleResponse: (res: AxiosResponse) => void;
	handleError?: (err: any) => void;
	percentage?: (progress: any) => void;
	headers?: object;
	errorMessage?: boolean;
};

// const baseurl = "https://k1fn48lym8.execute-api.us-east-1.amazonaws.com/Prod/"; //DEV
const baseurl = "https://wprt15irj7.execute-api.us-east-1.amazonaws.com/Prod/"; //PROD

async function apiCall({
	method,
	url,
	data,
	headers,
	handleResponse,
	handleError,
	percentage,
	errorMessage = true,
}: params) {
	const api = axios.create({
		baseURL: baseurl,
		headers: {
			ignistoken: getToken(),
			clienttoken: getClientToken(),
			...(headers ? headers : {}),
		},
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
		handleError?.(error);

		//Not Authorized
		if (
			error?.response?.status === 401 &&
			error?.response?.data?.message === "Invalid Token"
		) {
			document.location.href = "/login#token-invalid";
		} else if (
			error?.response?.status === 403 &&
			error?.response?.data?.message === "Not Authorized"
		) {
			message.error(
				"You are not authorized to access this functionality. Contact your administrator"
			);
		} else {
			if (errorMessage)
				message.error(error?.response?.data?.message || "Network Error");
		}
	}
}

export { baseurl, apiCall };
