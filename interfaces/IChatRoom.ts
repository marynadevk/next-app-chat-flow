import { IUser } from './IUser';

export interface IChatRoom {
  id?: string;
  users: string[];
  usersData: IUsersData;
  timestamp: Date;
  lastMessage: string;
  myData?: IUser;
  otherData?: IUser;
}

export interface IUsersData {
  [key: string]: IUser;
}