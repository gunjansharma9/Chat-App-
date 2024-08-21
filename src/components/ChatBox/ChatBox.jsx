import React, { useContext, useEffect, useState } from 'react'
import "./ChatBox.css"
import assets from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { doc, onSnapshot } from 'firebase/firestore'
import { toast } from 'react-toastify'
import { db } from '../../config/firebase'
import { updateDoc, arrayUnion, getDoc } from 'firebase/firestore';


const ChatBox = () => {
  const {userData,messagesId,chatUser,messages,setMessages} = useContext(AppContext)

  console.log('messagesId:', messagesId);
  console.log('chatUser:', chatUser);
  console.log('userData:', userData);

  const [input,setInput] = useState("");

  const sendMessage = async () => {
    try {
      if (input && messagesId) {
        // Update the messages collection in Firestore
        await updateDoc(doc(db, 'messages', messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            text: input,
            createdAt: new Date()
          })
        });
  
        const userIDs = [chatUser.rId, userData.id];
        const updatePromises = userIDs.map(async (id) => {
          const userChatsRef = doc(db, 'chats', id);
          const userChatsSnapshot = await getDoc(userChatsRef);
  
          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();
            if (userChatData && Array.isArray(userChatData.chatsData)) {
              // Find the chat by its messagesId
              const chatIndex = userChatData.chatsData.findIndex((c) => c.messagesId === messagesId);
  
              // Ensure chatIndex is valid before attempting to access the array
              if (chatIndex !== -1) {
                userChatData.chatsData[chatIndex].lastMessage = input.slice(0, 30);
                userChatData.chatsData[chatIndex].updatedAt = Date.now();
                // If the receiver is the user, set messageSeen to false
                if (userChatData.chatsData[chatIndex].rId === userData.id) {
                  userChatData.chatsData[chatIndex].messageSeen = false;
                }
                // Update the Firestore document with the modified chat data
                await updateDoc(userChatsRef, {
                  chatsData: userChatData.chatsData
                });
              } else {
                console.warn(`Chat with messagesId ${messagesId} not found.`);
              }
            }
          }
        });
  
        await Promise.all(updatePromises); // Ensure all updates are done
        setInput(""); // Clear the input field after sending the message
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  

  <div className="chat-input">
    <input onChange={(e) => setInput(e.target.value)} value={input} type="text" placeholder='Send a message' />
    <input type="file" id='image' accept='image/png,image/jpeg' hidden />
    <label htmlFor='image'>
      <img src={assets.gallery_icon} alt="" />
    </label>
    <img src={assets.send_button} alt="" onClick={sendMessage} /> {/* Move onClick here */}
  </div>


  return chatUser ? (
    <div className='chat-box'>
        <div className='chat-user'>
            <img src={chatUser.userData.avatar} alt="" />
            <p>{chatUser.userData.name}<img className='dot' src={assets.green_dot} alt="" /></p>
            <img src={assets.help_icon} className='help' alt="" />
        </div>

        <div className="chat-msg">
          <div className="s-msg">
            <p className="msg">Lorem, ipsum dolor sit amet consectetur....</p>
            <div>
              <img src={assets.profile_img} alt="" />
              <p>2:30 PM</p>
            </div>
          </div>

          <div className="s-msg">
            <img className='msg-img' src={assets.pic1} alt="" />
            <div>
              <img src={assets.profile_img} alt="" />
              <p>2:30 PM</p>
            </div>
          </div>

          <div className="r-msg">
            <p className="msg">receiver ipsum dolor sit amet consectetur....</p>
            <div>
              <img src={assets.profile_img} alt="" />
              <p>2:30 PM</p>
            </div>
          </div>
        </div>

      <div className="chat-input">
        <input onChange={(e) => setInput(e.target.value)} value={input} type="text" placeholder='Send a message' />
        <input type="file" id='image' accept='image/png,image/jpeg' hidden />
        <label htmlFor='image'>
          <img src={assets.gallery_icon} alt="" />
        </label>
        <img src={assets.send_button} alt="" onClick={sendMessage} /> {/* Move onClick here */}
      </div>

    </div>
  )
  : <div className='chat-welcome'>
      <img src={assets.logo_icon} alt="" />
      <p>Chat anytime,anywhere</p>
  </div>
}

export default ChatBox
