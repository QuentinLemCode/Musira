import { createHmac } from 'crypto';

export const hashPassword = (password: string, salt: string) => {
  const hmac = createHmac('sha256', salt);
  hmac.update(password);
  return hmac.digest('base64');
};
