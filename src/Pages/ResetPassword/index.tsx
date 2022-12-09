import { Form, Input, Button, Alert, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import {apiCall} from "../../axiosConfig";
import { useState } from "react";
import { setUserSession, getUser } from "../../Auth/Auth";
import { useNavigate } from "react-router-dom";


interface resetPassword {
    new_password :string ;
    confirm_password :string ;
}

export default function ResetPassword() {
	let navigate = useNavigate();
	const [loading, setLoading] = useState(false);

	const onFinish = (values :any) => {
		setLoading(true);
		console.log("Received values of form: ", values);
		let { new_password, confirm_password } :resetPassword = { ...values };
		new_password = new_password.trim();
		confirm_password = confirm_password.trim();
		let user :object|null = getUser();
		apiCall({
            method: "POST",
            url: "/auth/reset",
            data: {user, new_password, confirm_password },
            handleResponse: (res) => {
                setLoading(false);
				console.log(res);
				message.success(
					"Password changed successfully, Login with new credentials"
				);
				navigate("/login");
            },
            handleError: (err) => {
                setLoading(false);
				console.log(err);
            }
        })
	};

	return (
<div className="loginform">
			<img style={{ paddingLeft: "30px" }} src="logo.png" height={100}></img>
			<div style={{ height: "70px", marginTop: "10px" }}>
				<Alert
					message={
						<>
							This is your first login, please set
							<br />
							your new password.
						</>
					}
					type="warning"
				/>
			</div>
			<Form
				name="normal_login"
				className="login-form"
				autoComplete="off"
				initialValues={{
					remember: true,
				}}
				onFinish={onFinish}
			>
				<Form.Item
					name="new_password"
					rules={[
						{
							required: true,
							message: "Please input your password!",
						},
					]}
				>
					<Input
						type="password"
						prefix={<LockOutlined className="site-form-item-icon" />}
						placeholder="New Password"
					/>
				</Form.Item>
				<Form.Item
					name="confirm_password"
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
						placeholder="Confirm Password"
					/>
				</Form.Item>

				<Form.Item>
					<Button
						type="primary"
						htmlType="submit"
						className="login-form-button"
						loading={loading}
					>
						Change Password
					</Button>
				</Form.Item>
			</Form>
		</div>
	);
}
