import React, { useState, useEffect, useRef, FC } from 'react';
import toast from 'react-hot-toast';
import { IChatRoom, IMessage } from '@/interfaces/index';
import { createNewMessage } from '@/lib/firebaseMethods';
import { getMessages } from '@/lib/firebaseMethods';
import { ERROR_MESSAGE } from '@/constants/constants';
import { scrollToBottom } from '@/helpers/helpers';
import MessageCardItem from './MessageCardItem';
import MessageInput from './MessageInput';

type Props = {
  selectedChatRoom: IChatRoom | null;
};

const ChatRoom: FC<Props> = ({ selectedChatRoom }) => {
  const me = selectedChatRoom?.myData;
  const other = selectedChatRoom?.otherData;
  const chatRoomId = selectedChatRoom?.id;
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<IMessage[]>([]);
  const messagesContainerRef = useRef<any | null>(null);
  const [image, setImage] = useState<string>('');

  useEffect(() => {
    scrollToBottom(messagesContainerRef);
  }, [messages]);

  useEffect(() => {
    if (!chatRoomId) return;
    const unsubscribe = getMessages(chatRoomId, setMessages);

    return () => unsubscribe();
  }, [chatRoomId]);

  const sendMessage = async () => {
    try {
      if (!chatRoomId || !me || (!messageText && !image)) return;
      await createNewMessage(chatRoomId, me, messageText, image);
      setMessageText('');
      setImage('');
      scrollToBottom(messagesContainerRef);
    } catch (error: any) {
      toast.error(ERROR_MESSAGE.message);
      throw new Error(error);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-10">
        {messages?.map((message) => (
          <MessageCardItem
            key={message.id}
            message={message}
            me={me!}
            other={other!}
          />
        ))}
      </div>

      <MessageInput
        sendMessage={sendMessage}
        message={messageText}
        setMessage={setMessageText}
        image={image}
        setImage={setImage}
      />
    </div>
  );
};

export default ChatRoom;
