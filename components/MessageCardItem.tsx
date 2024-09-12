import React, { FC } from 'react';
import moment from 'moment';
import { IUser, IMessage } from '@/interfaces/index';

type Props = {
  message: IMessage;
  me: IUser;
  other: IUser;
};

const MessageCardItem: FC<Props> = ({ message, me, other }) => {
  const isMessageFromMe = message.sender === me.id;

  const formatTimeAgo = (timestamp: any) => {
    const date = timestamp?.toDate();
    const momentDate = moment(date);
    return momentDate.fromNow();
  };

  return (
    <div
      key={message.id}
      className={`flex mb-4 ${
        isMessageFromMe ? 'justify-end' : 'justify-start'
      }`}
    >
      <div className={`w-10 h-10 ${isMessageFromMe ? 'ml-2 mr-2' : 'mr-2'}`}>
        <img
          className="w-full h-full object-cover rounded-full"
          src={isMessageFromMe ? me.avatarUrl : other.avatarUrl}
          alt="Avatar"
        />
      </div>

      <div
        className={` text-white p-2 rounded-md ${
          isMessageFromMe
            ? 'bg-custom-hover self-end'
            : 'bg-custom-primary self-start'
        }`}
      >
        {message.image && (
          <img src={message.image} className="max-h-60 w-60 mb-4" />
        )}
        <p>{message.content}</p>
        <div className="text-xs text-gray-200">
          {formatTimeAgo(message.time)}
        </div>
      </div>
    </div>
  );
};

export default MessageCardItem;
