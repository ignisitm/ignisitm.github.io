import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Select,
  Row,
  Col,
  Table,
} from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { FC, useState, useContext } from "react";
import { SuperUserContext } from "../../Helpers/Context";
import { apiCall } from "../../axiosConfig";
import { AxiosError, AxiosResponse } from "axios";

interface props {
  fetchData: Function;
}

interface GenerateInvoiceFormProps {
  visible: boolean;
  confirmLoading: boolean;
  onCreate: (values: any) => Promise<AxiosResponse | AxiosError>;
  onCancel: () => void;
  fetchdata: Function;
}

const GenerateInvoiceForm: FC<GenerateInvoiceFormProps> = ({
  visible,
  confirmLoading,
  onCreate,
  onCancel,
  fetchdata,
}) => {
  const [form] = Form.useForm();
  const [modal, contextHolder] = Modal.useModal();

  // interface DataType {
  //   key: string;
  //   name: string;
  //   age: number;
  //   address: string;
  //   tags: string[];
  // }

  const columns: any = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      // render: (text) => <a>{text}</a>,
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
  ];

  const data: any[] = [
    {
      key: "1",
      name: "John Brown",
      age: 32,
      address: "New York No. 1 Lake Park",
    },
    {
      key: "2",
      name: "Jim Green",
      age: 42,
      address: "London No. 1 Lake Park",
    },
  ];

  return (
    <Modal
      visible={visible}
      style={{ top: "15px" }}
      title="Invoicing Details"
      okText="Generate"
      cancelText="Cancel"
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            onCreate(values).then(() => {
              form.resetFields();
            });
          })
          .catch((info) => {
            console.log("Validate Failed:", info);
          });
      }}
      confirmLoading={confirmLoading}
    >
      {contextHolder}
      <Form form={form} layout="vertical" name="form_in_modal">
        <Row>
          <Col md={12} xs={24} style={{ paddingRight: "10px" }}>
            <Form.Item
              label="Invoice No."
              name="invoice_no"
              rules={[
                {
                  // required: props.requiredFields.contract_number,
                  message: "Please enter the Invoice No.",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col md={12} xs={24} style={{ paddingRight: "10px" }}>
            <Form.Item
              label="Job Code"
              name="job_code"
              rules={[
                {
                  // required: props.requiredFields.contract_number,
                  message: "Please enter the Job Code",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md={12} xs={24} style={{ paddingRight: "10px" }}>
            <Form.Item
              label="Invoice Date"
              name="invoice_date"
              rules={[
                {
                  // required: props.requiredFields.contract_number,
                  message: "Please enter the invoice date",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col md={12} xs={24} style={{ paddingRight: "10px" }}>
            <Form.Item
              label="Job description"
              name="job_description"
              rules={[
                {
                  // required: props.requiredFields.contract_number,
                  message: "Please enter the job description",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md={12} xs={24} style={{ paddingRight: "10px" }}>
            <Form.Item
              label="Customer"
              name="customer"
              rules={[
                {
                  // required: props.requiredFields.contract_number,
                  message: "Please enter the customer name",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col md={12} xs={24} style={{ paddingRight: "10px" }}>
            <Form.Item
              label="Agreement No."
              name="agreement_no"
              rules={[
                {
                  // required: props.requiredFields.contract_number,
                  message: "Please enter the Agreement No.",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md={12} xs={24} style={{ paddingRight: "10px" }}>
            <Form.Item
              label="Address"
              name="address"
              rules={[
                {
                  // required: props.requiredFields.contract_number,
                  message: "Please enter the address",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col md={12} xs={24} style={{ paddingRight: "10px" }}>
            <Form.Item
              label="Order Reference No."
              name="oder_reference_no"
              rules={[
                {
                  // required: props.requiredFields.contract_number,
                  message: "Please enter the Order Reference No.",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md={12} xs={24} style={{ paddingRight: "10px" }}>
            <Form.Item
              label="Mobile No."
              name="mobile_no"
              rules={[
                {
                  // required: props.requiredFields.contract_number,
                  message: "Please enter the Mobile No.",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col md={12} xs={24} style={{ paddingRight: "10px" }}>
            <Form.Item
              label="Service Type"
              name="service_type"
              rules={[
                {
                  // required: props.requiredFields.contract_number,
                  message: "Please enter the Service Type",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md={12} xs={24} style={{ paddingRight: "10px" }}>
            <Form.Item
              label="Invoice period From"
              name="invoice_period_from"
              rules={[
                {
                  // required: props.requiredFields.contract_number,
                  message: "Please enter the Invoice period from date",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col md={12} xs={24} style={{ paddingRight: "10px" }}>
            <Form.Item
              label="Invoice period To"
              name="invoice_period_to"
              rules={[
                {
                  // required: props.requiredFields.contract_number,
                  message: "Please enter the Invoice period to date",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <div>
        <Table
          // rowSelection={{
          //   type: selectionType,
          //   ...rowSelection,
          // }}
          columns={columns}
          dataSource={data}
          // rowKey={"wo_id"}
          // loading={loading}
        />
      </div>
    </Modal>
  );
};

const GenerateInvoice: FC<props> = ({ fetchData }: props) => {
  const [visible, setVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const onCreate = (values: any) => {
    return new Promise<AxiosResponse | AxiosError>((resolve, reject) => {
      console.log("Received values of form: ", values);
      setConfirmLoading(true);
      apiCall({
        method: "POST",
        url: "/notifications",
        data: { notification: values },
        handleResponse: (res) => {
          resolve(res);
          setConfirmLoading(false);
          setVisible(false);
          fetchData();
        },
        handleError: (err) => {
          reject(err);
          setConfirmLoading(false);
        },
      });
    });
  };

  return (
    <div>
      <Button
        icon={<PlusOutlined />}
        onClick={() => {
          setVisible(true);
        }}
        type="primary"
      >
        Generate Invoice
      </Button>
      <GenerateInvoiceForm
        visible={visible}
        onCreate={onCreate}
        onCancel={() => {
          setVisible(false);
        }}
        confirmLoading={confirmLoading}
        fetchdata={fetchData}
      />
    </div>
  );
};

export default GenerateInvoice;
