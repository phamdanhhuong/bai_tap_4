import { useState } from "react";
import {
  Button,
  Col,
  Form,
  Input,
  notification,
  Row,
  Card,
  Typography,
} from "antd";
import { forgotPasswordApi } from "../util/api";
import { Link } from "react-router-dom";
import { ArrowLeftOutlined, MailOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const onFinish = async (values: any) => {
    const { email } = values;
    setLoading(true);

    try {
      const res: any = await forgotPasswordApi(email);

      if (res && res.EC === 0) {
        setEmailSent(true);
        notification.success({
          message: "FORGOT PASSWORD",
          description:
            "Email reset password đã được gửi. Vui lòng kiểm tra email của bạn.",
        });
      } else {
        notification.error({
          message: "FORGOT PASSWORD",
          description: res?.EM ?? "Có lỗi xảy ra, vui lòng thử lại.",
        });
      }
    } catch (error) {
      notification.error({
        message: "FORGOT PASSWORD",
        description: "Có lỗi xảy ra, vui lòng thử lại.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <Row justify={"center"} style={{ marginTop: "50px" }}>
        <Col xs={24} md={16} lg={10}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <MailOutlined
                style={{
                  fontSize: "48px",
                  color: "#1890ff",
                  marginBottom: "16px",
                }}
              />
              <Title level={3}>Email đã được gửi!</Title>
              <Paragraph>
                Chúng tôi đã gửi link reset password đến email của bạn. Vui lòng
                kiểm tra hộp thư (bao gồm cả thư mục spam) và làm theo hướng
                dẫn.
              </Paragraph>
              <Paragraph type="secondary">Link sẽ hết hạn sau 1 giờ.</Paragraph>
              <div style={{ marginTop: "24px" }}>
                <Link to="/login">
                  <Button type="primary">Quay lại đăng nhập</Button>
                </Link>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    );
  }

  return (
    <Row justify={"center"} style={{ marginTop: "50px" }}>
      <Col xs={24} md={16} lg={8}>
        <fieldset
          style={{
            padding: "15px",
            margin: "5px",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        >
          <legend>Quên mật khẩu</legend>
          <div style={{ marginBottom: "16px" }}>
            <Paragraph type="secondary">
              Nhập email của bạn và chúng tôi sẽ gửi link để reset mật khẩu.
            </Paragraph>
          </div>

          <Form
            name="forgotPassword"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập email!",
                },
                {
                  type: "email",
                  message: "Email không hợp lệ!",
                },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Nhập email của bạn"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{ width: "100%" }}
              >
                {loading ? "Đang gửi..." : "Gửi link reset password"}
              </Button>
            </Form.Item>
          </Form>

          <Link to={"/login"}>
            <ArrowLeftOutlined /> Quay lại đăng nhập
          </Link>
        </fieldset>
      </Col>
    </Row>
  );
};

export default ForgotPasswordPage;
