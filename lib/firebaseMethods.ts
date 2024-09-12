import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { dbFirestore } from '@/lib/firebase';
import { IUser, IMessage } from '@/interfaces/index';

export const createNewMessage = async (
  chatRoomId: string,
  me: IUser,
  messageText: string,
  image: string
) => {
  const messagesCollection = collection(dbFirestore, 'messages');
  try {
    const newMessage = {
      chatRoomId: chatRoomId,
      sender: me?.id,
      content: messageText,
      time: serverTimestamp(),
      image,
    };

    await addDoc(messagesCollection, newMessage);

    const chatroomRef = doc(dbFirestore, 'chatrooms', chatRoomId!);
    await updateDoc(chatroomRef, {
      lastMessage: messageText ? messageText : 'Image',
    });
  } catch (error: any) {
    throw new Error('Error sending message:', error.message);
  }
};

export const getMessages = (
  chatRoomId: string,
  setMessages: React.Dispatch<React.SetStateAction<IMessage[]>>
) => {
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
};
