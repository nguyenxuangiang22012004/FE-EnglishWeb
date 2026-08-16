'use client';

import React, { useState } from 'react';
import {
  Table,
  Input,
  Button,
  Space,
  Typography,
  Popconfirm,
  message,
  ConfigProvider,
  theme,
  Spin,
  Tooltip,
  Switch,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  ClearOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useVocabularyLookup } from '@/components/hooks/useVocabularyLookup';

const { Title, Text } = Typography;

interface FlashcardRow {
  id: number;
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  meaning: string;
  example: string;
}

interface CreateFlashcardFormProps {
  onSubmit?: (data: Omit<FlashcardRow, 'id'>[]) => void;
  isLoading?: boolean;
}

let nextId = Date.now();

export const CreateFlashcardForm: React.FC<CreateFlashcardFormProps> = ({
  onSubmit,
  isLoading,
}) => {
  const createRow = (): FlashcardRow => ({
    id: nextId++,
    word: '',
    pronunciation: '',
    partOfSpeech: '',
    meaning: '',
    example: '',
  });

  const [rows, setRows] = useState<FlashcardRow[]>([
    createRow(),
    createRow(),
    createRow(),
  ]);
  const [autoDetect, setAutoDetect] = useState(true);

  const addRows = (count = 1) => {
    const newRows = Array.from({ length: count }, createRow);
    setRows((prev) => [...prev, ...newRows]);
  };

  const deleteRow = (id: number) => {
    if (rows.length <= 1) {
      message.warning('Phải có ít nhất một hàng!');
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateField = (
    id: number,
    field: keyof FlashcardRow,
    value: string,
  ) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  const clearAll = () => {
    setRows([createRow()]);
    message.success('Đã làm trống danh sách');
  };

  const handleSubmit = () => {
    const valid = rows.filter((r) => r.word.trim() && r.meaning.trim());
    if (valid.length === 0) {
      message.error('Vui lòng nhập ít nhất một flashcard!');
      return;
    }
    onSubmit?.(valid.map(({ id, ...rest }) => rest));
  };

  const { handleWordBlur, handleMeaningBlur, loadingRows } =
    useVocabularyLookup({ rows, updateField });

  const validCount = rows.filter(
    (r) => r.word.trim() && r.meaning.trim(),
  ).length;

  const columns = [
    {
      title: '#',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      align: 'center' as const,
      render: (_: unknown, record: FlashcardRow, index: number) =>
        loadingRows.has(record.id) ? (
          <Spin size="small" />
        ) : (
          <Text type="secondary">{index + 1}</Text>
        ),
    },
    {
      title: (
        <span>
          Từ tiếng Anh <Text type="danger">*</Text>
        </span>
      ),
      dataIndex: 'word',
      key: 'word',
      width: 200,
      render: (text: string, record: FlashcardRow) => (
        <Input
          placeholder="e.g. Resilient"
          value={text}
          onChange={(e) => updateField(record.id, 'word', e.target.value)}
          onBlur={() => {
            if (autoDetect) handleWordBlur(record.id, record.word);
          }}
          onPressEnter={() => addRows(1)}
          disabled={loadingRows.has(record.id)}
        />
      ),
    },
    {
      title: 'Từ loại',
      dataIndex: 'partOfSpeech',
      key: 'partOfSpeech',
      width: 120,
      render: (text: string, record: FlashcardRow) => (
        <Input
          placeholder="adj, n..."
          value={text}
          onChange={(e) =>
            updateField(record.id, 'partOfSpeech', e.target.value)
          }
          disabled={loadingRows.has(record.id)}
        />
      ),
    },
    {
      title: 'Phiên âm',
      dataIndex: 'pronunciation',
      key: 'pronunciation',
      width: 150,
      render: (text: string, record: FlashcardRow) => (
        <Input
          placeholder="/rɪˈzɪliənt/"
          value={text}
          onChange={(e) =>
            updateField(record.id, 'pronunciation', e.target.value)
          }
          disabled={loadingRows.has(record.id)}
        />
      ),
    },
    {
      title: (
        <span>
          Nghĩa tiếng Việt <Text type="danger">*</Text>
        </span>
      ),
      dataIndex: 'meaning',
      key: 'meaning',
      width: 200,
      render: (text: string, record: FlashcardRow) => (
        <Input
          placeholder="Kiên cường"
          value={text}
          onChange={(e) => updateField(record.id, 'meaning', e.target.value)}
          onBlur={() => {
            if (autoDetect) handleMeaningBlur(record.id, record.meaning);
          }}
          disabled={loadingRows.has(record.id)}
        />
      ),
    },
    {
      title: 'Ví dụ',
      dataIndex: 'example',
      key: 'example',
      render: (text: string, record: FlashcardRow) => (
        <Input
          placeholder="She is very resilient."
          value={text}
          onChange={(e) => updateField(record.id, 'example', e.target.value)}
          disabled={loadingRows.has(record.id)}
        />
      ),
    },
    {
      title: '',
      key: 'action',
      width: 50,
      render: (_: unknown, record: FlashcardRow) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => deleteRow(record.id)}
          disabled={rows.length <= 1 || loadingRows.has(record.id)}
        />
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          borderRadius: 12,
          colorPrimary: '#6366f1',
          colorBgContainer: 'rgba(255,255,255,0.04)',
          colorBgElevated: '#1a1f35',
          colorBorder: 'rgba(255,255,255,0.06)',
          colorText: '#f1f5f9',
          colorTextSecondary: '#94a3b8',
        },
      }}
    >
      <div className="glass-card p-6">
        <div className="flex justify-between items-start mb-5">
          <div>
            <Title level={4} style={{ margin: 0 }}>
              ➕ Tạo Flashcard Mới
            </Title>
            <Text type="secondary">
              Mỗi hàng là một flashcard — nhấn <Text code>Enter</Text> để thêm
              hàng mới
            </Text>
          </div>
          <Space>
            <Tooltip
              title={
                autoDetect
                  ? 'AI đang bật — tự động điền khi nhập từ'
                  : 'AI đang tắt — nhập thủ công'
              }
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 12px',
                  borderRadius: 10,
                  border: autoDetect
                    ? '1px solid rgba(99, 102, 241, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  background: autoDetect
                    ? 'rgba(99, 102, 241, 0.1)'
                    : 'transparent',
                  transition: 'all 0.3s ease',
                }}
              >
                <ThunderboltOutlined
                  style={{
                    color: autoDetect ? '#818cf8' : '#64748b',
                    fontSize: 16,
                  }}
                />
                <Text
                  style={{
                    fontSize: 13,
                    color: autoDetect ? '#c7d2fe' : '#94a3b8',
                    userSelect: 'none',
                  }}
                >
                  AI Detect
                </Text>
                <Switch
                  size="small"
                  checked={autoDetect}
                  onChange={setAutoDetect}
                  style={{
                    backgroundColor: autoDetect ? '#6366f1' : undefined,
                  }}
                />
              </div>
            </Tooltip>
            <Button
              icon={<PlusOutlined />}
              onClick={() => addRows(1)}
            >
              Thêm hàng
            </Button>
            <Button
              icon={<PlusOutlined />}
              onClick={() => addRows(5)}
            >
              Thêm 5 hàng
            </Button>
          </Space>
        </div>

        <Table
          dataSource={rows}
          columns={columns}
          rowKey="id"
          pagination={false}
          bordered
          size="middle"
          scroll={{ x: 700 }}
          style={{ marginBottom: '20px' }}
        />

        <div className="flex justify-between items-center pt-4 border-t border-white/[0.06]">
          <Text>
            Tổng cộng:{' '}
            <Text strong style={{ color: '#818cf8' }}>
              {validCount}
            </Text>{' '}
            từ hợp lệ
          </Text>
          <Space size="middle">
            <Popconfirm
              title="Xoá tất cả hàng?"
              description="Hành động này không thể hoàn tác."
              onConfirm={clearAll}
              okText="Xoá"
              cancelText="Hủy"
            >
              <Button icon={<ClearOutlined />} danger>
                Xoá tất cả
              </Button>
            </Popconfirm>
            <Button
              type="primary"
              size="large"
              icon={<SaveOutlined />}
              loading={isLoading}
              onClick={handleSubmit}
              disabled={validCount === 0}
              style={{
                backgroundColor: validCount > 0 ? '#34d399' : undefined,
                borderColor: validCount > 0 ? '#34d399' : undefined,
              }}
            >
              Lưu {validCount > 0 ? `${validCount} Flashcard` : ''}
            </Button>
          </Space>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default CreateFlashcardForm;