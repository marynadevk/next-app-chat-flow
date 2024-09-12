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
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import ChatListItem from './ChatListItem';
import { IUser, IChatRoom } from '@/interfaces/index';

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
  // const [loadingUsers, setLoadingUsers] = useState(false);
  const [users, setUsers] = useState<IUser[]>([]);
  const [userChatRooms, setUserChatRooms] = useState<IChatRoom[]>([]);
  const router = useRouter();
  const auth = getAuth(app);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    setLoading({...loading, users: true});
    const tasksQuery = query(collection(dbFirestore, 'users'));

    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const users = snapshot.docs.map((doc) => {
        const data = doc.data() as IUser;
        return { id: doc.id, ...data };
      });
      setUsers(users);
      setLoading({...loading, users: false});
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setLoading({...loading, chatrooms: true});
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
      setLoading({...loading, chatrooms: false});
      setUserChatRooms(chatRooms);
    });
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
        toast.error('Chatroom already exists for these users.');
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
      toast.error('Error creating or checking chatroom');
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
        console.error('Error logging out:', error);
      });
  };

  const tabs = [
    { label: 'Users', value: 'users' },
    { label: 'Chatrooms', value: 'chatrooms' },
  ];

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
              {loading && (
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
