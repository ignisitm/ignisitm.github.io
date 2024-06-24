import { FC, useEffect, useState } from "react";
import { apiCall } from "../../axiosConfig";
import {
	DatePicker,
	Select,
	Space,
	Table,
	TableColumnsType,
	Typography,
} from "antd";
const { RangePicker } = DatePicker;

const KPIReport: FC = () => {
	const date = new Date();
	date.setHours(0, 0, 0, 0);
	date.setDate(date.getDate() + 1);

	const defaultStart = new Date();
	defaultStart.setHours(0, 0, 0, 0);
	defaultStart.setMonth(defaultStart.getMonth() - 1);

	const [queryDates, setQueryDates] = useState<any>({
		start: defaultStart.toISOString(),
		end: date.toISOString(),
	});

	const [loading, setLoading] = useState(false);
	const [customRange, setCustomRange] = useState(false);

	const [data, setData] = useState<any>([]);

	useEffect(() => {
		getKPIReport();
	}, [queryDates]);

	const expandedcolumns: TableColumnsType<any> = [
		{ title: "Team", dataIndex: "team", key: "team" },
		{
			title: "Planned WOs",
			dataIndex: "total_work_orders",
			key: "total_work_orders",
		},
		{
			title: "Actual WOs",
			dataIndex: "completed_work_orders",
			key: "completed_work_orders",
		},
		{
			title: " WO Variance",
			dataIndex: "variance",
			key: "variance",
		},
		{
			title: "Planned Duration",
			dataIndex: "total_planned_duration",
			key: "total_planned_duration",
			render: (v) => `${parseFloat(v).toFixed(1)} hrs`,
		},
		{
			title: "Actual Duration",
			dataIndex: "total_actual_duration",
			key: "total_actual_duration",
			render: (v) => `${parseFloat(v).toFixed(1)} hrs`,
		},
		{
			title: "Duration Variance",
			dataIndex: "duration_variance",
			key: "duration_variance",
			render: (v) => `${parseFloat(v).toFixed(1)} hrs`,
		},
	];

	// const columns: TableColumnsType<any> = [
	// 	{
	// 		title: " ",
	// 		dataIndex: "week_number",
	// 		key: "week_number",
	// 		render: (week, record) => {
	// 			let start_date = new Date(record.week_start);
	// 			let end_date = new Date(record.week_start);
	// 			end_date.setDate(start_date.getDate() + 6);

	// 			return (
	// 				<Typography.Text
	// 					strong
	// 				>{`Week ${week} : ${start_date.toLocaleDateString()} -  ${end_date.toLocaleDateString()}`}</Typography.Text>
	// 			);
	// 		},
	// 	},
	// ];

	const cols: TableColumnsType<any> = [
		{
			title: "Week",
			dataIndex: "week_number",
			key: "week_number",
			render: (week, record) => {
				let start_date = new Date(record.week_start);
				let end_date = new Date(record.week_start);
				end_date.setDate(start_date.getDate() + 6);

				return (
					<Typography.Text
						strong
					>{`${start_date.toLocaleDateString()} -  ${end_date.toLocaleDateString()}`}</Typography.Text>
				);
			},
		},
		{
			title: "Data",
			dataIndex: "week_number",
			render: (week, record) =>
				record.week_data[0].team === "No Team" ? (
					<span>No data available</span>
				) : (
					<div>
						<ExpandedTable rows={record.week_data} />
					</div>
				),
		},
	];

	const ExpandedTable = ({ rows }: any) => (
		<Table
			rowKey={"team"}
			dataSource={rows}
			columns={expandedcolumns}
			pagination={false}
		/>
	);

	const getKPIReport = () => {
		setLoading(true);
		let { start, end } = queryDates;
		apiCall({
			method: "GET",
			url: `/ClientReports?start=${start}&end=${end}`,
			handleResponse: (res) => {
				console.log(res);
				setData(res.data.message.reverse());
				setLoading(false);
			},
		});
	};

	const handleChange = (e: any) => {
		let months = parseInt(e);
		if (months) {
			setCustomRange(false);
			const newDate = new Date();
			newDate.setHours(0, 0, 0, 0);
			newDate.setMonth(newDate.getMonth() - months);
			setQueryDates((prev: any) => ({ ...prev, start: newDate.toISOString() }));
		} else {
			setCustomRange(true);
		}
	};

	const setCustomDate = (values: any) => {
		let start = values[0].toISOString();
		let end = values[1].toISOString();
		setQueryDates({ start, end });
	};

	return (
		<>
			{/* <Table
				rowKey={"week_number"}
				dataSource={data}
				pagination={false}
				columns={columns}
				expandable={{
					expandIcon: () => null,
					expandedRowKeys: data.map((o: any) => o.week_number),
					expandedRowRender: (record) =>
						record.week_data[0].team === "No Team" ? (
							<span style={{ marginLeft: "30px" }}>No data available</span>
						) : (
							<div>
								<ExpandedTable rows={record.week_data} />
							</div>
						),
				}}
			/> */}
			<Space wrap style={{ margin: "10px 2px" }}>
				<Typography.Text strong>Generate For: </Typography.Text>
				<Select
					defaultValue={1}
					style={{ width: 120 }}
					onChange={handleChange}
					options={[
						{ value: 1, label: "Last 1 Month" },
						{ value: 2, label: "Last 2 Months" },
						{ value: 3, label: "Last 3 Months" },
						{ value: 6, label: "Last 6 Months" },
						{ value: 8, label: "Last 8 Months" },
						{ value: 12, label: "Last 1 Year" },
						{ value: 0, label: "Custom Range" },
					]}
				/>
				{customRange && (
					<RangePicker
						format={"DD/MM/YYYY"}
						onChange={(values) => setCustomDate(values)}
					/>
				)}
			</Space>
			<Table
				loading={loading}
				dataSource={data}
				columns={cols}
				pagination={false}
			/>
		</>
	);
};

export default KPIReport;
