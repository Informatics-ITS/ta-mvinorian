export type ResponseType<TData = unknown> = {
  message: string;
  success: boolean;
  data?: TData;
};

export const createResponse = <TData>(options: ResponseType<TData>): ResponseType<TData> => {
  return options;
};

export const createResponseJson = <TData>(status = 200, options: ResponseType<TData>) => {
  return new Response(JSON.stringify(options), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
