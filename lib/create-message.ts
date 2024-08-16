import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { dbFirestore } from '@/lib/firebase';
import { IUser } from '@/interfaces/IUser';

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
