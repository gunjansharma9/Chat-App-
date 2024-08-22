import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { createContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppContextProvider = (props) => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [chatData, setChatData] = useState(null);
    const [messageId,setMessageId] = useState(null);
    const [messages,setMessages] = useState([]);
    const [chatUser,setChatUser] = useState(null);

    const loadUserData = async (uid) => {
        try {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();
            setUserData(userData);

            if (userData.avatar && userData.name) {
                navigate('/chat');
            } else {
                navigate('/profile');
            }

            await updateDoc(userRef, {
                lastSeen: Date.now(),
            });

            // Update lastSeen every 60 seconds
            const intervalId = setInterval(async () => {
                if (auth.currentUser) {
                    await updateDoc(userRef, {
                        lastSeen: Date.now(),
                    });
                }
            }, 60000);

            // Clear the interval when the component unmounts
            return () => clearInterval(intervalId);
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        if (userData) {
            const chatRef = doc(db, 'chats', userData.id);
            const unSub = onSnapshot(chatRef, async (res) => {
                const chatsItems = res.data().chatsData;
                const tempData = [];
                for (const item of chatsItems) {
                    const userRef = doc(db, 'users', item.rId);
                    const userSnap = await getDoc(userRef);
                    const userData = userSnap.data();
                    tempData.push({ ...item, userData });
                }
                setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt));
            });

            return () => {
                unSub();
            };
        }
    }, [userData]);

    const value = {
        userData, setUserData,
        chatData, setChatData,
        loadUserData,
        messages,setMessages,
        messageId,setMessageId,
        chatUser,setChatUser
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;
