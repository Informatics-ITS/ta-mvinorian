const secret = process.env.NEXT_PUBLIC_COOKIE_SECRET as string;
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const getKey = async (): Promise<CryptoKey> => {
  const keyData = textEncoder.encode(secret.padEnd(32).slice(0, 32));
  return await crypto.subtle.importKey('raw', keyData, 'AES-GCM', false, ['encrypt', 'decrypt']);
};

export const encrypt = async (data: string): Promise<string> => {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, textEncoder.encode(data));

  const buffer = new Uint8Array(iv.byteLength + encrypted.byteLength);
  buffer.set(iv, 0);
  buffer.set(new Uint8Array(encrypted), iv.byteLength);

  return btoa(String.fromCharCode(...buffer));
};

export const decrypt = async (data: string): Promise<string> => {
  const raw = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
  const iv = raw.slice(0, 12);
  const encrypted = raw.slice(12);

  const key = await getKey();

  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted);
  return textDecoder.decode(decrypted);
};
