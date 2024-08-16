import React, { useState, useEffect, useRef, FC, ReactNode } from 'react';
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { dbFirestore } from '@/lib/firebase';
import { IChatRoom } from '@/interfaces/IChatRoom';
import { IMessage } from '@/interfaces/IMessage';
import { createNewMessage } from '@/lib/create-message';
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
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!chatRoomId) return;
    const unsubscribe = onSnapshot(
      query(
        collection(dbFirestore, 'messages'),
        where('chatRoomId', '==', chatRoomId),
        orderBy('time', 'asc')
      ),
      (snapshot) => {
        const messages = snapshot.docs.map((doc) => {
          const data = doc.data() as IMessage;
          return { id: doc.id, ...data };
        });
        setMessages(messages);
      }
    );

    return unsubscribe;
  }, [chatRoomId]);

  const sendMessage = async () => {
    if (messageText == '' && image == '') {
      return;
    }
    await createNewMessage(chatRoomId!, me!, messageText, image!);
    setMessageText('');
    setImage('');

    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };
  console.log('messages', messages);

  return (
    <div className='flex flex-col h-screen'>
      <div ref={messagesContainerRef} className='flex-1 overflow-y-auto p-10'>
        {messages?.map((message) => (
          <MessageCardItem key={message.id} message={message} me={me!} other={other!}/>
        ))}
      </div>

      <MessageInput sendMessage={sendMessage} message={messageText} setMessage={setMessageText} image={image} setImage={setImage}/>
    </div>
  );
};

export default ChatRoom;
