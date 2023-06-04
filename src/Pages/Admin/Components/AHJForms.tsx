import { DeleteOutlined } from "@ant-design/icons";
import { Card, Col, Popconfirm, Row, Space, message } from "antd";
import { FC } from "react";
import { apiCall } from "../../../axiosConfig";
import { AxiosError, AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";

interface props {
	forms: Array<any>;
	fetchData: Function;
}

// const forms = [
// 	{
// 		id: 1,
// 		name: "Qatar Civil Defence Department",
// 		uname: "Ignis Administrator",
// 	},
// 	{
// 		id: 2,
// 		name: "National Fire Protection Association",
// 		uname: "Ignis Administrator",
// 	},
// 	{
// 		id: 1,
// 		name: "New AHJ",
// 		uname: "Ignis Administrator",
// 	},
// ];

const AHJForms: FC<props> = ({ forms, fetchData }) => {
	const navigate = useNavigate();
	const deleteRow = (id: number) => {
		return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
			apiCall({
				method: "DELETE",
				url: "/ahjform",
				data: { data: { id } },
				handleResponse: (res) => {
					message.success(res.data.message);
					fetchData();
					resolve(res);
				},
				handleError: (err) => {
					reject(err);
				},
			});
		});
	};

	return (
		<Space size={[12, 32]} wrap>
			{forms.map((form) => (
				<Card
					onClick={() => navigate(`/ahj/${form.id}`)}
					key={form.id}
					hoverable={true}
					className="menu-cards"
					bordered={false}
					bodyStyle={{
						height: "180px",
					}}
				>
					<h2>{form.name}</h2>
					<span className="span-footer">Created by: {form.uname}</span>
					<span className="span-footer" style={{ right: "10px" }}>
						<Popconfirm
							title="Are you sure to delete?"
							onConfirm={() => deleteRow(form.id)}
							// onCancel={cancel}
							okText="Delete"
							cancelText="Cancel"
							placement="left"
						>
							<div className="delete-table-action">
								<DeleteOutlined />
							</div>
						</Popconfirm>
					</span>
				</Card>
			))}
		</Space>
	);
};

export default AHJForms;
