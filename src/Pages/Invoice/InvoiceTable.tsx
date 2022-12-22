import { Transfer, Row, Col, Card, Button, Tag } from "antd";
import type { TransferDirection } from "antd/es/transfer";
import React, { useEffect, useState } from "react";

interface props {
	notifications: any;
	systems: any;
	fetchData: Function;

	// enable: Function;
	// setAssignedUsers: Function;
}

const InvoiceTable: React.FC<props> = ({
	notifications,
	systems,
	fetchData,
}) => {
	const [targetKeys, setTargetKeys] = useState<number[]>([]);
	const [record, setRecord] = useState<any>({});

	useEffect(() => {
		console.log(systems);
	}, []);

	const filterOption = (inputValue: string, option: any) =>
		option.name.indexOf(inputValue) > -1;

	const handleChange = (newTargetKeys: string[]) => {
		// if (newTargetKeys.length > 0) enable(false);
		// else enable(true);
		// setTargetKeys(newTargetKeys);
		// setAssignedUsers(newTargetKeys.map((key) => parseInt(key)));
	};

	const handleSearch = (dir: TransferDirection, value: string) => {
		console.log("search:", dir, value);
	};

	return (
		<Row>
			<Col span={16}>
				<Transfer
					style={{ height: "500px", width: "100%" }}
					listStyle={({ direction }) => {
						return {
							height: "100%",
							width: "100%",
							display: direction === "left" ? "" : "none",
							overflow: "clip",
						};
					}}
					operationStyle={{ display: "none" }}
					dataSource={notifications}
					showSearch
					titles={[
						<label style={{ fontWeight: "bold" }}>Available</label>,
						<label style={{ fontWeight: "bold" }}>Assigned</label>,
					]}
					locale={{ itemUnit: "Notification", itemsUnit: "Notifications" }}
					filterOption={filterOption}
					// targetKeys={targetKeys}
					// onChange={handleChange}
					onSelectChange={(skeys) => {
						let newTargetKeys = skeys.map((skey) => parseInt(skey));
						setTargetKeys(newTargetKeys);
						let systems: any = [];
						let reason: string = "";
						let building_id, notification_type;
						newTargetKeys.map((key: any, index: number) => {
							let new_n = notifications.find((x: any) => x.id === key);
							building_id = new_n.building_id;
							notification_type = new_n.type;
							reason = new_n.reason;

							systems = [...systems, ...new_n.fire_protection_systems];
						});
						setRecord({
							building_id,
							notification_type,
							systems,
							fire_protection_systems: systems,
							reason,
						});
					}}
					rowKey={(record) => record.id}
					onSearch={handleSearch}
					render={(item) => (
						<div>
							<h4>{item.key}</h4>
							<span style={{ whiteSpace: "normal" }}>
								{item.value.map((task: any) => (
									<>
										<span style={{ whiteSpace: "normal" }}>
											Type: {task.type}
										</span>
									</>
								))}

								{/* {item.notification_type === "Asset Tagging"
									? "Asset Tagging"
									: [...item.notification_type].map(
											(letter: string, index: number) => {
												if (letter === "I")
													return (
														"Inspection" +
														(index === [...item.notification_type].length - 1
															? ""
															: ", ")
													);
												if (letter === "T")
													return (
														"Testing" +
														(index === [...item.notification_type].length - 1
															? ""
															: ", ")
													);
												if (letter === "M")
													return (
														"Maintenance" +
														(index === [...item.notification_type].length - 1
															? ""
															: ", ")
													);
											}
									  )} */}
							</span>
							<br />

							<span style={{ whiteSpace: "normal" }}>
								Description: {item.reason}
							</span>
							<hr />
						</div>
					)}
				/>
			</Col>
			<Col span={8}>
				<Card
					size="small"
					title={<b>New Work Order</b>}
					// extra={
					// <Button disabled={!targetKeys.length} type="primary">
					// 	Create
					// </Button>
					// <Schedule key={record} record={record} fetchData={fetchData} />
					// }
					style={{ height: "100%", marginLeft: "20px" }}
				>
					{targetKeys.map((key: any) => {
						let new_n = notifications.find((x: any) => x.id === key);
						return (
							<div style={{ paddingTop: "8px" }}>
								<label>
									<b>
										System
										{new_n.fire_protection_systems.length === 1 ? "" : "s"} :
									</b>
									&nbsp;
									{new_n.fire_protection_systems.map(
										(sys: any, index: number) => {
											let sys_name = systems.find(
												(x: any) => x.id === sys.system
											).name;
											return (
												<>
													{sys_name +
														(index === new_n.fire_protection_systems.length - 1
															? ""
															: ", ")}
												</>
											);
										}
									)}
								</label>
								<p>
									{/* <b>Activities :</b> */}
									&nbsp;
									{new_n.notification_type === "Asset Tagging" ? (
										<Tag color="gold">Asset Tagging</Tag>
									) : (
										[...new_n.notification_type].map((letter: string) => {
											if (letter === "I")
												return <Tag color="geekblue">Inspection</Tag>;
											else if (letter === "T")
												return <Tag color="magenta">Testing</Tag>;
											else if (letter === "M")
												return <Tag color="green">Maintenance</Tag>;
										})
									)}
								</p>
								<hr />
							</div>
						);
					})}
				</Card>
			</Col>
		</Row>
	);
};

export default InvoiceTable;
