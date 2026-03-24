import { cookies } from 'next/headers';
import crypto from 'crypto';

const COOKIE_NAME = 'admin_session';

function sign(payload: string) {
  const secret = process.env.ADMIN_PASSWORD || 'change-me';
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export async function createAdminSession() {
  const value = 'ok';
  const signature = sign(value);
  const store = await cookies();

  store.set(COOKIE_NAME, `${value}.${signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
}

export async function isAdminAuthenticated() {
  const store = await cookies();
  const cookie = store.get(COOKIE_NAME)?.value;
  if (!cookie) return false;
  const [value, signature] = cookie.split('.');
  return value === 'ok' && signature === sign(value);
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
