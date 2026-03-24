import { db } from '@/lib/db';
import { sendAdminNotification } from '@/lib/email';
import { z } from 'zod';

const bodySchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());

    const created = await db.request.create({
      data: {
        requesterEmail: body.email.toLowerCase(),
      },
    });

    await sendAdminNotification(created.requesterEmail, created.id);

    return Response.json({ ok: true, requestId: created.id });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Unable to submit request.' }, { status: 400 });
  }
}
