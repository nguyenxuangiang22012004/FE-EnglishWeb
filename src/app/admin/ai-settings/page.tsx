import React from 'react';
import AdminAiSettings from '@/components/admin/AdminAiSettings';

export const metadata = {
  title: 'Quản lý AI & API Key | Admin Panel',
  description: 'Quản trị hệ thống AI, API Keys dùng thử và xoay tua mô hình Gemini',
};

export default function AdminAiSettingsPage() {
  return <AdminAiSettings />;
}
