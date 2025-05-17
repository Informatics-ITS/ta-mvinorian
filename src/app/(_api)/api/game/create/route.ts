import { NextRequest } from 'next/server';

import { withAsyncAuthUser } from '@/lib/auth';
import { withAsyncValidateRequest } from '@/lib/request';
import { createResponseJson } from '@/lib/response';
import { createGameService } from '@/service/game-service';

export async function POST(request: NextRequest) {
  const res = await withAsyncValidateRequest(request, {}, ({ token }) =>
    withAsyncAuthUser(token, ({ id: userId }) => createGameService(userId)),
  );

  if (!res.success) return createResponseJson(400, { success: false, message: res.message, data: res.data });

  return createResponseJson(200, { success: true, message: res.message, data: res.data });
}
