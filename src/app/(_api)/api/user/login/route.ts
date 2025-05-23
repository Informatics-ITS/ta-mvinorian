import { NextRequest } from 'next/server';
import { z } from 'zod';

import { createRequest, withAsyncValidateRequest } from '@/lib/request';
import { createResponseJson } from '@/lib/response';
import { loginUserService } from '@/service/user-service';

const userLoginSchema = createRequest({
  body: z.object({
    email: z.string().min(1, 'email is required').email('invalid email address'),
    password: z.string().min(1, 'password is required'),
  }),
});

export async function POST(request: NextRequest) {
  const res = await withAsyncValidateRequest(request, userLoginSchema, ({ body }) =>
    loginUserService(body.email, body.password),
  );

  if (!res.success) return createResponseJson(400, { success: false, message: res.message, data: res.data });

  return createResponseJson(200, { success: true, message: res.message, data: res.data });
}
