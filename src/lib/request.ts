import { NextRequest } from 'next/server';
import queryString from 'query-string';
import { ZodError, ZodSchema } from 'zod';

import { createResponse, ResponseType } from './response';

export type RequestSchema<TQuery, TBody> = {
  query?: ZodSchema<TQuery>;
  body?: ZodSchema<TBody>;
};

export type RequestType<TQuery, TBody> = {
  query: TQuery;
  body: TBody;
  token: string | undefined;
};

export const createRequest = <TQuery, TBody>(schema: RequestSchema<TQuery, TBody>) => {
  return schema;
};

export const getRequestToken = (request: NextRequest) => {
  const token = request.headers.get('authorization');
  if (!token) return undefined;

  const bearer = token.split(' ');
  if (bearer.length !== 2) return undefined;

  return bearer[1];
};

export const validateRequest = async <TQuery, TBody>(request: NextRequest, schema: RequestSchema<TQuery, TBody>) => {
  const { query, body } = schema;
  const req = {
    query: queryString.parse(request.nextUrl.searchParams.toString()),
    body: body ? await request.json() : undefined,
    token: getRequestToken(request),
  };

  let error: ZodError<unknown> | undefined;

  if (query) {
    const parsed = query.safeParse(req.query);
    if (!parsed.success) error = parsed.error;
  }

  if (body) {
    const parsed = body.safeParse(req.body);
    if (!parsed.success) error = parsed.error;
  }

  if (error)
    return createResponse({
      success: false,
      message: `${error.issues[0].path[0]} ${error.issues[0].message}`.toLowerCase(),
      data: undefined,
    });

  return createResponse({ success: true, message: 'valid request', data: req as RequestType<TQuery, TBody> });
};

export const withValidateRequest = async <TQuery, TBody, TData>(
  request: NextRequest,
  schema: RequestSchema<TQuery, TBody>,
  onSuccess: ({ body, query }: RequestType<TQuery, TBody>) => ResponseType<TData>,
) => {
  const validate = await validateRequest(request, schema);
  if (!validate.success) return validate;

  const { data } = validate;
  if (!data) return createResponse({ success: false, message: 'invalid request', data: undefined });

  return onSuccess(data);
};

export const withAsyncValidateRequest = async <TQuery, TBody, TData>(
  request: NextRequest,
  schema: RequestSchema<TQuery, TBody>,
  onSuccess: ({ body, query }: RequestType<TQuery, TBody>) => Promise<ResponseType<TData>>,
) => {
  const validate = await validateRequest(request, schema);
  if (!validate.success) return validate;

  const { data } = validate;
  if (!data) return createResponse({ success: false, message: 'invalid request', data: undefined });

  return await onSuccess(data);
};
