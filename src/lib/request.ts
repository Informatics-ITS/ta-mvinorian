import { NextRequest } from 'next/server';
import { getTranslations } from 'next-intl/server';
import queryString from 'query-string';
import { ZodError, ZodSchema } from 'zod';

import { defaultLocale, Locale } from '@/i18n/config';

import { createResponse, ResponseType } from './response';

export type RequestSchema<TQuery, TBody> = {
  query?: ZodSchema<TQuery>;
  body?: ZodSchema<TBody>;
};

export type RequestType<TQuery, TBody> = {
  query: TQuery;
  body: TBody;
  token: string | undefined;
  t: (key: string) => string;
};

export const getRequestToken = (request: NextRequest) => {
  const token = request.headers.get('authorization');
  if (!token) return undefined;

  const bearer = token.split(' ');
  if (bearer.length !== 2) return undefined;

  return bearer[1];
};

export const getRequestTranslations = async (request: NextRequest) => {
  const locale = (request.cookies.get('@node-clash/locale')?.value ?? defaultLocale) as Locale;
  const t = (await getTranslations({ locale })) as (key: string) => string;
  return t;
};

export const createRequest = async <TQuery, TBody>(
  request: NextRequest,
  builder: (params: { t: (key: string) => string }) => RequestSchema<TQuery, TBody>,
) => {
  const t = await getRequestTranslations(request);
  return builder({ t });
};

export const validateRequest = async <TQuery, TBody>(request: NextRequest, schema: RequestSchema<TQuery, TBody>) => {
  const { query, body } = schema;
  const req: RequestType<TQuery, TBody> = {
    query: queryString.parse(request.nextUrl.searchParams.toString()) as TQuery,
    body: body ? await request.json() : undefined,
    token: getRequestToken(request),
    t: await getRequestTranslations(request),
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
      message: `${error.issues[0].message}`.toLowerCase(),
      data: undefined,
    });

  return createResponse({ success: true, message: req.t('Response.valid-request'), data: req });
};

export const withValidateRequest = async <TQuery, TBody, TData>(
  request: NextRequest,
  schema: RequestSchema<TQuery, TBody>,
  onSuccess: (params: RequestType<TQuery, TBody>) => ResponseType<TData>,
) => {
  const validate = await validateRequest(request, schema);
  if (!validate.success) return validate;

  const { data } = validate;
  if (!data) {
    const t = await getRequestTranslations(request);
    return createResponse({ success: false, message: t('Response.invalid-request'), data: undefined });
  }

  return onSuccess(data);
};

export const withAsyncValidateRequest = async <TQuery, TBody, TData>(
  request: NextRequest,
  schema: RequestSchema<TQuery, TBody>,
  onSuccess: (params: RequestType<TQuery, TBody>) => Promise<ResponseType<TData>>,
) => {
  const validate = await validateRequest(request, schema);
  if (!validate.success) return validate;

  const { data } = validate;
  if (!data) {
    const t = await getRequestTranslations(request);
    return createResponse({ success: false, message: t('Response.invalid-request'), data: undefined });
  }

  return await onSuccess(data);
};
