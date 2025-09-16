import { useEffect, useState } from "react";
import { getUserApi } from "../util/api";
import { notification, Table, Row, Col } from "antd";
import { FavoriteProducts } from "../components/products/FavoriteProducts";
import { UserHistory } from "../components/user/UserHistory";

const UserPage = () => {
  const [dataSource, setDataSource] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      const res: any = await getUserApi();
      if (res) {
        setDataSource(res);
      } else {
        notification.error({
          message: "Unauthorized",
          description: "Failed to fetch user data",
        });
      }
    };
    fetchUser();
  }, []);

  const columns = [
    {
      title: "ID",
      dataIndex: "_id",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Role",
      dataIndex: "role",
    },
  ];

  return (
    <div style={{ padding: 30 }}>
      {/* User Info Table */}
      <Table
        bordered
        dataSource={dataSource}
        columns={columns}
        rowKey={"_id"}
        pagination={false}
        style={{ marginBottom: 24 }}
      />

      {/* User's Favorite Products and History */}
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <FavoriteProducts />
        </Col>
        <Col span={24}>
          <UserHistory />
        </Col>
      </Row>
    </div>
  );
};

export default UserPage;
