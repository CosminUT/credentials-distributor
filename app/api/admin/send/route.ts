import { isAdminAuthenticated } from '@/lib/auth';
import { db } from '@/lib/db';
import { decrypt } from '@/lib/crypto';
import { sendCredentialsEmail } from '@/lib/email';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  const formData = await request.formData();
  const requestId = String(formData.get('requestId') || '');
  const accountId = String(formData.get('accountId') || '');
  const adminEmail = process.env.ADMIN_EMAIL || 'admin';

  try {
    const result = await db.$transaction(async (tx) => {
      const pendingRequest = await tx.request.findUnique({ where: { id: requestId } });
      if (!pendingRequest || pendingRequest.status !== 'PENDING') {
        throw new Error('Request is not pending.');
      }

      const account = await tx.account.findUnique({ where: { id: accountId } });
      if (!account || account.status !== 'AVAILABLE') {
        throw new Error('Account is not available.');
      }

      const updatedAccount = await tx.account.updateMany({
        where: { id: accountId, status: 'AVAILABLE' },
        data: {
          status: 'SENT',
          assignedToEmail: pendingRequest.requesterEmail,
          assignedAt: new Date(),
          sentAt: new Date(),
        },
      });

      if (updatedAccount.count !== 1) {
        throw new Error('Account was already claimed by another action.');
      }

      await tx.request.update({
        where: { id: requestId },
        data: {
          status: 'FULFILLED',
          fulfilledAccountId: accountId,
        },
      });

      await tx.adminAction.create({
        data: {
          requestId,
          accountId,
          adminEmail,
          action: 'send_credentials',
        },
      });

      return {
        email: pendingRequest.requesterEmail,
        username: account.username,
        password: decrypt(account.passwordEncrypted),
      };
    });

    await sendCredentialsEmail(result.email, result.username, result.password);
    return NextResponse.redirect(new URL('/admin', request.url));
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(new URL('/admin?error=send', request.url));
  }
}
