import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const upload = async(file) => {
  return new Promise((resolve, reject) => {
    const storage = getStorage();
    const storageRef = ref(storage, `images/${Date.now()}_${file.name}`);
    
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case 'paused':
            console.log('Upload is paused');
            break;
          case 'running':
            console.log('Upload is running');
            break;
        }
      }, 
      (error) => {
        console.error('Upload failed:', error);
        reject(error); // Reject the promise on error
      }, 
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          resolve(downloadURL); // Resolve the promise with the downloadURL
        }).catch((error) => {
          reject(error); 
        });
      }
    );
  });
}

export default upload;
