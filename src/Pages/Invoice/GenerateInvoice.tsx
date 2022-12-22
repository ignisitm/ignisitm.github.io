import { Button, Form, Input, message, Modal, Select } from "antd";
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

  return (
    <Modal
      visible={visible}
      style={{ top: "15px" }}
      title="Create Notification"
      okText="Create Notification"
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
      <Form form={form} layout="vertical" name="form_in_modal"></Form>
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
