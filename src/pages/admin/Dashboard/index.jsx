import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Statistic, Table, Button, Tag, Space, Spin, Radio,
  message, Modal, Popconfirm, Empty
} from 'antd';
import {
  UserOutlined, CodeOutlined, AppstoreOutlined, HistoryOutlined,
  EyeOutlined, LockOutlined, UnlockOutlined, DeleteOutlined,
  PlusOutlined
} from '@ant-design/icons';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { useNavigate } from 'react-router-dom';

import { userService } from '../../../services/user.service';
import { programService } from '../../../services/program.service';
import { topicService } from '../../../services/topic.service';
import { historyService } from '../../../services/history.service';

import './Dashboard.scss';

const STATUS_COLORS = {
  FOUND: '#52c41a',
  PARTIAL: '#faad14',
  NOT_FOUND: '#f5222d'
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  const pad = (n) => n.toString().padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};


const Dashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    programs: 0,
    topics: 0,
    histories: 0
  });

  const [statusFilter, setStatusFilter] = useState('7');
  const [statusData, setStatusData] = useState([]);
  const [statusLoading, setStatusLoading] = useState(false);

  const [topicData, setTopicData] = useState([]);
  const [topicLoading, setTopicLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userPagination, setUserPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const [recentHistories, setRecentHistories] = useState([]);
  const [historiesLoading, setHistoriesLoading] = useState(false);

  const [notFoundCommands, setNotFoundCommands] = useState([]);
  const [notFoundLoading, setNotFoundLoading] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);

  // ==========================================
  // Helpers
  // ==========================================
  const getDateRange = (filter) => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    if (filter === '7') {
      const from = new Date();
      from.setDate(now.getDate() - 7);
      from.setHours(0, 0, 0, 0);
      return { from: from.toISOString(), to: now.toISOString() };
    }
    if (filter === '30') {
      const from = new Date();
      from.setDate(now.getDate() - 30);
      from.setHours(0, 0, 0, 0);
      return { from: from.toISOString(), to: now.toISOString() };
    }
    return { from: null, to: null };
  };

  // ==========================================
  // Fetch all dashboard data
  // ==========================================
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [usersRes, programsRes, topicsRes, historiesRes] = await Promise.all([
        userService.getAll(0, 10000),
        programService.getAll(0, 10000),
        topicService.getAll(0, 10000),
        historyService.getAllAdmin(0, 10000)
      ]);

      setStats({
        users: Array.isArray(usersRes) ? usersRes.length : usersRes.items?.length || 0,
        programs: Array.isArray(programsRes) ? programsRes.length : programsRes.items?.length || 0,
        topics: Array.isArray(topicsRes) ? topicsRes.length : topicsRes.items?.length || 0,
        histories: Array.isArray(historiesRes) ? historiesRes.length : historiesRes.items?.length || 0
      });
    } catch (error) {
      message.error('Lỗi tải dữ liệu tổng quan!');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatusSummary = async () => {
    setStatusLoading(true);
    try {
      const { from, to } = getDateRange(statusFilter);
      const summary = await historyService.getStatusSummary(from, to);
      const chartData = [
        { name: 'FOUND', value: summary.FOUND || 0, color: STATUS_COLORS.FOUND },
        { name: 'PARTIAL', value: summary.PARTIAL || 0, color: STATUS_COLORS.PARTIAL },
        { name: 'NOT_FOUND', value: summary.NOT_FOUND || 0, color: STATUS_COLORS.NOT_FOUND }
      ].filter(item => item.value > 0);
      setStatusData(chartData);
    } catch (error) {
      message.error('Lỗi tải thống kê trạng thái!');
    } finally {
      setStatusLoading(false);
    }
  };

  const fetchProgramsByTopic = async () => {
    setTopicLoading(true);
    try {
      const topicsRes = await topicService.getAll(0, 100);
      const topics = Array.isArray(topicsRes) ? topicsRes : topicsRes.items || [];

      const results = await Promise.all(
        topics.map(async (topic) => {
          try {
            const programsRes = await programService.getByTopic(topic.slug, 0, 1);
            const count = Array.isArray(programsRes) ? programsRes.length : programsRes.items?.length || 0;
            return { name: topic.name, count };
          } catch {
            return { name: topic.name, count: 0 };
          }
        })
      );

      setTopicData(results.filter(t => t.count > 0).sort((a, b) => b.count - a.count));
    } catch (error) {
      message.error('Lỗi tải số lệnh theo Topic!');
    } finally {
      setTopicLoading(false);
    }
  };

  const fetchUsers = async (page = 1, pageSize = 10) => {
    setUsersLoading(true);
    try {
      const skip = (page - 1) * pageSize;
      const res = await userService.getAll(skip, pageSize);
      const list = Array.isArray(res) ? res : res.items || [];
      const total = Array.isArray(res) ? res.length : res.total || list.length;
      setUsers(list);
      setUserPagination({ current: page, pageSize, total });
    } catch (error) {
      message.error('Lỗi tải danh sách người dùng!');
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchRecentHistories = async () => {
    setHistoriesLoading(true);
    try {
      const res = await historyService.getAllAdmin(0, 10);
      setRecentHistories(Array.isArray(res) ? res : res.items || []);
    } catch (error) {
      message.error('Lỗi tải lịch sử gần đây!');
    } finally {
      setHistoriesLoading(false);
    }
  };

  const fetchNotFoundCommands = async () => {
    setNotFoundLoading(true);
    try {
      const res = await historyService.getByStatus('NOT_FOUND', { limit: 10 });
      setNotFoundCommands(Array.isArray(res) ? res : res.items || []);
    } catch (error) {
      message.error('Lỗi tải lệnh không tìm thấy!');
    } finally {
      setNotFoundLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchStatusSummary();
    fetchProgramsByTopic();
    fetchUsers(1, 10);
    fetchRecentHistories();
    fetchNotFoundCommands();
  }, []);

  useEffect(() => {
    fetchStatusSummary();
  }, [statusFilter]);

  // ==========================================
  // User actions
  // ==========================================
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsUserModalVisible(true);
  };

  const handleToggleUserActive = async (user) => {
    try {
      await userService.update(user.id, { is_active: !user.is_active });
      message.success(`Đã ${user.is_active ? 'khóa' : 'mở khóa'} tài khoản!`);
      fetchUsers(userPagination.current, userPagination.pageSize);
    } catch (error) {
      message.error('Lỗi cập nhật trạng thái user!');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await userService.delete(id);
      message.success('Đã xóa người dùng!');
      fetchUsers(userPagination.current, userPagination.pageSize);
    } catch (error) {
      message.error('Lỗi xóa người dùng!');
    }
  };

  // ==========================================
  // Columns
  // ==========================================
  const userColumns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: 'Username', dataIndex: 'username' },
    { title: 'Email', dataIndex: 'email' },
    {
      title: 'Role',
      dataIndex: 'roles',
      render: (role) => <Tag color={role === 'admin' ? 'red' : 'blue'}>{role}</Tag>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      render: (isActive) => isActive
        ? <Tag color="green">Đang hoạt động</Tag>
        : <Tag color="default">Bị khóa</Tag>
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      render: (date) => date ? formatDate(date) : '-'
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewUser(record)}>Xem</Button>
          <Button
            size="small"
            icon={record.is_active ? <LockOutlined /> : <UnlockOutlined />}
            onClick={() => handleToggleUserActive(record)}
          >
            {record.is_active ? 'Khóa' : 'Mở'}
          </Button>
          <Popconfirm
            title="Xóa người dùng này?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const historyColumns = [
    {
      title: 'Câu lệnh',
      dataIndex: 'command_text',
      ellipsis: true
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 120,
      render: (status) => (
        <Tag color={STATUS_COLORS[status] || 'default'}>{status}</Tag>
      )
    },
    {
      title: 'Thờ i gian',
      dataIndex: 'created_at',
      width: 160,
      render: (date) => date ? formatDate(date) : '-'
    }
  ];

  const notFoundColumns = [
    {
      title: 'Câu lệnh không tìm thấy',
      dataIndex: 'command_text',
      ellipsis: true
    },
    {
      title: 'Thờ i gian',
      dataIndex: 'created_at',
      width: 160,
      render: (date) => date ? formatDate(date) : '-'
    }
  ];

  // ==========================================
  // Render
  // ==========================================
  return (
    <div className="admin-dashboard">
      <h2 className="dashboard-title">Tổng quan hệ thống</h2>

      <Spin spinning={loading} tip="Đang tải...">
        {/* Row 1: Statistic Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <Statistic
                title="Ngườ i dùng"
                value={stats.users}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <Statistic
                title="Câu lệnh"
                value={stats.programs}
                prefix={<CodeOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <Statistic
                title="Chủ đề (Topics)"
                value={stats.topics}
                prefix={<AppstoreOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <Statistic
                title="Lịch sử tìm kiếm"
                value={stats.histories}
                prefix={<HistoryOutlined />}
              />
            </Card>
          </Col>
        </Row>
      </Spin>

      {/* Row 2: Charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card className="chart-card">
            <div className="chart-header">
              <h4>Trạng thái tìm kiếm</h4>
              <Radio.Group
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                optionType="button"
                size="small"
              >
                <Radio.Button value="7">7 ngày</Radio.Button>
                <Radio.Button value="30">30 ngày</Radio.Button>
                <Radio.Button value="all">Toàn bộ</Radio.Button>
              </Radio.Group>
            </div>
            <Spin spinning={statusLoading}>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Số lượng']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="Không có dữ liệu" />
              )}
            </Spin>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card className="chart-card">
            <div className="chart-header">
              <h4>Số lệnh theo Topic</h4>
            </div>
            <Spin spinning={topicLoading}>
              {topicData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topicData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="Không có dữ liệu" />
              )}
            </Spin>
          </Card>
        </Col>
      </Row>

      {/* Row 3: Users Table */}
      <Card className="dashboard-table-card">
        <h4>Danh sách người dùng</h4>
        <Table
          rowKey="id"
          columns={userColumns}
          dataSource={users}
          loading={usersLoading}
          pagination={{
            current: userPagination.current,
            pageSize: userPagination.pageSize,
            total: userPagination.total,
            onChange: (page, pageSize) => fetchUsers(page, pageSize)
          }}
        />
      </Card>

      {/* Row 4: Recent Histories & NOT_FOUND */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card className="dashboard-table-card">
            <h4>Lịch sử tìm kiếm gần đây</h4>
            <Table
              rowKey="id"
              columns={historyColumns}
              dataSource={recentHistories}
              loading={historiesLoading}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card className="dashboard-table-card">
            <h4>Lệnh không tìm thấy (cần bổ sung)</h4>
            <Table
              rowKey="id"
              columns={notFoundColumns}
              dataSource={notFoundCommands}
              loading={notFoundLoading}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Row 5: Quick Actions */}
      <div className="quick-actions">
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/nchieu-adm-exsh/programs')}>
          Thêm Lệnh
        </Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/nchieu-adm-exsh/topics')}>
          Thêm Topic
        </Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/nchieu-adm-exsh/categories')}>
          Thêm Danh mục
        </Button>
      </div>

      {/* User Detail Modal */}
      <Modal
        title="Chi tiết người dùng"
        open={isUserModalVisible}
        onCancel={() => setIsUserModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsUserModalVisible(false)}>Đóng</Button>
        ]}
      >
        {selectedUser && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <p><strong>ID:</strong> {selectedUser.id}</p>
            <p><strong>Username:</strong> {selectedUser.username}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Role:</strong> {selectedUser.roles}</p>
            <p><strong>Trạng thái:</strong> {selectedUser.is_active ? 'Đang hoạt động' : 'Bị khóa'}</p>
            <p><strong>Ngày tạo:</strong> {selectedUser.created_at ? formatDate(selectedUser.created_at) : '-'}</p>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
