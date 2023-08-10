export interface UserDTO {
  id: number;
  name: string;
  role: number;
  created_at: string;
  updated_at: string;
  locked?: boolean;
  loginTries?: number;
  type: string;
}
