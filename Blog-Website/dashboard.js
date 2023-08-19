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

import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { getFirestore, doc, setDoc, collection, addDoc, query, where, onSnapshot, getDoc, serverTimestamp, orderBy, deleteDoc } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
auth.languageCode = 'it';

const loader = document.getElementById('loader');
const div = document.getElementById('div');
let user = localStorage.getItem("userUid");
user = JSON.parse(user);
const userUid = user.uid;
console.log(userUid);

const logoutBtn = document.getElementById("logout-btn");
logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        localStorage.clear()
        window.location.replace("index.html")

    }).catch((error) => {
        console.log("error", error)
    });
})

const getName = (userName) => {
    loader.style.display = 'none';
    div.style.display = 'block';
    const name = document.getElementById(userName);
    const q = query(collection(db, "users"), where("uid", "==", userUid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
            name.innerHTML = doc.data().name;
        });
    });
}

let name;
const publishBlog = async () => {
    let blogTitle = document.getElementById('blog-title');
    let blogBody = document.getElementById('blog-body');
    if (blogTitle.value.length >= '5') {
        if (blogBody.value.length >= '100') {
            try {

                const docRef = await addDoc(collection(db, "blogs"), {
                    blogTitle: blogTitle.value,
                    blogBody: blogBody.value,
                    userUid: userUid,
                    time: serverTimestamp(),
                });
                blogTitle.value = "";
                blogBody.value = "";
                console.log("Document written with ID: ", docRef.id);
                getblogs(docRef.id)
            } catch (e) {
                console.log('error', e)
            }
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Body should be at least hundread charectors long',
            })
        }
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Title should be at least five charectors long',
        })
    }
}

const getblogs = (docID) => {
    const getName = () => {
        let name;
        const q = query(collection(db, "users"), where("uid", "==", userUid));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const userName = document.getElementById('blog-name');
            querySnapshot.forEach((doc) => {
                userName.innerHTML = doc.data().name;
            });
        });
    }
    const myBlogsDiv = document.getElementById('my-blogs-div')
    const q = query(collection(db, "blogs"), orderBy('time', "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const blogs = [];
        myBlogsDiv.innerHTML = "";
        querySnapshot.forEach((doc) => {
            blogs.push(doc.data());
        });
        blogs.forEach(async (v, i) => {
            const time = v.time ? v.time.toDate() : new Date().toDateString()
            const docRef = doc(db, "users", v.userUid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                myBlogsDiv.innerHTML += `
                    <div class="blog-div mt-3">
                        <div class="blog-account-details">
                            <div class="blog-account-pic">
                            ${docSnap.data().image ? `<img src="${docSnap.data().image}" class="user-profile-image">` : `<i class="fa-solid fa-user profile-icon" style="color: #7749f8;"></i>`}
                            <!-- <i class="fa-solid fa-user profile-icon" style="color: #7749f8;"></i> -->
                            </div>
                            <div class="blog-account-name">
                                <div class="blog-title">${v.blogTitle}</div>
                                <div> <span class="name" id="blog-name">${getName()}</span> - <span class="name">${moment(`${time}`).format('LT')}</span>
                                </div>
                            </div>
                        </div>
                        <div class="blog-body">${v.blogBody}</div>
                        <div class="blog-footer">
                            <button type="button" class="button" onclick='editPost(this, "${docID}")'>
                                Edit
                            </button>
                            <button class="button delete" onclick='deletePost("${docID}")'>
                                Delete
                            </button>
                        </div>
                    </div>
            `;
            } else {
                console.log("No such document!");
            }


        })
        console.log(blogs)


    });
}


let edit = true;
const editPost = async (e, docId) => {
    if (edit) {
        e.parentNode.parentNode.childNodes[3].setAttribute("contenteditable", true);
        e.parentNode.parentNode.childNodes[3].focus()
        e.innerHTML = 'Update';
        edit = false;
    } else {
        e.parentNode.parentNode.childNodes[3].setAttribute("contenteditable", false);
        e.innerHTML = 'Edit';
        edit = true;
        console.log(e.parentNode.parentNode.childNodes[3].innerText)
        await setDoc(doc(db, "blogs", docId), {
            blogBody: e.parentNode.parentNode.childNodes[3].innerText,
            time: serverTimestamp(),
            blogTitle: e.parentNode.parentNode.childNodes[1].innerText,
            userUid: userUid,
        });
    }


}

const deletePost = (docId) => {
    console.log(docId)
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            await deleteDoc(doc(db, "blogs", `${docId}`));
            console.log(docId)
            Swal.fire(
                'Deleted!',
                'Your file has been deleted.',
                'success'
            )
        }
    })
}

if (userUid) {
    console.log('you are on profile.html')
} else {
    window.location.replace("index.html")
}

getblogs();
getName('name-hdr')
window.editPost = editPost;
window.deletePost = deletePost;
window.publishBlog = publishBlog;
