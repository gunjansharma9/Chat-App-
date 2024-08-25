
import { initializeApp} from "firebase/app";
import { getFirestore, setDoc, doc, collection, where, query, getDocs } from "firebase/firestore";
import { getAuth,createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { toast } from 'react-toastify';

const firebaseConfig = {
  apiKey: "AIzaSyCThrP5KAFCDa-tWvRQ6LaqjadCPZC8aPY",
  authDomain: "chat-app-66b3b.firebaseapp.com",
  projectId: "chat-app-66b3b",
  storageBucket: "chat-app-66b3b.appspot.com",
  messagingSenderId: "148974823512",
  appId: "1:148974823512:web:7b798e5f41417246ccc22d"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signup = async(username,email,password) => {
    try{
        const res = await createUserWithEmailAndPassword(auth,email,password);
        const user = res.user;
        await setDoc(doc(db,"users",user.uid),{
            id:user.uid,
            username:username.toLowerCase(),
            email,
            name:"",
            avatar:"",
            bio:"Hey,There i am using chat app",
            lastSeen:Date.now()
        })
        await setDoc(doc(db,"chats",user.uid),{
            chatsData:[]
        })
    }catch(error){
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
}

const login = async(email,password) => {
    try{
        await signInWithEmailAndPassword(auth,email,password)
    }catch(e){
        console.error(e);
        toast.error(e.code.split('/')[1].split('-').join(" "));
    }
}

const logout = async() => {
    try{
        await signOut(auth);
    }catch(e){
        console.error(e);
        toast.error(e.code.split('/')[1].split('-').join(" "));
    }
}

const resetPass = async(email) => {
    if(!email){
        toast.error("Enter your email");
        return null;
    }
    try{
        const userRef = collection(db,'users');
        const q = query(userRef,where("email","==",email));
        const querySnap = await getDocs(q);
        if(!querySnap.empty){
            await sendPasswordResetEmail(auth,email);
            toast.success("Reset Email Sent")
        }else{
            toast.error("Email doesn't exists")
        }
    }catch(error){
        console.error(error);
        toast.error(error.message)
    }
}

export {signup,login,logout,auth,db,resetPass}