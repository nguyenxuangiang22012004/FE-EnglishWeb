/**
 * Device Fingerprint & Trial Anti-Abuse Utility
 * Lưu trữ mã định danh thiết bị duy nhất trong cả LocalStorage và Cookie (365 ngày)
 * Đảm bảo chống gian lận dùng thử đa tầng.
 */

const DEVICE_ID_KEY = 'trial_device_id';
const COOKIE_EXPIRE_DAYS = 365;

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days = COOKIE_EXPIRE_DAYS): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

/**
 * Sinh UUID v4 đơn giản kết hợp đặc trưng trình duyệt
 */
function generateFingerprintId(): string {
  const nav = typeof navigator !== 'undefined' ? navigator : ({} as Navigator);
  const screen = typeof window !== 'undefined' ? window.screen : { width: 0, height: 0, colorDepth: 0 };
  
  const rawData = [
    nav.userAgent || '',
    nav.language || '',
    screen.width + 'x' + screen.height,
    screen.colorDepth || '',
    new Date().getTimezoneOffset(),
    Math.random().toString(36).substring(2),
    Date.now().toString(36),
  ].join('|');

  // Simple hash to random-like UUID
  let hash = 0;
  for (let i = 0; i < rawData.length; i++) {
    const chr = rawData.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }

  const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
  const randomPart = Math.random().toString(36).substring(2, 10);
  const timePart = Date.now().toString(16);

  return `dev_${hexHash}_${randomPart}_${timePart}`;
}

/**
 * Lấy Device ID duy nhất (Đồng bộ giữa LocalStorage và Cookie)
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') {
    return 'server_render_device';
  }

  let localId: string | null = null;
  try {
    localId = localStorage.getItem(DEVICE_ID_KEY);
  } catch (e) {
    console.warn('LocalStorage không khả dụng:', e);
  }

  let cookieId = getCookie(DEVICE_ID_KEY);

  let finalId = localId || cookieId;

  if (!finalId) {
    finalId = generateFingerprintId();
  }

  // Đồng bộ lại cả 2 nơi nếu 1 nơi bị thiếu
  try {
    if (localStorage.getItem(DEVICE_ID_KEY) !== finalId) {
      localStorage.setItem(DEVICE_ID_KEY, finalId);
    }
  } catch (e) {
    // Ignore localStorage quota errors
  }

  if (cookieId !== finalId) {
    setCookie(DEVICE_ID_KEY, finalId);
  }

  return finalId;
}

/**
 * Đánh dấu tính năng đã hết lượt dùng thử trên Client (cả Cookie và LocalStorage)
 */
export function markFeatureTrialExhausted(featureName: string): void {
  if (typeof window === 'undefined') return;
  const key = `trial_exhausted_${featureName.toLowerCase()}`;
  try {
    localStorage.setItem(key, 'true');
  } catch (e) {}
  setCookie(key, 'true');
}

/**
 * Kiểm tra nhanh trên Client xem tính năng đã bị đánh dấu hết lượt hay chưa
 */
export function isFeatureTrialExhaustedLocal(featureName: string): boolean {
  if (typeof window === 'undefined') return false;
  const key = `trial_exhausted_${featureName.toLowerCase()}`;
  const fromLocal = localStorage.getItem(key) === 'true';
  const fromCookie = getCookie(key) === 'true';
  return fromLocal || fromCookie;
}

/**
 * Xóa cờ đánh dấu (khi user đã nhập key cá nhân hoặc test lại)
 */
export function clearFeatureTrialExhaustedLocal(featureName: string): void {
  if (typeof window === 'undefined') return;
  const key = `trial_exhausted_${featureName.toLowerCase()}`;
  try {
    localStorage.removeItem(key);
  } catch (e) {}
  setCookie(key, '', -1);
}
