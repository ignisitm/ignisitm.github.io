import { Form, Upload, Row, Col, Button } from "antd";
import { FC } from "react";
import { InboxOutlined } from "@ant-design/icons";

interface props {
	nextFunc: Function;
	setAttachmentDetails: Function;
}

const AddAttachments: FC<props> = ({ nextFunc, setAttachmentDetails }) => {
	const normFile = (e: any) => {
		console.log("Upload event:", e);

		if (Array.isArray(e)) {
			return e;
		}

		return e && e.fileList;
	};

	const dummyRequest = ({ file, onSuccess }: any) => {
		setTimeout(() => {
			onSuccess("ok");
		}, 0);
	};

	const onFinish = (values: any) => {
		console.log(values);
		nextFunc();
		setAttachmentDetails(values);
	};

	return (
		<Form
			size="small"
			preserve={false}
			autoComplete="off"
			onFinish={onFinish}
			labelCol={{ span: 24, style: { paddingTop: 3 } }}
			wrapperCol={{ span: 24 }}
			onValuesChange={(changedValues, allValues) => {}}
		>
			<Form.Item label="Upload Attachments">
				<Form.Item
					name="dragger"
					valuePropName="fileList"
					getValueFromEvent={normFile}
					noStyle
				>
					<Upload.Dragger name="files" customRequest={dummyRequest}>
						<p className="ant-upload-drag-icon">
							<InboxOutlined />
						</p>
						<p className="ant-upload-text">
							Click or drag file to this area to upload
						</p>
						<p className="ant-upload-hint">
							Support for a single or bulk upload.
						</p>
					</Upload.Dragger>
				</Form.Item>
			</Form.Item>
			<Row>
				<Col md={6} xs={0} style={{ paddingLeft: "10px" }} />
				<Col md={12} xs={12} style={{ paddingLeft: "10px" }}>
					<Button size="middle" block type="primary" htmlType="submit">
						Next
					</Button>
				</Col>
				<Col md={6} xs={0} style={{ paddingLeft: "10px" }} />
			</Row>
		</Form>
	);
};

export default AddAttachments;
