import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";

const firebaseConfig = {
    apiKey: "AIzaSyBD_kqio1PlGM_8LUZpNNVIVkaiv9FYmKM",
    authDomain: "blog-website-dcd0b.firebaseapp.com",
    projectId: "blog-website-dcd0b",
    storageBucket: "blog-website-dcd0b.appspot.com",
    messagingSenderId: "982573980159",
    appId: "1:982573980159:web:437d92d86ad18418026fca",
    measurementId: "G-M5XDDQ6MPR"
};

import { getFirestore, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-storage.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

let user = localStorage.getItem("userUid");
user = JSON.parse(user);
const uid = user.uid;

const getLoginUserData = async () => {
    const name = document.getElementById("updatedName");
    const email = document.getElementById("updatedEmail");
    const about = document.getElementById("updatedAbout");
    const profileImg = document.getElementById("profile-img");

    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        name.value = docSnap.data().name;
        email.value = docSnap.data().email;
        about.value = docSnap.data().about || 'Hello There';
        if (docSnap.data().image) {
            profileImg.innerHTML = `<img src="${docSnap.data().image}" alt="" class="profile-img">`;
        }
    } else {
        console.log("No such document!");
    }
}

const image = document.getElementById("update-image-input");
const profileImg = document.getElementById("profile-img");
let imageFile;
image.addEventListener('change', () => {
    imageFile = image.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onload = () => {
        profileImg.innerHTML = `<img src="${reader.result}" alt="" class="profile-img">`
    }
})

let uploadIamge = (imageFile) => {
    const metadata = {
        contentType: imageFile.type,
    };

    const storageRef = ref(storage, `images/${uid}/${imageFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, imageFile, metadata);
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
            switch (error.code) {
                case 'storage/unauthorized':
                    break;
                case 'storage/canceled':
                    break;
                case 'storage/unknown':
                    break;
            }
        },
        () => {
            getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                profileImg.innerHTML = `<img src="${downloadURL}" alt="" class="profile-img">`

                const userRef = doc(db, "users", uid);
                await updateDoc(userRef, {
                    image: `${downloadURL}`,
                });
            });
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Your profile has been updated',
                showConfirmButton: false,
                timer: 1500
            })
        }
    );
}

const updateInfo = async () => {
    const updatedName = document.getElementById("updatedName");
    const updatedEmail = document.getElementById("updatedEmail");
    const updatedAbout = document.getElementById("updatedAbout");

    const storage = getStorage();

    if (imageFile) {
        uploadIamge(imageFile)
    }


    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
        name: updatedName.value,
        email: updatedEmail.value,
        about: updatedAbout.value,
    });
    if (imageFile) {
    } else {

        Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Your profile has been updated',
            showConfirmButton: false,
            timer: 1500
        })
    }
}


if (uid) {
    console.log('you are on profile.html')
} else {
    window.location.replace("index.html")
}

getLoginUserData()

window.updateInfo = updateInfo;