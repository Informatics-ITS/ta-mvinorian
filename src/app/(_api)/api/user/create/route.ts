import { NextRequest } from 'next/server';
import { z } from 'zod';

import { createRequest, withAsyncValidateRequest } from '@/lib/request';
import { createResponseJson } from '@/lib/response';
import { createUserService } from '@/service/user-service';

export const userCreateSchema = createRequest({
  body: z.object({
    name: z.string().min(1, 'name is required'),
    email: z.string().min(1, 'email is required').email('invalid email address'),
    password: z.string().min(1, 'password is required'),
  }),
});

export async function POST(request: NextRequest) {
  const res = await withAsyncValidateRequest(request, userCreateSchema, ({ body }) => createUserService(body));

  if (!res.success) return createResponseJson(400, { success: false, message: res.message, data: res.data });

  return createResponseJson(200, { success: true, message: res.message, data: res.data });
}
