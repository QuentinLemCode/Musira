export const querystring = (obj: Record<string, string>) => {
  return Object.entries(obj)
    .map((entry) => entry.join('='))
    .join('&');
};
