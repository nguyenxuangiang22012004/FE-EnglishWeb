'use client';

import React, { useEffect, useState } from 'react';
import {
  Key,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Zap,
  Activity,
  ShieldAlert,
  Edit2,
  Play,
  RotateCw,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import adminAiService from '@/services/adminAiService';
import { AdminAiKeyDTO, AdminAiStatsDTO, AiKeyTestResponse } from '@/types/aiSettings';
import { MODEL_ROTATION_CHAIN } from '@/services/geminiHelpers';

export const AdminAiSettings: React.FC = () => {
  const [keys, setKeys] = useState<AdminAiKeyDTO[]>([]);
  const [stats, setStats] = useState<AdminAiStatsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal thêm / sửa key
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<AdminAiKeyDTO | null>(null);
  const [keyNameInput, setKeyNameInput] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isActiveInput, setIsActiveInput] = useState(true);
  const [saving, setSaving] = useState(false);

  // Test key
  const [testingKeyId, setTestingKeyId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<AiKeyTestResponse | null>(null);
  const [modalTesting, setModalTesting] = useState(false);
  const [modalTestResult, setModalTestResult] = useState<AiKeyTestResponse | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [keysData, statsData] = await Promise.all([
        adminAiService.getAllKeys(),
        adminAiService.getStats(),
      ]);
      setKeys(keysData);
      setStats(statsData);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Không thể tải dữ liệu AI');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingKey(null);
    setKeyNameInput('');
    setApiKeyInput('');
    setIsActiveInput(true);
    setModalTestResult(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (k: AdminAiKeyDTO) => {
    setEditingKey(k);
    setKeyNameInput(k.keyName);
    setApiKeyInput(''); // Giữ trống nếu không muốn đổi key
    setIsActiveInput(k.active);
    setModalTestResult(null);
    setIsModalOpen(true);
  };

  const handleTestModalKey = async () => {
    if (!apiKeyInput.trim()) {
      alert('Vui lòng nhập chuỗi API Key để kiểm tra');
      return;
    }
    setModalTesting(true);
    setModalTestResult(null);
    try {
      const res = await adminAiService.testKey(apiKeyInput.trim(), 'gemini-2.5-flash');
      setModalTestResult(res);
    } catch (err: any) {
      setModalTestResult({
        success: false,
        message: err.response?.data?.message || err.message || 'Lỗi kiểm tra key',
        testedModel: 'gemini-2.5-flash',
        latencyMs: 0,
      });
    } finally {
      setModalTesting(false);
    }
  };

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyNameInput.trim()) {
      alert('Vui lòng nhập tên nhận diện cho Key');
      return;
    }
    if (!editingKey && !apiKeyInput.trim()) {
      alert('Vui lòng nhập chuỗi API Key của Google Gemini');
      return;
    }

    setSaving(true);
    try {
      if (editingKey) {
        await adminAiService.updateKey(editingKey.id, {
          keyName: keyNameInput.trim(),
          apiKey: apiKeyInput.trim() || undefined,
          isActive: isActiveInput,
        });
      } else {
        await adminAiService.createKey({
          keyName: keyNameInput.trim(),
          apiKey: apiKeyInput.trim(),
          isActive: isActiveInput,
        });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Lỗi khi lưu key');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteKey = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa Admin API Key "${name}"?`)) return;
    try {
      await adminAiService.deleteKey(id);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể xóa key');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await adminAiService.toggleKeyStatus(id);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể đổi trạng thái');
    }
  };

  const handleTestKey = async (k: AdminAiKeyDTO) => {
    setTestingKeyId(k.id);
    setTestResult(null);
    try {
      // Test key đã lưu bằng endpoint backend giải mã và kiểm tra trực tiếp
      const res = await adminAiService.testKeyById(k.id, 'gemini-2.5-flash');
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.response?.data?.message || err.message || 'Lỗi kiểm tra key',
        testedModel: 'gemini-2.5-flash',
        latencyMs: 0,
      });
    } finally {
      setTestingKeyId(null);
    }
  };

  const featureLabels: Record<string, string> = {
    'ai-listening': 'Luyện nghe AI',
    'ai-writing': 'Luyện viết & Chấm bài AI',
    'ai-conversation': 'Giao tiếp phản xạ AI',
    'ai-lookup': 'Tra cứu từ vựng AI',
    'ai-import': 'Import bài học tự động',
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ─── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-accent-indigo/20 text-accent-indigo">
              <Sparkles size={22} />
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Quản lý Hệ thống AI & API Keys
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Quản lý Admin API Key cho chế độ Dùng thử (Trial), cấu hình chống gian lận và theo dõi xoay tua mô hình Gemini.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-slate-300 border border-white/10 text-sm font-medium transition-all"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Làm mới
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-indigo hover:bg-accent-indigo-light text-white text-sm font-semibold shadow-lg shadow-accent-indigo/25 transition-all"
          >
            <Plus size={16} />
            Thêm Admin API Key
          </button>
        </div>
      </div>

      {/* ─── Error Alert ───────────────────────────────────────────────────── */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3">
          <ShieldAlert size={20} className="flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* ─── Stats Grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/[0.06] bg-surface-800/60 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Key size={20} />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300">
              Admin Keys
            </span>
          </div>
          <p className="text-2xl font-bold text-white mb-0.5">
            {stats ? stats.totalAdminKeys : 0}
          </p>
          <p className="text-xs text-slate-400">Tổng số khóa API Admin trong kho</p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-surface-800/60 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Zap size={20} />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">
              Active
            </span>
          </div>
          <p className="text-2xl font-bold text-white mb-0.5">
            {stats ? stats.activeAdminKeys : 0}
          </p>
          <p className="text-xs text-slate-400">Key đang sẵn sàng cấp lượt dùng thử</p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-surface-800/60 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Cpu size={20} />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300">
              Thiết bị
            </span>
          </div>
          <p className="text-2xl font-bold text-white mb-0.5">
            {stats ? stats.totalTrialDevices : 0}
          </p>
          <p className="text-xs text-slate-400">Thiết bị duy nhất đã dùng thử</p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-surface-800/60 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Activity size={20} />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300">
              Prompts
            </span>
          </div>
          <p className="text-2xl font-bold text-white mb-0.5">
            {stats ? stats.totalTrialPromptsUsed : 0}
          </p>
          <p className="text-xs text-slate-400">Tổng số lượt prompt trial đã xử lý</p>
        </div>
      </div>

      {/* ─── Model Rotation Chain Banner ───────────────────────────────────── */}
      <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-r from-surface-800/90 via-surface-900 to-indigo-950/40 p-6">
        <div className="flex items-center gap-2 mb-3">
          <RotateCw size={18} className="text-accent-indigo" />
          <h2 className="text-base font-bold text-white">
            Chuỗi Xoay Tua Mô Hình AI Tự Động (AI Fallback & Rotation Sequence)
          </h2>
        </div>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Khi một mô hình gặp sự cố giới hạn hạn mức (HTTP 429 Quota Exceeded), quá tải (503 Overloaded) hoặc không khả dụng, hệ thống tự động xoay tua ngay sang mô hình tiếp theo mà không làm gián đoạn người dùng.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {MODEL_ROTATION_CHAIN.map((model, idx) => (
            <div key={model} className="flex items-center gap-2">
              <span
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-medium ${
                  idx === 0
                    ? 'bg-accent-indigo/20 border-accent-indigo/50 text-indigo-300 shadow-sm shadow-accent-indigo/20 font-bold'
                    : 'bg-surface-950/60 border-white/[0.08] text-slate-300'
                }`}
              >
                {idx === 0 && <span className="text-amber-400 mr-1.5">★ Khởi đầu:</span>}
                {model}
              </span>
              {idx < MODEL_ROTATION_CHAIN.length - 1 && (
                <span className="text-slate-600 text-xs">→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Feature Trial Breakdown ────────────────────────────────────────── */}
      {stats && stats.usageByFeature && Object.keys(stats.usageByFeature).length > 0 && (
        <div className="rounded-2xl border border-white/[0.06] bg-surface-800/40 p-6">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Layers size={18} className="text-cyan-400" />
            Lượt dùng thử theo từng Tính năng AI
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.usageByFeature).map(([feature, count]) => (
              <div
                key={feature}
                className="p-4 rounded-xl bg-surface-900/80 border border-white/[0.04] flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    {featureLabels[feature] || feature}
                  </p>
                  <p className="text-xs text-slate-500 font-mono">{feature}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-cyan-400">{count}</p>
                  <p className="text-[11px] text-slate-500">lượt prompt</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Keys Table ────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/[0.06] bg-surface-800/40 overflow-hidden">
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Key size={18} className="text-indigo-400" />
            Danh sách Admin API Keys
          </h2>
          <span className="text-xs text-slate-400">
            {keys.length} khóa được cấu hình
          </span>
        </div>

        {keys.length === 0 ? (
          <div className="p-12 text-center">
            <Key size={40} className="text-slate-600 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-300 mb-1">Chưa có Admin API Key nào</p>
            <p className="text-sm text-slate-500 mb-4">
              Hãy thêm ít nhất 1 API Key để cho phép người dùng dùng thử các tính năng AI.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-indigo hover:bg-accent-indigo-light text-white text-sm font-semibold transition-all"
            >
              <Plus size={16} />
              Thêm Key ngay
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] text-xs font-semibold text-slate-400 uppercase tracking-wider bg-surface-900/50">
                  <th className="py-3.5 px-5">Tên nhận diện</th>
                  <th className="py-3.5 px-5">Mã Key (Masked)</th>
                  <th className="py-3.5 px-5">Trạng thái</th>
                  <th className="py-3.5 px-5">Lượt đã phục vụ</th>
                  <th className="py-3.5 px-5">Lần cuối dùng</th>
                  <th className="py-3.5 px-5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-sm">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-5">
                      <p className="font-semibold text-white">{k.keyName}</p>
                      <p className="text-xs text-slate-500 font-mono">
                        {new Date(k.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-surface-950 border border-white/10 text-slate-300">
                        {k.maskedKey}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <button
                        onClick={() => handleToggleStatus(k.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
                          k.active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-slate-500/10 text-slate-400 border-slate-500/30 hover:bg-slate-500/20'
                        }`}
                      >
                        {k.active ? (
                          <>
                            <CheckCircle size={13} />
                            Đang hoạt động
                          </>
                        ) : (
                          <>
                            <XCircle size={13} />
                            Tạm dừng
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-semibold text-slate-200">
                        {k.usageCount.toLocaleString('vi-VN')}
                      </span>
                      <span className="text-xs text-slate-500 ml-1">lượt</span>
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-400">
                      {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString('vi-VN') : 'Chưa sử dụng'}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleTestKey(k)}
                          disabled={testingKeyId === k.id}
                          title="Kiểm tra kết nối Gemini API"
                          className="p-2 rounded-lg bg-surface-800 hover:bg-surface-700 text-slate-300 hover:text-white border border-white/5 transition-colors"
                        >
                          <Play size={14} className={testingKeyId === k.id ? 'animate-pulse text-amber-400' : ''} />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(k)}
                          title="Chỉnh sửa"
                          className="p-2 rounded-lg bg-surface-800 hover:bg-surface-700 text-slate-300 hover:text-white border border-white/5 transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteKey(k.id, k.keyName)}
                          title="Xóa Key"
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Test Result Toast / Feedback ───────────────────────────────────── */}
      {testResult && (
        <div
          className={`p-4 rounded-xl border flex items-start justify-between gap-3 animate-slideUp ${
            testResult.success
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {testResult.success ? (
              <CheckCircle size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-sm font-semibold">{testResult.message}</p>
              <p className="text-xs opacity-80 mt-0.5">
                Model: <code>{testResult.testedModel}</code> | Độ trễ: {testResult.latencyMs}ms
              </p>
            </div>
          </div>
          <button
            onClick={() => setTestResult(null)}
            className="text-slate-400 hover:text-white text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* ─── Add / Edit Modal ──────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-surface-900 border border-white/10 p-6 shadow-2xl relative animate-scaleUp">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Key size={20} className="text-accent-indigo" />
              {editingKey ? 'Chỉnh sửa Admin API Key' : 'Thêm Admin API Key Mới'}
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Key sẽ được mã hóa an toàn theo chuẩn AES-256-GCM trước khi lưu vào Database.
            </p>

            <form onSubmit={handleSaveKey} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Tên nhận diện
                </label>
                <input
                  type="text"
                  required
                  value={keyNameInput}
                  onChange={(e) => setKeyNameInput(e.target.value)}
                  placeholder="VD: Admin Primary Key 1, Dự phòng 2..."
                  className="w-full rounded-xl bg-surface-950 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-indigo"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Chuỗi API Key (Google Gemini)
                  </label>
                  {apiKeyInput.trim() && (
                    <button
                      type="button"
                      onClick={handleTestModalKey}
                      disabled={modalTesting}
                      className="text-xs text-accent-indigo hover:text-accent-indigo-light flex items-center gap-1 font-semibold"
                    >
                      <Play size={12} className={modalTesting ? 'animate-pulse text-amber-400' : ''} />
                      {modalTesting ? 'Đang kiểm tra...' : 'Kiểm tra Key này'}
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required={!editingKey}
                  value={apiKeyInput}
                  onChange={(e) => {
                    setApiKeyInput(e.target.value);
                    setModalTestResult(null);
                  }}
                  placeholder={
                    editingKey
                      ? 'Để trống nếu không muốn thay đổi key hiện tại'
                      : 'AIzaSy...'
                  }
                  className="w-full rounded-xl bg-surface-950 border border-white/10 px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-accent-indigo"
                />

                {modalTestResult && (
                  <div
                    className={`mt-2 p-3 rounded-lg border text-xs flex items-start gap-2 ${
                      modalTestResult.success
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-red-500/10 border-red-500/30 text-red-300'
                    }`}
                  >
                    {modalTestResult.success ? (
                      <CheckCircle size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold">{modalTestResult.message}</p>
                      {modalTestResult.latencyMs > 0 && (
                        <p className="opacity-80 mt-0.5">Độ trễ: {modalTestResult.latencyMs}ms</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeCheckbox"
                  checked={isActiveInput}
                  onChange={(e) => setIsActiveInput(e.target.checked)}
                  className="rounded border-white/10 bg-surface-950 text-accent-indigo focus:ring-0 w-4 h-4"
                />
                <label htmlFor="activeCheckbox" className="text-sm text-slate-300 cursor-pointer">
                  Kích hoạt key này cho chế độ Dùng thử ngay
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-slate-300 text-sm font-medium transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-accent-indigo hover:bg-accent-indigo-light text-white text-sm font-semibold shadow-lg shadow-accent-indigo/25 transition-all disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : editingKey ? 'Cập nhật' : 'Thêm Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAiSettings;
