import {
  Table,
  Row,
  Col,
  Input,
  Button,
  Popconfirm,
  message,
  Tooltip,
  Card,
  Tag,
  Divider,
  Radio,
} from "antd";
import { useEffect, useState } from "react";
import { apiCall } from "../../axiosConfig";
import {
  SyncOutlined,
  CloseOutlined,
  DeleteOutlined,
  FieldTimeOutlined,
  UsergroupAddOutlined,
  BankOutlined,
  FormOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { AxiosError, AxiosResponse } from "axios";
import { useLoaderContext } from "../../Components/Layout";
import { getUser } from "../../Auth/Auth";
import GenerateInvoice from "./GenerateInvoice";
const { Search } = Input;

const Invoices = () => {
  const [data, setData] = useState<{ key: String; value: any }[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showClose, setShowClose] = useState(false);
  const { completeLoading } = useLoaderContext();
  const [buildingNames, setBuildingNames] = useState([]);
  const [systems, setSystems] = useState<any>([]);
  const [expandedKeys, setExpandedKeys] = useState<any>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [records, setRecords] = useState<any>([]);
  const [selectionType, setSelectionType] = useState<"checkbox" | "radio">(
    "checkbox"
  );

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  //   const columns = [
  //     {
  //       title: "Activity",
  //       dataIndex: "activity",
  //     },
  //     {
  //       title: "System",
  //       dataIndex: "system",
  //       ellipsis: true,
  //       render: (id: any) => systems.find((x: any) => x.id === id)?.name,
  //     },
  //     {
  //       title: "Description",
  //       dataIndex: "reason",
  //       ellipsis: true,
  //       width: "50%",
  //     },
  // {
  // 	title: "Action",
  // 	dataIndex: "id",
  // 	render: (id: number, record: any) => (
  // 		<>
  // 			<div
  // 				style={{
  // 					display: "inline-block",
  // 					color: "blue",
  // 					cursor: "pointer",
  // 					marginRight: "10px",
  // 				}}
  // 			>
  // 				{/* <Schedule record={record} fetchData={fetchData} /> */}
  // 			</div>

  // 			<Popconfirm
  // 				title="Are you sure to delete?"
  // 				onConfirm={() => deleteRow(id)}
  // 				// onCancel={cancel}
  // 				okText="Delete"
  // 				cancelText="Cancel"
  // 				placement="left"
  // 			>
  // 				<div className="delete-table-action">
  // 					<DeleteOutlined />
  // 				</div>
  // 			</Popconfirm>
  // 		</>
  // 	),
  // 	width: "10%",
  // },
  //   ];
  const columns = [
    {
      title: "Workorder ID",
      dataIndex: "wo_id",
      //   render: (text: string) => <a>{text}</a>,
    },
    {
      title: "Building Name",
      dataIndex: "building_name",
    },
    {
      title: "Description",
      dataIndex: "details",
    },
  ];

  const onSelectChange = (record: any, selected: Boolean) => {
    if (selected) setRecords((items: any) => [...items, record]);
    else {
      let new_records = records.filter((x: any) => x.id !== record.id);
      setRecords(new_records);
    }
  };

  //   const rowSelection = {
  //     selectedRowKeys,
  //     onChange: (newSelectedRowKeys: React.Key[]) => {
  //       setSelectedRowKeys(newSelectedRowKeys);
  //     },
  //     onSelect: onSelectChange,
  //     preserveSelectedRowKeys: true,
  //     hideSelectAll: true,
  //   };

  const deleteRow = (id: number) => {
    return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
      apiCall({
        method: "DELETE",
        url: "/clients",
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

  const groupByBuildingID = (data: any) => {
    return data.reduce((storage: any, item: any) => {
      var group = item["building_name"];
      storage[group] = storage[group] || [];
      storage[group].push(item);
      return storage;
    }, {});
  };

  const fetchData = (
    curr_pagination: any = pagination,
    search: string = searchText
  ) => {
    setLoading(true);
    setShowClose(search ? true : false);
    apiCall({
      method: "GET",
      url: `/workorders?status=Completed&page=${
        curr_pagination.current
      }&limit=${curr_pagination.pageSize}&searchText=${search || ""}`,
      handleResponse: (res) => {
        console.log(res.data.message);
        setData(res.data.message);
        setLoading(false);
        if (res.data.message.length > 0) {
          let total = res.data.message[0].full_count;
          setPagination({ ...curr_pagination, total });
        }
      },
      handleError: () => {
        setLoading(false);
      },
    });
  };

  const search = (clear: boolean = false) => {
    let text = clear ? "" : searchText;
    if (clear) setSearchText("");
    fetchData(
      {
        pageSize: 5,
        current: 1,
      },
      text
    );
  };

  useEffect(() => {
    search();
    completeLoading();
    getAllSystems();
    getAllBuildings();
  }, []);

  const handleTableChange = (newPagination: any) => {
    fetchData(newPagination);
  };

  const getAllSystems = () => {
    apiCall({
      method: "GET",
      url: "/assets/systems",
      handleResponse: (res) => {
        setSystems(res.data.message || []);
        console.log(res.data.message);
      },
    });
  };

  const getAllBuildings = () => {
    apiCall({
      method: "GET",
      url: "/buildings?column_name=names",
      handleResponse: (res) => {
        setBuildingNames(res.data.message || []);
      },
    });
  };

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: any) => {
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        "selectedRows: ",
        selectedRows
      );
    },
    getCheckboxProps: (record: any) => ({
      disabled: record.name === "Disabled User", // Column configuration not to be checked
      name: record.name,
    }),
  };

  return (
    <>
      <Row gutter={16 + 8 * 2}>
        <Col span={8}>
          <Card
            className="dashboard-cards"
            style={{
              width: "100%",
              backgroundColor: "#FAFAFA",
              height: "100%",
            }}
          >
            <Row
              gutter={16 + 8 * 2}
              style={{ alignItems: "center", height: "100%" }}
              justify="center"
            >
              <Col span={6}>
                <div style={{ alignItems: "center" }}>
                  <div className="circle_card">
                    <FormOutlined
                      style={{
                        color: "#353535",
                        padding: "10px",
                        fontSize: "25px",
                      }}
                    />
                  </div>
                </div>
              </Col>
              <Col span={18}>
                {" "}
                <span style={{ color: "#353535", fontSize: "20px" }}>2</span>
                <br />
                <span style={{ color: "#353535" }}>
                  Invoices pending for approval
                </span>
              </Col>
            </Row>

            <div></div>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            className="dashboard-cards"
            style={{
              width: "100%",
              backgroundColor: "#FAFAFA",
              height: "100%",
            }}
          >
            <Row
              gutter={16 + 8 * 2}
              style={{ alignItems: "center", height: "100%" }}
              justify="center"
            >
              <Col span={6}>
                <div style={{ alignItems: "center" }}>
                  <div className="circle_card">
                    <BellOutlined
                      style={{
                        color: "#353535",
                        padding: "10px",
                        fontSize: "25px",
                      }}
                    />
                  </div>
                </div>
              </Col>
              <Col span={18}>
                {" "}
                <span style={{ color: "#353535", fontSize: "20px" }}>
                  10000
                </span>
                <br />
                <span style={{ color: "#353535" }}>Total Collection</span>
              </Col>
            </Row>

            <div></div>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            className="dashboard-cards"
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#FAFAFA",
            }}
          >
            <Row
              gutter={16 + 8 * 2}
              style={{ alignItems: "center", height: "100%" }}
              justify="center"
            >
              <Col span={6}>
                <div style={{ alignItems: "center", height: "100%" }}>
                  <div className="circle_card">
                    <UsergroupAddOutlined
                      style={{
                        color: "#353535",
                        padding: "10px",
                        fontSize: "25px",
                      }}
                    />
                  </div>
                </div>
              </Col>
              <Col span={18}>
                {" "}
                <span style={{ color: "#353535", fontSize: "20px" }}>
                  167/266
                </span>
                <br />
                <span style={{ color: "#353535" }}>Total Invoiced</span>
              </Col>
            </Row>

            <div></div>
          </Card>
        </Col>
      </Row>
      {/* Searching  */}
      {/* {getUser()?.role === "admin" ? (
				<Row style={{ marginBottom: 10 }}>
					<Col span={18}>
						<Search
							className="table-search"
							placeholder="Search using Column Values"
							onChange={(e) => setSearchText(e.target.value)}
							onSearch={() => search()}
							value={searchText}
						/>
						{showClose && (
							<Button onClick={() => search(true)} icon={<CloseOutlined />} />
						)}
					</Col>
				</Row>
			) : null} */}

      <Row>
        <Col span={getUser().role === "admin" ? 24 : 16}>
          <br />
          {/* Table  */}
          <div>
            <Table
              rowSelection={{
                type: selectionType,
                ...rowSelection,
              }}
              columns={columns}
              dataSource={data}
              rowKey={"wo_id"}
              loading={loading}
            />
          </div>

          <div className="table-result-label">{`Showing ${
            (pagination.current - 1) * pagination.pageSize + 1
          } - ${
            pagination.total <
            (pagination.current - 1) * pagination.pageSize + pagination.pageSize
              ? pagination.total
              : (pagination.current - 1) * pagination.pageSize +
                pagination.pageSize
          } out of ${pagination.total} records`}</div>
        </Col>
      </Row>
      <GenerateInvoice fetchData={fetchData} />
    </>
  );
};

export default Invoices;
