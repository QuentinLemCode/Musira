export interface User {
  id: number;
  name: string;
}

export interface FullUser {
  id: number;
  name: string;
  ip: string;
  role: number;
  noIPverification: boolean;
  created_at: Date;
  updated_at: Date;
  loginTries: number;
  locked: boolean;
}
