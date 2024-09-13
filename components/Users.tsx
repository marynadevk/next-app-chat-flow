'use client';
import { FC, useEffect, useState } from 'react';

import { dbFirestore, app } from '@/lib/firebase';
import { query, addDoc, serverTimestamp, where, getDocs, collection } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import ChatListItem from './ChatListItem';
import { IUser, IChatRoom } from '@/interfaces/index';
import { ERROR_MESSAGE } from '@/constants/constants';
import { fetchSnapshot } from '@/lib/firebaseMethods';

type Props = {
  userData: IUser;
  setSelectedChatRoom: (data: any) => void;
};

const Users: FC<Props> = ({ userData, setSelectedChatRoom }) => {
  const [activeTab, setActiveTab] = useState('chatrooms');
  const [loading, setLoading] = useState({
    users: false,
    chatrooms: false,
  });
  const [users, setUsers] = useState<IUser[]>([]);
  const [userChatRooms, setUserChatRooms] = useState<IChatRoom[]>([]);
  const router = useRouter();
  const auth = getAuth(app);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    const unsubscribe = fetchSnapshot('users', setLoading, setUsers);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userData?.id) return;
    const condition = where('users', 'array-contains', userData.id);
    const unsubscribeChatRooms = fetchSnapshot('chatrooms', setLoading, setUserChatRooms, condition);
    return () => unsubscribeChatRooms();
  }, [userData]);

  const createChat = async (user: IUser) => {
    const existingChatRoomsQuery = query(
      collection(dbFirestore, 'chatrooms'),
      where('users', '==', [userData?.id, user.id])
    );

    try {
      const existingChatRoomsSnapshot = await getDocs(existingChatRoomsQuery);

      if (existingChatRoomsSnapshot.docs.length > 0) {
        toast.error(ERROR_MESSAGE.chatroomExist);
        return;
      }

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

      await addDoc(collection(dbFirestore, 'chatrooms'), chatroomData);
      toast.success('Chatroom created');
      setActiveTab('chatrooms');
    } catch (error: any) {
      toast.error(ERROR_MESSAGE.chatroom);
      throw new Error(error);
    }
  };

  const openChat = async (chatroom: IChatRoom) => {
    const data = {
      id: chatroom.id,
      myData: userData,
      otherData:
        chatroom.usersData[
          chatroom.users.filter((id: string) => id !== userData?.id)[0]
        ],
    };
    setSelectedChatRoom(data);
  };

  const logoutClick = () => {
    signOut(auth)
      .then(() => {
        router.push('/login');
      })
      .catch((error) => {
        toast.error(ERROR_MESSAGE.logout);
        throw new Error(ERROR_MESSAGE.logout, error);
      });
  };

  const tabs = [
    { label: 'Users', value: 'users' },
    { label: 'Chatrooms', value: 'chatrooms' },
  ];

  console.log(loading)
  return (
    <>
      <div className="shadow-lg h-screen overflow-auto mt-4 mb-20">
        <div className="flex flex-col lg:flex-row justify-between p-4 space-y-4 lg:space-y-0">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              className={`btn btn-outline hover:bg-custom-hover ${
                activeTab === tab.value
                  ? 'text-white border-custom-primary bg-custom-primary'
                  : 'text-custom-primary'
              }`}
              onClick={() => handleTabClick(tab.value)}
            >
              {tab.label}
            </button>
          ))}
          <button
            className={`btn btn-outline text-custom-primary hover:bg-custom-hover`}
            onClick={logoutClick}
          >
            Logout
          </button>
        </div>

        <div>
          {activeTab === 'chatrooms' && (
            <>
              <h1 className="px-4 text-base font-semibold">Chatrooms</h1>
              {loading.chatrooms && (
                <div className="flex justify-center items-center h-full">
                  <span className="loading loading-spinner text-custom-primary"></span>
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
                        chatroom.users.find((id) => id !== userData?.id)!
                      ].name
                    }
                    avatarUrl={
                      chatroom.usersData[
                        chatroom.users.find((id) => id !== userData?.id)!
                      ].avatarUrl
                    }
                    latestMessage={chatroom.lastMessage}
                    isUsers={false}
                  />
                </div>
              ))}
            </>
          )}

          {activeTab === 'users' && (
            <>
              <h1 className="mt-4 px-4 text-base font-semibold">Users</h1>
              {loading.users && (
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
                      isUsers
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
