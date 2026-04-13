'use client';

import React, { useState } from 'react';
import { Table, Input, Button, Space, Typography, Popconfirm, message } from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    SaveOutlined,
    ClearOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface FlashcardRow {
    id: number;
    word: string;
    pronunciation: string;
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
        meaning: '',
        example: '',
    });

    const [rows, setRows] = useState<FlashcardRow[]>([createRow(), createRow(), createRow()]);

    const addRows = (count = 1) => {
        const newRows = Array.from({ length: count }, createRow);
        setRows(prev => [...prev, ...newRows]);
    };

    const deleteRow = (id: number) => {
        if (rows.length <= 1) {
            message.warning('Phải có ít nhất một hàng!');
            return;
        }
        setRows(prev => prev.filter(r => r.id !== id));
    };

    const updateField = (id: number, field: keyof FlashcardRow, value: string) => {
        setRows(prev => prev.map(r => (r.id === id ? { ...r, [field]: value } : r)));
    };

    const clearAll = () => {
        setRows([createRow()]);
        message.success('Đã làm trống danh sách');
    };

    const handleSubmit = () => {
        const valid = rows.filter(r => r.word.trim() && r.meaning.trim());
        if (valid.length === 0) {
            message.error('Vui lòng nhập ít nhất một flashcard có đầy đủ Từ và Nghĩa!');
            return;
        }
        onSubmit?.(valid.map(({ id, ...rest }) => rest));
    };

    const validCount = rows.filter(r => r.word.trim() && r.meaning.trim()).length;

    // Thứ tự cột: Từ -> Phiên âm -> Nghĩa -> Ví dụ
    const columns = [
        {
            title: '#',
            dataIndex: 'index',
            key: 'index',
            width: 50,
            align: 'center' as const,
            render: (_: any, __: any, index: number) => <Text type="secondary">{index + 1}</Text>,
        },
        {
            title: <span>Từ tiếng Anh <Text type="danger">*</Text></span>,
            dataIndex: 'word',
            key: 'word',
            render: (text: string, record: FlashcardRow) => (
                <Input
                    placeholder="e.g. Resilient"
                    value={text}
                    onChange={(e) => updateField(record.id, 'word', e.target.value)}
                    onPressEnter={() => addRows(1)}
                />
            ),
        },
        {
            title: 'Phiên âm',
            dataIndex: 'pronunciation',
            key: 'pronunciation',
            render: (text: string, record: FlashcardRow) => (
                <Input
                    placeholder="/rɪˈzɪliənt/"
                    value={text}
                    onChange={(e) => updateField(record.id, 'pronunciation', e.target.value)}
                />
            ),
        },
        {
            title: <span>Nghĩa tiếng Việt <Text type="danger">*</Text></span>,
            dataIndex: 'meaning',
            key: 'meaning',
            render: (text: string, record: FlashcardRow) => (
                <Input
                    placeholder="Kiên cường"
                    value={text}
                    onChange={(e) => updateField(record.id, 'meaning', e.target.value)}
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
                />
            ),
        },
        {
            title: '',
            key: 'action',
            width: 50,
            render: (_: any, record: FlashcardRow) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => deleteRow(record.id)}
                    disabled={rows.length <= 1}
                />
            ),
        },
    ];

    return (
        <div style={{ padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                    <Title level={4} style={{ margin: 0 }}>➕ Tạo Flashcard Mới</Title>
                    <Text type="secondary">Mỗi hàng là một flashcard — nhấn <Text code>Enter</Text> để thêm hàng mới</Text>
                </div>
                <Space>
                    <Button icon={<PlusOutlined />} onClick={() => addRows(1)}>
                        Thêm hàng
                    </Button>
                    <Button icon={<PlusOutlined />} onClick={() => addRows(5)}>
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
                <Text>
                    Tổng cộng: <Text strong style={{ color: '#1890ff' }}>{validCount}</Text> từ hợp lệ
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
                            backgroundColor: validCount > 0 ? '#52c41a' : undefined,
                            borderColor: validCount > 0 ? '#52c41a' : undefined
                        }}
                    >
                        Lưu {validCount > 0 ? `${validCount} Flashcard` : ''}
                    </Button>
                </Space>
            </div>
        </div>
    );
};

export default CreateFlashcardForm;