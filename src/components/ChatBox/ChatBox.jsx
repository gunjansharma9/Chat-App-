import React, { useContext, useEffect, useState } from 'react'
import "./ChatBox.css"
import assets from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { toast } from 'react-toastify'
import { db } from '../../config/firebase'

const ChatBox = () => {
  const {userData,messageId,chatUser,messages,setMessages} = useContext(AppContext)

  const [input,setInput] = useState("");

  const sendMessage = async() => {
    try{
      if(input && messageId){
        await updateDoc(doc(db,'messages',messageId),{
          messages:arrayUnion({
            sId:userData.id,
            text:input,
            createdAt:new Date()
          })
        })

        const userIDs = [chatUser.rId,userData.id];

        userIDs.forEach(async(id) => {
          const userChatsRef = doc(db,'chats',id);
          const userChatsSnapshot = await getDoc(userChatsRef);

          if(userChatsSnapshot.exists()){
            const userChatData = userChatsSnapshot.data();
            const  chatIndex = userChatData.chatsData.findIndex((c) => c.messageId === messageId);
            userChatData.chatsData[chatIndex].lastMessage = input.slice(0,30);
            userChatData.chatsData[chatIndex].updatedAt = Date.now();
            if(userChatData.chatsData[chatIndex].rId === userData.id){
              userChatData.chatsData[chatIndex].messageSeen = false;
            }
            await updateDoc(userChatsRef,{
              chatsData:userChatData.chatsData
            })
          }
        })
      }
    }catch(error){
      toast.error(error.message)
    }
    setInput("")
  }

  

  useEffect(() => {
      if (messageId) {
          const unSub = onSnapshot(doc(db, 'messages', messageId), (res) => {
              const data = res.data();
              if (data && Array.isArray(data.messages)) {
                  setMessages(data.messages.reverse());
                  console.log(data.messages.reverse());
              } else {
                  console.log("No messages found or messages is not an array.");
                  setMessages([]); // Set an empty array if there are no messages
              }
          });
          return () => {
              unSub();
          };
      }
  }, [messageId]);


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
          <img onClick={sendMessage} src={assets.send_button} alt="" />
        </div>
    </div>
  )
  : <div className='chat-welcome'>
      <img src={assets.logo_icon} alt="" />
      <p>Chat anytime,anywhere</p>
  </div>
}

export default ChatBox