import { Form, Input, Button, Checkbox, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { apiCall } from "../../axiosConfig";
import { useState, useContext } from "react";
import { setUserSession } from "../../Auth/Auth";
import { useNavigate } from "react-router-dom";
import { ClientContext } from "../../Helpers/Context";

interface userDetails {
	username: string;
	password: string;
}

export default function NormalLoginForm() {
	let navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	let client = useContext(ClientContext);

	const capitalizeFirstLetter = (string: string) => {
		return string.charAt(0).toUpperCase() + string.slice(1);
	};

	const onFinish = (values: any) => {
		setLoading(true);
		console.log("Received values of form: ", values);
		let { username, password }: userDetails = { ...values };
		username = username.trim();
		password = password.trim();
		apiCall({
			method: "POST",
			url: "/auth/login",
			data: { userInfo: { username, password } },
			handleResponse: (res) => {
				const user = res.data.message.user;
				const token = res.data.message.token;
				setUserSession({ user, token });

				if (user.first_login) {
					navigate("/resetpassword");
				} else {
					navigate("/");
				}
			},
			handleError: (err) => {
				setLoading(false);
				console.log(err);
			},
		});
	};

	return (
		<div className="loginform">
			<img style={{ paddingLeft: "47px" }} src="logo.png" height={100}></img>
			<div style={{ height: "25px" }}></div>
			<Form
				name="normal_login"
				className="login-form"
				initialValues={{
					remember: true,
				}}
				onFinish={onFinish}
			>
				<Form.Item
					name="username"
					rules={[
						{
							required: true,
							message: "Please input your Username!",
						},
					]}
				>
					<Input
						prefix={<UserOutlined className="site-form-item-icon" />}
						placeholder="Username"
					/>
				</Form.Item>
				<Form.Item
					name="password"
					rules={[
						{
							required: true,
							message: "Please input your Password!",
						},
					]}
				>
					<Input
						prefix={<LockOutlined className="site-form-item-icon" />}
						type="password"
						placeholder="Password"
					/>
				</Form.Item>
				<Form.Item>
					<a className="login-form-forgot" href="">
						Forgot password
					</a>
					<br />
					<Form.Item name="remember" valuePropName="checked" noStyle>
						<Checkbox>Remember me</Checkbox>
					</Form.Item>
				</Form.Item>

				<Form.Item>
					<Button
						type="primary"
						htmlType="submit"
						className="login-form-button"
						loading={loading}
					>
						Log in
					</Button>
				</Form.Item>
			</Form>
			<div className="login-footer">
				{capitalizeFirstLetter(client)} ©2022 powered by IGNIS
			</div>
		</div>
	);
}
