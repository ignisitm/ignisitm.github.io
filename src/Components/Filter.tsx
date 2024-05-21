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

//TYPES

interface filterOption {
	label: string | ReactNode;
	value: string | number;
}

interface filterItem {
	key: string;
	label: string;
	placeholder?: string;
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
}

type props = {
	children: ReactNode | Array<ReactNode>;
	onApply: Function;
	items: Array<filterItemWithOptions | filterItemSearch>;
};

// COMPONENT FUNC

const Filter: FC<props> = ({ children, onApply, items }) => {
	const [form] = Form.useForm();

	const applyFilter = () => {
		form.validateFields().then((values) => {
			onApply(values);
		});
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
						<Button size="small" block>
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
