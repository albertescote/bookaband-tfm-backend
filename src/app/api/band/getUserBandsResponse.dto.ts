export interface GetUserBandsResponse {
  id: string;
  name: string;
  offer?: {
    id: string;
    bandId: string;
    price: number;
    description?: string;
  };
}
