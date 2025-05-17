import { NextRequest } from 'next/server';
import { z } from 'zod';

import { withAsyncAuthUser } from '@/lib/auth';
import { createRequest, withAsyncValidateRequest } from '@/lib/request';
import { createResponseJson } from '@/lib/response';
import { joinGameService } from '@/service/game-service';

const joinGameSchema = createRequest({
  body: z.object({
    code: z.string().min(6, 'code must be 6 characters long').max(6, 'code must be 6 characters long'),
  }),
});

export async function POST(request: NextRequest) {
  const res = await withAsyncValidateRequest(request, joinGameSchema, ({ body, token }) =>
    withAsyncAuthUser(token, ({ id: userId }) => joinGameService(userId, body.code)),
  );

  if (!res.success) return createResponseJson(400, { success: false, message: res.message, data: res.data });

  return createResponseJson(200, { success: true, message: res.message, data: res.data });
}
