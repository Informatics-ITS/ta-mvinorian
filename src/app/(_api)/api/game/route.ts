import { NextRequest } from 'next/server';

import { withAsyncAuthUser } from '@/lib/auth';
import { withAsyncValidateRequest } from '@/lib/request';
import { createResponseJson } from '@/lib/response';
import { getGameByUserIdService } from '@/service/game-service';

export async function GET(request: NextRequest) {
  const res = await withAsyncValidateRequest(request, {}, ({ t, token }) =>
    withAsyncAuthUser(token, ({ id: userId }) => getGameByUserIdService(t, userId)),
  );

  if (!res.success) return createResponseJson(400, { success: false, message: res.message, data: res.data });

  return createResponseJson(200, { success: true, message: res.message, data: res.data });
}
