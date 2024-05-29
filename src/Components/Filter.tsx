import { FC, ReactNode } from "react";
import {
	Button,
	Checkbox,
	Col,
	Divider,
	Form,
	Input,
	Row,
	Select,
	Typography,
} from "antd";
import { isEmpty } from "lodash";

//TYPES

interface filterOption {
	label: string | ReactNode;
	value: string | number | null;
}

interface filterItem {
	key: string;
	label: string;
	placeholder?: string;
	group: string;
}

interface filterItemWithOptions extends filterItem {
	type: "dropdown" | "checkbox";
	options: Array<filterOption>;
	searchable?: boolean;
	multi?: boolean;
	displayInRows?: boolean;
}

interface filterItemSearch extends filterItem {
	type: "search";
	isNumber?: boolean;
}

type props = {
	children: ReactNode | Array<ReactNode>;
	onApply: (values: object | null) => void;
	items: Array<filterItemWithOptions | filterItemSearch>;
};

// COMPONENT FUNC

const Filter: FC<props> = ({ children, onApply, items }) => {
	const [form] = Form.useForm();

	const applyFilter = () => {
		form.validateFields().then((values) => {
			let filterValues: Record<string, any> = {};
			Object.keys(values).map((key) => {
				if (
					values[key] === "" ||
					typeof values[key] === "undefined" ||
					(Array.isArray(values[key]) && values[key].length === 0)
				)
					delete values[key];
				else {
					let curr_item = items.find((x) => x.key === key);
					filterValues[curr_item?.group || "undefined"] = {
						...filterValues[curr_item?.group || "undefined"],
						[key.split("#").join("")]:
							curr_item?.type === "search"
								? curr_item?.isNumber
									? parseInt(values[key])
									: values[key]
								: values[key],
					};
				}
			});
			console.log("filterValues", filterValues);
			if (isEmpty(filterValues)) onApply(null);
			else onApply(filterValues);
		});
	};

	const resetFilters = () => {
		form.resetFields();
		onApply(null);
	};

	return (
		<div className="filter-wrapper">
			<div className="filter-main">
				<Typography.Title level={4}>Filters</Typography.Title>
				<Row gutter={6}>
					<Col span={12}>
						<Button
							onClick={applyFilter}
							size="small"
							block
							type="primary"
						>
							Apply
						</Button>
					</Col>
					<Col span={12}>
						<Button size="small" block onClick={resetFilters}>
							Reset
						</Button>
					</Col>
					<Divider />
					<Form
						form={form}
						layout="vertical"
						size="small"
						style={{ width: "100%", maxWidth: "100%" }}
					>
						{items.map((item) =>
							item.type === "dropdown" ? (
								<Form.Item
									key={item.key}
									name={item.key}
									label={item.label}
								>
									<Select
										style={{ width: "100%" }}
										{...{
											...(item.multi
												? { mode: "multiple" }
												: {}),
											...(item.placeholder
												? {
														placeholder:
															item.placeholder,
												  }
												: {}),
											...(item.searchable
												? {
														showSearch: true,
														optionFilterProp:
															"children",
														filterOption: (
															input,
															option
														) =>
															(
																(option?.label ??
																	"") as unknown as string
															)
																.toLowerCase()
																.includes(
																	input
																),
														filterSort: (
															optionA,
															optionB
														) =>
															(
																(optionA?.label ??
																	"") as unknown as string
															)
																.toLowerCase()
																.localeCompare(
																	(
																		(optionB?.label ??
																			"") as unknown as string
																	).toLowerCase()
																),
												  }
												: {}),
										}}
										options={item.options}
									/>
								</Form.Item>
							) : item.type === "search" ? (
								<Form.Item
									key={item.key}
									name={item.key}
									label={item.label}
								>
									<Input
										placeholder={
											item.placeholder ||
											`Filter by ${item.label}`
										}
									/>
								</Form.Item>
							) : item.type === "checkbox" ? (
								<Form.Item
									key={item.key}
									name={item.key}
									label={item.label}
								>
									<Checkbox.Group
										style={{
											width: "100%",
											...(item.displayInRows
												? { display: "block" }
												: {}),
										}}
									>
										{item.options.map((opt) => (
											<Row>
												<Col span={24}>
													<Checkbox value={opt.value}>
														{opt.label}
													</Checkbox>
												</Col>
											</Row>
										))}
									</Checkbox.Group>
								</Form.Item>
							) : null
						)}
					</Form>
				</Row>
			</div>
			<div className="filter-body">{children}</div>
		</div>
	);
};

export default Filter;
