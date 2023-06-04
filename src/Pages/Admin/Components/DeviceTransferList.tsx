import { useEffect, useState, FC } from "react";
import { Transfer } from "antd";
import type { TransferDirection } from "antd/es/transfer";

interface props {
	devices: Array<RecordType>;
	setSelectedDevices: Function;
	selectedDevices?: Array<number>;
}

interface RecordType {
	id: number;
	name: string;
	chosen?: boolean;
}

const DeviceTransferList: FC<props> = ({
	devices,
	setSelectedDevices,
	selectedDevices,
}) => {
	const [mockData, setMockData] = useState<RecordType[]>([]);
	const [targetKeys, setTargetKeys] = useState<string[]>(
		selectedDevices?.map((x) => x.toString()) || []
	);

	// useEffect(() => {
	// 	getMock();
	// }, []);

	const filterOption = (inputValue: string, option: RecordType) =>
		option.name.indexOf(inputValue) > -1;

	const handleChange = (newTargetKeys: string[]) => {
		setTargetKeys(newTargetKeys);
		console.log(newTargetKeys);
		setSelectedDevices(newTargetKeys.map((x) => parseInt(x)));
	};

	const handleSearch = (dir: TransferDirection, value: string) => {
		console.log("search:", dir, value);
	};

	return (
		<Transfer
			dataSource={devices}
			showSearch
			rowKey={(record) => record.id.toString()}
			filterOption={filterOption}
			targetKeys={targetKeys}
			titles={[<b>Not Selected</b>, <b>Selected</b>]}
			onChange={handleChange}
			onSearch={handleSearch}
			render={(item) => item.name}
			listStyle={(dir) => ({ width: "600px" })}
			style={{ width: "600px" }}
			locale={{
				itemUnit: "device",
				itemsUnit: "devices",
				notFoundContent: "The list is empty",
				searchPlaceholder: "Search device",
			}}
		/>
	);
};

export default DeviceTransferList;
