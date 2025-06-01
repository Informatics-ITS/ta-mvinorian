import { NextRequest } from 'next/server';
import { z } from 'zod';

import { createRequest, withAsyncValidateRequest } from '@/lib/request';
import { createResponseJson } from '@/lib/response';
import { loginUserService } from '@/service/user-service';

export async function POST(request: NextRequest) {
  const userLoginSchema = await createRequest(request, ({ t }) => ({
    body: z.object({
      email: z.string().min(1, t('Request.email-is-required')).email(t('Request.invalid-email-address')),
      password: z.string().min(1, t('Request.password-is-required')),
    }),
  }));

  const res = await withAsyncValidateRequest(request, userLoginSchema, ({ t, body }) =>
    loginUserService(t, body.email, body.password),
  );

  if (!res.success) return createResponseJson(400, { success: false, message: res.message, data: res.data });

  return createResponseJson(200, { success: true, message: res.message, data: res.data });
}
