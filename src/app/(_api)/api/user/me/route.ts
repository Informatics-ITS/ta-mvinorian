import { NextRequest } from 'next/server';

import { withAsyncAuthUser } from '@/lib/auth';
import { validateRequest } from '@/lib/request';
import { createResponseJson } from '@/lib/response';
import { getMeService } from '@/service/user-service';

export async function GET(request: NextRequest) {
  const val = await validateRequest(request, {});
  if (!val.success) return createResponseJson(400, { success: false, message: val.message, data: val.data });

  const res = await withAsyncAuthUser(val.data?.token, (user) => getMeService(user.id));
  if (!res.success) return createResponseJson(400, { success: false, message: res.message, data: res.data });

  const { id: _, ...user } = res.data ?? {};
  return createResponseJson(200, { success: true, message: res.message, data: user });
}
