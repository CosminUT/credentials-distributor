import { createAdminSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get('email') || '');
  const password = String(formData.get('password') || '');

  if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.redirect(new URL('/admin?error=invalid', request.url));
  }

  await createAdminSession();
  return NextResponse.redirect(new URL('/admin', request.url));
}
