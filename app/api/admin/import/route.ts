import { isAdminAuthenticated } from '@/lib/auth';
import { parseAccountsCsv } from '@/lib/csv';
import { db } from '@/lib/db';
import { encrypt } from '@/lib/crypto';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  try {
    const formData = await request.formData();
    const csvText = String(formData.get('csvText') || '');
    const rows = parseAccountsCsv(csvText);

    if (!rows.length) {
      throw new Error('No rows found in CSV.');
    }

    await db.account.createMany({
      data: rows.map((row) => ({
        username: row.username,
        passwordEncrypted: encrypt(row.password),
        label: row.label || undefined,
      })),
    });

    return NextResponse.redirect(new URL('/admin', request.url));
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(new URL('/admin?error=import', request.url));
  }
}
