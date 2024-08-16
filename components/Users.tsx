'use client';
import { FC, useEffect, useState } from 'react';
import { dbFirestore, app } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  query,
  addDoc,
  serverTimestamp,
  where,
  getDocs,
} from 'firebase/firestore';
import { getAuth, signOut, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import ChatListItem from './ChatListItem';
import { IUser } from '@/interfaces/IUser';
import { IChatRoom } from '@/interfaces/IChatRoom';

type Props = {
  userData: IUser;
  setSelectedChatRoom: (data: any) => void;
};

const Users: FC<Props> = ({ userData, setSelectedChatRoom }) => {
  const [activeTab, setActiveTab] = useState('chatrooms');
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [users, setUsers] = useState<IUser[]>([]);
  const [userChatRooms, setUserChatRooms] = useState<IChatRoom[]>([]);
  const router = useRouter();
  const auth = getAuth(app);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    setLoading2(true);
    const tasksQuery = query(collection(dbFirestore, 'users'));

    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const users = snapshot.docs.map((doc) => {
        const data = doc.data() as IUser;
        return { id: doc.id, ...data };
      });
      setUsers(users);
      setLoading2(false);
    });
    console.log('users', users);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setLoading(true);
    if (!userData?.id) return;
    const chatRoomsQuery = query(
      collection(dbFirestore, 'chatrooms'),
      where('users', 'array-contains', userData.id)
    );
    const unsubscribeChatRooms = onSnapshot(chatRoomsQuery, (snapshot) => {
      const chatRooms = snapshot.docs.map((doc) => {
        const data = doc.data() as IChatRoom;
        return { id: doc.id, ...data };
      });
      setLoading(false);
      setUserChatRooms(chatRooms);
    });
    return () => unsubscribeChatRooms();
  }, [userData]);

  const createChat = async (user: IUser) => {
    // Check if a chatroom already exists for these users
    const existingChatRoomsQuery = query(collection(dbFirestore, 'chatrooms'), where('users', '==', [userData?.id, user.id]));
  
    try {
      const existingChatRoomsSnapshot = await getDocs(existingChatRoomsQuery);
  
      if (existingChatRoomsSnapshot.docs.length > 0) {
        // Chatroom already exists, handle it accordingly (e.g., show a message)
        console.log('Chatroom already exists for these users.');
        toast.error('Chatroom already exists for these users.');
        return;
      }
  
      // Chatroom doesn't exist, proceed to create a new one
      const usersData = {
        [userData.id!]: userData,
        [user.id!]: user,
      };
  
      const chatroomData = {
        users: [userData.id, user.id],
        usersData,
        timestamp: serverTimestamp(),
        lastMessage: null,
      };
  
      const chatroomRef = await addDoc(collection(dbFirestore, 'chatrooms'), chatroomData);
      console.log('Chatroom created with ID:', chatroomRef.id);
      setActiveTab("chatrooms");
    } catch (error) {
      console.error('Error creating or checking chatroom:', error);
    }};


  const openChat = async (chatroom: IChatRoom) => {
    const data = {
      id: chatroom.id,
      myData: userData,
      otherData:
        chatroom.usersData[
          chatroom.users.filter((id: string) => id !== userData?.id)[0]
        ],
    };
    console.log('data', data);
    setSelectedChatRoom(data);
  };

  const logoutClick = () => {
    signOut(auth)
      .then(() => {
        router.push('/login');
      })
      .catch((error) => {
        console.error('Error logging out:', error);
      });
  };

  return (
    <>
      <div className="shadow-lg h-screen overflow-auto mt-4 mb-20">
        <div className="flex flex-col lg:flex-row justify-between p-4 space-y-4 lg:space-y-0">
          <button
            className={`btn btn-outline ${
              activeTab === 'users' ? 'btn-primary' : ''
            }`}
            onClick={() => handleTabClick('users')}
          >
            Users
          </button>
          <button
            className={`btn btn-outline ${
              activeTab === 'chatrooms' ? 'btn-primary' : ''
            }`}
            onClick={() => handleTabClick('chatrooms')}
          >
            Chatrooms
          </button>
          <button className={`btn btn-outline`} onClick={logoutClick}>
            Logout
          </button>
        </div>

        <div>
          {activeTab === 'chatrooms' && (
            <>
              <h1 className="px-4 text-base font-semibold">Chatrooms</h1>
              {loading && (
                <div className="flex justify-center items-center h-full">
                  <span className="loading loading-spinner text-primary"></span>
                </div>
              )}
              {userChatRooms.map((chatroom: IChatRoom) => (
                <div
                  key={chatroom.id}
                  onClick={() => {
                    openChat(chatroom);
                  }}
                >
                  <ChatListItem
                    name={
                      chatroom.usersData[
                        chatroom.users.filter((id) => id !== userData?.id)[0]
                      ].name
                    }
                    avatarUrl={
                      chatroom.usersData[
                        chatroom.users.filter((id) => id !== userData?.id)[0]
                      ].avatarUrl
                    }
                    latestMessage={chatroom.lastMessage}
                    type={'chat'}
                  />
                </div>
              ))}
            </>
          )}

          {activeTab === 'users' && (
            <>
              <h1 className="mt-4 px-4 text-base font-semibold">Users</h1>
              {loading2 && (
                <div className="flex justify-center items-center h-full">
                  <span className="loading loading-spinner text-primary"></span>
                </div>
              )}
              {users.map((user: IUser) => (
                <div
                  key={user.id}
                  onClick={() => {
                    createChat(user);
                  }}
                >
                  {user.id !== userData?.id && (
                    <ChatListItem
                      name={user.name}
                      avatarUrl={user.avatarUrl}
                      latestMessage={''}
                      type={'user'}
                    />
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Users;
