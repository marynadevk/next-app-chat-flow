'use client';

import ChatRoom from '@/components/ChatRoom';
import Users from '@/components/Users';
import { IChatRoom } from '@/interfaces/IChatRoom';
import { IUser } from '@/interfaces/IUser';
import { app, dbFirestore } from '@/lib/firebase';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const Home = () => {
  const auth = getAuth(app);
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const router = useRouter();
  const [selectedChatRoom, setSelectedChatRoom] = useState<null | IChatRoom>(
    null
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        const docRef = doc(dbFirestore, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as IUser;
          setCurrentUser({ id: docSnap.id, ...data });
        } else {
          console.log('No such document!');
        }
      } else {
        setCurrentUser(null);
        router.push('/login');
      }
    });
  
    return () => unsubscribe();
  }, [auth, router]);

  return (
    <div className="flex h-screen">
      <div className="flex-shrink-0 w-3/12">
        <Users userData={currentUser!} setSelectedChatRoom={setSelectedChatRoom} />
      </div>

      <div className="flex-grow w-9/12">
        {selectedChatRoom ? (
          <>
            <ChatRoom selectedChatRoom={selectedChatRoom} />
          </>
        ) : (
          <>
            <div className="flex items-center justify-center h-full">
              <div className="text-2xl text-gray-400">Select a chatroom</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
