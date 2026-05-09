'use client';

import React, { useState } from 'react';
import { List, Select, Tag, Button, Typography, Space, Tooltip, Empty, ConfigProvider, Input, Card, Divider, Dropdown, MenuProps, theme } from 'antd';
import { EditOutlined, DeleteOutlined, StarFilled, FilterOutlined, CheckCircleOutlined, BookOutlined, CloseCircleOutlined, UnorderedListOutlined, SaveOutlined, CloseOutlined, AudioOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

export interface Flashcard { id: string; word: string; meaning: string; pronunciation?: string; example?: string; createdAt?: string; status?: 'unknown' | 'learning' | 'mastered'; isFavorite?: boolean; }
type Status = 'unknown' | 'learning' | 'mastered';
export type FilterStatus = 'all' | Status;

interface FlashcardListProps { cards: Flashcard[]; onDelete?: (id: string) => void; onUpdate?: (id: string, updatedData: Partial<Flashcard>) => void; onSelect?: (id: string) => void; selectedId?: string; onFilterChange?: (filter: FilterStatus) => void; }

const STATUS_MAP: Record<Status, { label: string; color: string; icon: React.ReactNode }> = {
    mastered: { label: 'Thuộc', color: 'success', icon: <CheckCircleOutlined /> },
    learning: { label: 'Đang học', color: 'warning', icon: <BookOutlined /> },
    unknown: { label: 'Chưa biết', color: 'error', icon: <CloseCircleOutlined /> },
};

export const FlashcardList: React.FC<FlashcardListProps> = ({ cards, onDelete, onUpdate, onSelect, selectedId, onFilterChange }) => {
    const [filter, setFilter] = useState<FilterStatus>('all');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Flashcard>>({});

    const filteredCards = filter === 'all' ? cards : cards.filter(c => (c.status ?? 'unknown') === filter);
    const handleUpdateStatus = (id: string, newStatus: Status) => { onUpdate?.(id, { status: newStatus }); };
    const startEditing = (card: Flashcard) => { setEditingId(card.id); setEditForm(card); };

    return (
        <ConfigProvider theme={{
            algorithm: theme.darkAlgorithm,
            token: { borderRadius: 12, colorPrimary: '#6366f1', colorBgContainer: 'rgba(255,255,255,0.04)', colorBgElevated: '#1a1f35', colorBorder: 'rgba(255,255,255,0.06)', colorText: '#f1f5f9', colorTextSecondary: '#94a3b8' }
        }}>
            <div className="glass-card overflow-hidden flex flex-col">
                <div className="p-4 border-b border-white/[0.06] flex items-center justify-between sticky top-0 z-10 bg-surface-800/80 backdrop-blur-xl">
                    <Space direction="vertical" size={0}>
                        <Title level={5} style={{ margin: 0 }}>{cards.length} từ vựng</Title>
                        <Text type="secondary" style={{ fontSize: '12px' }}>{filteredCards.length} từ đang hiển thị</Text>
                    </Space>
                    <Select value={filter} onChange={(val) => { setFilter(val); onFilterChange?.(val); }} style={{ width: 150 }} suffixIcon={<FilterOutlined />}
                        options={[
                            { value: 'all', label: 'Tất cả', icon: <UnorderedListOutlined /> },
                            { value: 'unknown', label: 'Chưa biết', icon: <CloseCircleOutlined /> },
                            { value: 'learning', label: 'Đang học', icon: <BookOutlined /> },
                            { value: 'mastered', label: 'Thuộc', icon: <CheckCircleOutlined /> },
                        ].map(opt => ({ label: <Space>{opt.icon}{opt.label}</Space>, value: opt.value }))}
                    />
                </div>

                <div className="max-h-[650px] overflow-y-auto px-3 py-4">
                    <List dataSource={filteredCards} renderItem={(card) => {
                        const isEditing = editingId === card.id;
                        const status = card.status ?? 'unknown';
                        const config = STATUS_MAP[status];
                        const isSelected = selectedId === card.id;

                        const statusMenu: MenuProps['items'] = (Object.keys(STATUS_MAP) as Status[]).map((key) => ({
                            key, label: STATUS_MAP[key].label, icon: STATUS_MAP[key].icon, onClick: () => handleUpdateStatus(card.id, key),
                        }));

                        return (
                            <div className="mb-3 transition-all">
                                <List.Item onClick={() => !isEditing && onSelect?.(card.id)}
                                    className={`rounded-xl px-5 py-3 border transition-all ${isSelected && !isEditing ? 'border-accent-indigo/30 bg-accent-indigo/5 ring-1 ring-accent-indigo/10' : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]'}`}
                                    actions={isEditing ? [] : [
                                        <Button key="edit" type="text" size="small" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); startEditing(card); }} />,
                                        <Button key="delete" type="text" size="small" danger icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); onDelete?.(card.id); }} />
                                    ]}
                                    style={{ cursor: isEditing ? 'default' : 'pointer', paddingLeft: '10px' }}
                                >
                                    <List.Item.Meta
                                        title={<div style={{ marginBottom: 4 }}>
                                            <Space size="middle" align="center" style={{ display: 'flex', flexWrap: 'wrap' }}>
                                                <Text strong style={{ fontSize: '20px', lineHeight: '1.2' }}>{card.word}</Text>
                                                {card.pronunciation && <Text type="secondary" style={{ fontStyle: 'italic', fontSize: '14px' }}>/{card.pronunciation}/</Text>}
                                                <Dropdown menu={{ items: statusMenu }} trigger={['click']}>
                                                    <Tag color={config.color} icon={config.icon} className="cursor-pointer hover:opacity-80 transition-opacity"
                                                        style={{ display: 'inline-flex', alignItems: 'center', marginInlineEnd: 0, padding: '2px 8px', borderRadius: '6px', fontWeight: 500 }}
                                                        onClick={(e) => e.stopPropagation()}>{config.label}</Tag>
                                                </Dropdown>
                                                {card.isFavorite && <StarFilled style={{ color: '#fbbf24' }} />}
                                            </Space>
                                        </div>}
                                        description={<div className="flex flex-col gap-1">
                                            <Text style={{ color: '#fbbf24', fontSize: '16px', fontWeight: 500 }}>{card.meaning}</Text>
                                            {card.example && !isEditing && <Text type="secondary" italic style={{ fontSize: '13px' }}>{card.example}</Text>}
                                        </div>}
                                    />
                                </List.Item>
                                {isEditing && (
                                    <Card size="small" className="mt-2 border-accent-indigo/20" extra={<Button type="text" icon={<CloseOutlined />} onClick={() => setEditingId(null)} />}>
                                        <Space direction="vertical" className="w-full" size="middle">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div><Text style={{ fontSize: '12px' }} type="secondary">Từ vựng</Text><Input value={editForm.word} onChange={e => setEditForm({ ...editForm, word: e.target.value })} /></div>
                                                <div><Text style={{ fontSize: '12px' }} type="secondary">Phiên âm</Text><Input prefix={<AudioOutlined />} value={editForm.pronunciation} onChange={e => setEditForm({ ...editForm, pronunciation: e.target.value })} /></div>
                                            </div>
                                            <div><Text style={{ fontSize: '12px' }} type="secondary">Nghĩa</Text><Input value={editForm.meaning} onChange={e => setEditForm({ ...editForm, meaning: e.target.value })} /></div>
                                            <div className="flex justify-end gap-2 pt-2">
                                                <Button size="small" onClick={() => setEditingId(null)}>Hủy</Button>
                                                <Button size="small" type="primary" icon={<SaveOutlined />} onClick={() => { onUpdate?.(card.id, editForm); setEditingId(null); }}>Lưu</Button>
                                            </div>
                                        </Space>
                                    </Card>
                                )}
                            </div>
                        );
                    }} />
                </div>
            </div>
        </ConfigProvider>
    );
};