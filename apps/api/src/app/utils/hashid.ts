import Hashids from 'hashids/cjs/hashids';

const hashids = new Hashids('musira', 8);

export const hashIdDecode = (id: string) => {
  const [decodedId] = hashids.decode(id);
  return Number(decodedId);
};

export const hashIdEncode = (id: number) => {
  return hashids.encode(id);
};
