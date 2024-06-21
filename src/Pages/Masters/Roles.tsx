import React, { useEffect, useState } from "react";
import {
	Col,
	Row,
	Select,
	Transfer,
	Button,
	Popconfirm,
	Modal,
	Input,
	message,
} from "antd";
import type { TransferDirection } from "antd/es/transfer";
import { apiCall } from "../../axiosConfig";
import { DeleteOutlined, LoadingOutlined } from "@ant-design/icons";
import { useLoaderContext } from "../../Components/Layoutv2";

interface props {
	data: any;
}

interface RecordType {
	authorization: string;
	name: string;
	module: string;
}

const Roles: React.FC = () => {
	const { completeLoading } = useLoaderContext();
	const [targetKeys, setTargetKeys] = useState<string[]>([]);
	const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
	const [data, setData] = useState<RecordType[]>([]);
	const [roles, setRoles] = useState<any[]>([]);
	const [selectedRole, setSelectedRole] = useState<any>();
	const [loadingRoles, setLoadingRoles] = useState(false);
	const [creatingNewRole, setCreatingNewRole] = useState(false);
	const [newRole, setNewRole] = useState("");
	const [deleting, setDeleting] = useState(false);
	const [NewRoleModal, setNewRoleModal] = useState(false);
	const [messageApi, contextHolder] = message.useMessage();

	const openNewRoleModal = () => setNewRoleModal(true);
	const closeNewRoleModal = () => {
		setNewRole("");
		setNewRoleModal(false);
		setCreatingNewRole(false);
	};

	useEffect(() => {
		getAllAuthCodes();
		getAllRoles();
	}, []);

	const getAllRoles = () => {
		setLoadingRoles(true);
		apiCall({
			method: "GET",
			url: "/dropdown/clientRoles",
			handleResponse: (res) => {
				completeLoading();
				setRoles(res.data.message);
				setTimeout(() => {
					setLoadingRoles(false);
				}, 500);
			},
			handleError: () => {
				setLoadingRoles(false);
				completeLoading();
			},
		});
	};

	const getAllRolesForNew = (name: any) => {
		setLoadingRoles(true);
		apiCall({
			method: "GET",
			url: "/dropdown/clientRoles",
			handleResponse: (res) => {
				let new_roles = res.data.message;
				setRoles(new_roles);
				let new_id = new_roles.find((x: any) => x.role === name).id;
				setSelectedRole(new_id);
				setTimeout(() => {
					setLoadingRoles(false);
				}, 500);
			},
			handleError: () => {
				setLoadingRoles(false);
			},
		});
	};

	const getAllAuthCodes = () => {
		apiCall({
			method: "GET",
			url: "/dropdown/authCodes",
			handleResponse: (res) => {
				setData(res.data.message);
			},
		});
	};

	const onChange = (
		nextTargetKeys: string[],
		direction: TransferDirection,
		moveKeys: string[]
	) => {
		console.log("targetKeys:", nextTargetKeys);
		console.log("direction:", direction);
		console.log("moveKeys:", moveKeys);
		assignAuthToRole(nextTargetKeys);
		setTargetKeys(nextTargetKeys.sort());
	};

	const assignAuthToRole = (authcodes: any) => {
		messageApi.open({
			type: "loading",
			content: "Updating Authorization Codes..",
			duration: 0,
		});
		apiCall({
			method: "PUT",
			url: "/clientroles",
			data: {
				id: selectedRole,
				role: roles.find((x) => x.id === selectedRole).role,
				authorizations: authcodes,
			},
			handleResponse: (res) => {
				console.log(res);
				messageApi.destroy();
				message.success("Authorization Codes Updated");
			},
			handleError: (err) => {
				messageApi.destroy();
				setTargetKeys([]);
				getAllRoles();
			},
		});
	};

	const onSelectChange = (
		sourceSelectedKeys: string[],
		targetSelectedKeys: string[]
	) => {
		console.log("sourceSelectedKeys:", sourceSelectedKeys);
		console.log("targetSelectedKeys:", targetSelectedKeys);
		setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
	};

	const onClickNewRole = () => {
		openNewRoleModal();
	};

	const createNewRole = () => {
		setCreatingNewRole(true);
		apiCall({
			method: "POST",
			url: "/clientroles",
			handleResponse: (res) => {
				console.log(res);
				getAllRolesForNew(newRole);
				closeNewRoleModal();
				setCreatingNewRole(false);
				setTargetKeys([]);
			},
			handleError: (err) => {
				closeNewRoleModal();
				setCreatingNewRole(false);
			},
			data: {
				role: newRole,
				authorizations: [],
			},
		});
	};

	const deleteRole = () => {
		return new Promise((resolve, reject) => {
			setDeleting(true);
			console.log(selectedRole);
			apiCall({
				method: "DELETE",
				url: "/clientroles",
				data: { data: { id: selectedRole } },
				handleResponse: (res) => {
					setDeleting(false);
					setSelectedRole(null);
					getAllRoles();
					setTargetKeys([]);
					resolve(res);
				},
				handleError: (err) => reject(err),
			});
		});
	};

	return (
		<div style={{ height: "calc(100vh - 80px)" }}>
			{contextHolder}
			<Row style={{ marginBottom: "12px" }}>
				<Col span={8}>
					<Select
						value={selectedRole}
						dropdownRender={(menu) =>
							loadingRoles ? (
								<h4 style={{ paddingLeft: "15px" }}>
									<LoadingOutlined /> Loading Data
								</h4>
							) : (
								menu
							)
						}
						placeholder="Select a Role"
						style={{ width: "100%", margin: "5px 0" }}
						onChange={(e) => {
							let selectedRole = roles.find((o) => o.id === e);
							setTargetKeys([...selectedRole.authorizations]);
							setSelectedRole(e);
						}}
					>
						{roles.map((role: any) => (
							<Select.Option value={role.id}>
								{role.role}
							</Select.Option>
						))}
					</Select>
				</Col>

				<Col span={2}>
					<div
						className="delete-table-action"
						style={{ padding: "12px 0px 16px 10px" }}
					>
						{selectedRole && (
							<Popconfirm
								title="Are you sure to delete?"
								onConfirm={deleteRole}
								// onCancel={cancel}
								okText="Delete"
								cancelText="Cancel"
								placement="right"
							>
								<DeleteOutlined />
							</Popconfirm>
						)}
					</div>
				</Col>

				<Col span={14} style={{ margin: "5px 0" }}>
					<Button
						type="primary"
						style={{
							margin: "0px 10px 0 0",
							display: "flex",
							float: "right",
						}}
						onClick={() => onClickNewRole()}
					>
						Add Role
					</Button>
				</Col>
			</Row>

			<Transfer
				rowKey={(row) => row.authorization}
				showSearch={true}
				locale={{
					itemUnit: "code",
					itemsUnit: "codes",
					notFoundContent: "No code found",
					searchPlaceholder: "Search a code",
				}}
				dataSource={data}
				titles={[
					loadingRoles ? (
						<b>
							<LoadingOutlined /> Loading Codes
						</b>
					) : (
						<b>Non Assigned Codes</b>
					),
					<b>Assigned Codes</b>,
				]}
				targetKeys={targetKeys}
				selectedKeys={selectedKeys}
				onChange={onChange}
				onSelectChange={onSelectChange}
				render={(item) =>
					`${item.module} - ${item.name} : ${item.authorization}`
				}
				listStyle={{
					width: "50%",
					height: "100%",
				}}
				style={{ height: "calc(100% - 98px)" }}
			/>

			<Modal
				open={NewRoleModal}
				title={"Create a New Role"}
				onCancel={() => {
					closeNewRoleModal();
				}}
				okText={"Create"}
				onOk={createNewRole}
				confirmLoading={creatingNewRole}
			>
				<Input
					value={newRole}
					onChange={(e) => setNewRole(e.target.value)}
				/>
			</Modal>
		</div>
	);
};

export default Roles;
