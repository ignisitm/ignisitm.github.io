import { Menu, Row, Col, Form, Input } from "antd";
import {
	BarChartOutlined,
	BellOutlined,
	BankOutlined,
} from "@ant-design/icons";
import { FC } from "react";

const items = [
	{
		key: "/",
		icon: <BarChartOutlined />,
		label: "Dashboard",
	},
	{
		key: "/Buildings",
		icon: <BankOutlined />,
		label: "Buildings",
	},
	{
		key: "/Notifications",
		icon: <BellOutlined />,
		label: "Notifications",
	},
];

const MenuChanger = () => {
	return (
		<Form.Item
			labelCol={{ span: 8 }}
			wrapperCol={{ span: 16 }}
			label="Username"
			name="username"
			rules={[{ required: true, message: "Please input your username!" }]}
		>
			<Input />
		</Form.Item>
		// <Row>
		// 	<Col span={12}>
		// 		<Col span={24}>
		// 			<BarChartOutlined /> Dashboard -&gt;
		// 		</Col>
		// 		<Col span={24}>
		// 			<BankOutlined /> Buildings
		// 		</Col>
		// 		<Col span={24}>
		// 			<BellOutlined /> Notifications
		// 		</Col>
		// 	</Col>
		// </Row>
	);
};

export default MenuChanger;
