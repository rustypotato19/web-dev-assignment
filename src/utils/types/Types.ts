export type User = {
  uid: number;
  email: string;
  username: string;
  fullname: string;
  profile_image: string | null;
  date_of_birth: string;
  created: string;
  updated: string;
};

export type List = {
  listid: number;
  owner_uid?: number;
  name: string;
  description: string;
  members: number[];
  created: string;
  updated: string;
};