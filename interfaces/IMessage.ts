import { IUser } from './IUser';

export interface IMessage {
    id?: string;
    sender: Pick<IUser, 'id'>;
    avatarUrl: Pick<IUser, 'avatarUrl'>;
    content?: string;
    time: Date;
    image?: string;
};
