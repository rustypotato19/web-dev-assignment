export type User = {
  uid: number;
  email: string;
  username: string;
  fullname: string;
  profile_image: string | null;
  created: string;
  updated: string;
};

export type List = {
  listid: number;
  name: string;
  description: string;
  members: number[];
  created: string;
  updated: string;
};