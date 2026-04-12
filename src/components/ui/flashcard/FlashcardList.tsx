'use client';

import React, { useState } from 'react';
import {
    List,
    Select,
    Tag,
    Button,
    Typography,
    Space,
    Tooltip,
    Empty,
    ConfigProvider
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    StarFilled,
    FilterOutlined,
    CheckCircleOutlined,
    BookOutlined,
    CloseCircleOutlined,
    UnorderedListOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

type Status = 'unknown' | 'learning' | 'mastered';
type FilterStatus = 'all' | Status;

interface FlashcardListProps {
    cards: Array<{
        id: string;
        word: string;
        meaning: string;
        isFavorite?: boolean;
        status?: Status;
    }>;
    onSelect?: (id: string) => void;
    onDelete?: (id: string) => void;
    onEdit?: (id: string) => void;
    selectedId?: string;
}

const STATUS_MAP: Record<Status, { label: string; color: string; icon: React.ReactNode }> = {
    mastered: {
        label: 'Thuộc',
        color: 'success',
        icon: <CheckCircleOutlined />,
    },
    learning: {
        label: 'Đang học',
        color: 'warning',
        icon: <BookOutlined />,
    },
    unknown: {
        label: 'Chưa biết',
        color: 'error',
        icon: <CloseCircleOutlined />,
    },
};

export const FlashcardList: React.FC<FlashcardListProps> = ({
    cards,
    onSelect,
    onDelete,
    onEdit,
    selectedId,
}) => {
    const [filter, setFilter] = useState<FilterStatus>('all');

    const filteredCards = filter === 'all'
        ? cards
        : cards.filter(c => (c.status ?? 'unknown') === filter);

    const filterOptions = [
        { value: 'all', label: 'Tất cả', icon: <UnorderedListOutlined /> },
        { value: 'unknown', label: 'Chưa biết', icon: <CloseCircleOutlined /> },
        { value: 'learning', label: 'Đang học', icon: <BookOutlined /> },
        { value: 'mastered', label: 'Thuộc', icon: <CheckCircleOutlined /> },
    ];

    return (
        <ConfigProvider
            theme={{
                token: {
                    borderRadius: 12,
                    colorPrimary: '#1677ff',
                },
            }}
        >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                    <Space direction="vertical" size={0}>
                        <Title level={5} style={{ margin: 0 }}>
                            {cards.length} từ vựng
                        </Title>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {filteredCards.length} từ đang hiển thị
                        </Text>
                    </Space>

                    <Select
                        value={filter}
                        onChange={setFilter}
                        style={{ width: 140 }}
                        placeholder="Lọc trạng thái"
                        suffixIcon={<FilterOutlined />}
                        options={filterOptions.map(opt => ({
                            label: (
                                <Space>
                                    {opt.icon}
                                    {opt.label}
                                </Space>
                            ),
                            value: opt.value
                        }))}
                    />
                </div>

                {/* List */}
                <div className="max-h-[500px] overflow-y-auto px-2">
                    <List
                        dataSource={filteredCards}
                        locale={{
                            emptyText: <Empty description="Không có từ nào trong trạng thái này" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        }}
                        renderItem={(card: typeof cards[0]) => {
                            const status = card.status ?? 'unknown';
                            const config = STATUS_MAP[status];
                            const isSelected = selectedId === card.id;

                            return (
                                <List.Item
                                    onClick={() => onSelect?.(card.id)}
                                    className={`cursor-pointer transition-all duration-200 rounded-xl px-4 my-1 border-transparent hover:bg-gray-50 ${isSelected ? 'bg-blue-50 border-blue-200' : ''
                                        }`}
                                    style={{ border: '1px solid transparent' }}
                                    actions={[
                                        <Tooltip title="Chỉnh sửa" key="edit">
                                            <Button
                                                type="text"
                                                icon={<EditOutlined />}
                                                onClick={(e) => { e.stopPropagation(); onEdit?.(card.id); }}
                                            />
                                        </Tooltip>,
                                        <Tooltip title="Xóa" key="delete">
                                            <Button
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={(e) => { e.stopPropagation(); onDelete?.(card.id); }}
                                            />
                                        </Tooltip>
                                    ]}
                                >
                                    <List.Item.Meta
                                        title={
                                            <Space>
                                                <Text strong>{card.word}</Text>
                                                {card.isFavorite && <StarFilled style={{ color: '#faad14' }} />}
                                                <Tag color={config.color} icon={config.icon} style={{ marginLeft: 8 }}>
                                                    {config.label}
                                                </Tag>
                                            </Space>
                                        }
                                        description={
                                            <Text type="secondary" ellipsis={{ tooltip: card.meaning }}>
                                                {card.meaning}
                                            </Text>
                                        }
                                    />
                                </List.Item>
                            );
                        }}
                    />
                </div>
            </div>
        </ConfigProvider>
    );
};

export default FlashcardList;