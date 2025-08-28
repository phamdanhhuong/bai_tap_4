import { useState, useEffect } from "react";
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
import { resetPasswordApi } from "../util/api";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  LockOutlined,
} from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const ResetPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      notification.error({
        message: "RESET PASSWORD",
        description: "Token không hợp lệ hoặc đã hết hạn.",
      });
      navigate("/login");
    }
  }, [token, navigate]);

  const onFinish = async (values: any) => {
    const { newPassword, confirmPassword } = values;

    if (newPassword !== confirmPassword) {
      notification.error({
        message: "RESET PASSWORD",
        description: "Mật khẩu xác nhận không khớp!",
      });
      return;
    }

    if (!token) {
      notification.error({
        message: "RESET PASSWORD",
        description: "Token không hợp lệ.",
      });
      return;
    }

    setLoading(true);

    try {
      const res: any = await resetPasswordApi(token, newPassword);

      if (res && res.EC === 0) {
        setSuccess(true);
        notification.success({
          message: "RESET PASSWORD",
          description: "Mật khẩu đã được thay đổi thành công!",
        });
      } else {
        notification.error({
          message: "RESET PASSWORD",
          description: res?.EM ?? "Token không hợp lệ hoặc đã hết hạn.",
        });
      }
    } catch (error) {
      notification.error({
        message: "RESET PASSWORD",
        description: "Có lỗi xảy ra, vui lòng thử lại.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Row justify={"center"} style={{ marginTop: "50px" }}>
        <Col xs={24} md={16} lg={10}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <CheckCircleOutlined
                style={{
                  fontSize: "48px",
                  color: "#52c41a",
                  marginBottom: "16px",
                }}
              />
              <Title level={3}>Thành công!</Title>
              <Paragraph>
                Mật khẩu của bạn đã được thay đổi thành công. Bạn có thể đăng
                nhập bằng mật khẩu mới ngay bây giờ.
              </Paragraph>
              <div style={{ marginTop: "24px" }}>
                <Link to="/login">
                  <Button type="primary">Đăng nhập ngay</Button>
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
          <legend>Đặt lại mật khẩu</legend>
          <div style={{ marginBottom: "16px" }}>
            <Paragraph type="secondary">
              Nhập mật khẩu mới để hoàn tất quá trình reset.
            </Paragraph>
          </div>

          <Form
            name="resetPassword"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              label="Mật khẩu mới"
              name="newPassword"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập mật khẩu mới!",
                },
                {
                  min: 6,
                  message: "Mật khẩu phải có ít nhất 6 ký tự!",
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nhập mật khẩu mới"
              />
            </Form.Item>

            <Form.Item
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              rules={[
                {
                  required: true,
                  message: "Vui lòng xác nhận mật khẩu!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp!")
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Xác nhận mật khẩu mới"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{ width: "100%" }}
              >
                {loading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
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

export default ResetPasswordPage;
