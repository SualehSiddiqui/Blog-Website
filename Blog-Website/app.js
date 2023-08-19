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

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
auth.languageCode = 'it';



const addUserData = () => {
    let email = document.getElementById("email");
    let password = document.getElementById("password");
    let repeatPassword = document.getElementById("repeat-password");
    let firstName = document.getElementById("first-name");
    let lastName = document.getElementById("last-name");
    let name = firstName.value + " " + lastName.value;
    console.log(firstName.value.trim().length)
    if (firstName.value.trim().length > "3") {
        if (lastName.value.trim().length > "1") {
            if (lastName.value.trim().length <= "20") {
                if (email.value.trim().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
                    console.log(password.value.trim())
                    if (password.value.trim().match(/^(?=.*[a-z])(?=.*[A-Z]).{8,15}$/)) {
                        if (password.value.trim() == repeatPassword.value.trim()) {
                            createUserWithEmailAndPassword(auth, email.value, password.value)
                                .then(async (userCredential) => {
                                    const user = userCredential.user;
                                    try {
                                        console.log(user.uid)
                                        await setDoc(doc(db, "users", user.uid), {
                                            firstName: firstName.value,
                                            lastName: lastName.value,
                                            name: name,
                                            email: email.value,
                                            password: password.value,
                                            uid: user.uid,
                                            image: false,
                                        });
                                        localStorage.setItem("userUid", JSON.stringify(user));
                                        window.location.replace("dashboard.html")
                                    }
                                    catch (e) {
                                        console.log("Error", e)
                                    }
                                })
                                .catch((error) => {
                                    const errorCode = error.code;
                                    const errorMessage = error.message;
                                    console.log("errorMessage", errorMessage);
                                    for (var i = 0; i < errorMessage.length; i++) {
                                        if (errorMessage.slice(i, i + 1) == "/") {
                                            Swal.fire({
                                                icon: 'error',
                                                title: 'Oops...',
                                                text: `${errorMessage.slice(i + 1, errorMessage.length - 2)}`,
                                            })
                                            break

                                        }
                                    }
                                    email.value = "";
                                    password.value = "";
                                    repeatPassword.value = "";
                                    firstName.value = "";
                                    lastName.value = "";
                                });

                        } else {
                            password.style.borderColor = 'red';
                            repeatPassword.style.borderColor = 'red';
                            Swal.fire({
                                icon: 'error',
                                title: 'Oops...',
                                text: 'Password is not equal to confirm password',
                            })
                        }
                    } else {
                        password.style.borderColor = 'red';
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: 'Password should be atleast 8 charectors long or must contain one capital and one lower case letter',
                        })
                    }
                } else {
                    email.style.borderColor = 'red';
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Email should be like abc@gmail.com',
                    })
                }
            } else {
                lastName.style.borderColor = 'red';
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Last name can only contain 20 charectors',
                })
            }
        } else {
            lastName.style.borderColor = 'red';
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Last name should be atleast 1 charectors',
            })
        }

    } else {
        firstName.style.borderColor = 'red';
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'First name should be atleast 5 charectors',
        })
    }
}

const login = () => {
    let email = document.getElementById("email");
    let password = document.getElementById("password");

    signInWithEmailAndPassword(auth, email.value, password.value)
        .then((userCredential) => {
            const user = userCredential.user;
            localStorage.setItem("userUid", JSON.stringify(user));
            window.location.replace("dashboard.html");
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log('errorMessage', errorMessage);
            for (var i = 0; i < errorMessage.length; i++) {
                if (errorMessage.slice(i, i + 1) == "/") {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: `${errorMessage.slice(i + 1, errorMessage.length - 2)}`,
                    })
                    break

                }
            }

            email.value = "";
            password.value = "";
        });
}

// const signInWithGoogle = () => {
//     signInWithPopup(auth, provider)
//         .then(async (result) => {
//             const credential = GoogleAuthProvider.credentialFromResult(result);
//             const token = credential.accessToken;
//             const user = result.user;
//             try {
//                 await setDoc(doc(db, "users", user.uid), {
//                     name: user.displayName,
//                     email: user.email,
//                     uid: user.uid,
//                     image: user.photoURL,
//                 });
//                 localStorage.setItem("userUid", `${user}`)
//                 window.location.replace("dashboard.html")
//             }
//             catch (e) {
//                 console.log("Error", e)
//             }
//         }).catch((error) => {
//             const errorCode = error.code;
//             const errorMessage = error.message;
//             console.log('errorCode', errorCode)
//             const email = error.customData.email;
//             const credential = GoogleAuthProvider.credentialFromError(error);
//             for (var i = 0; i < errorMessage.length; i++) {
//                 if (errorMessage.slice(i, i + 1) == "/") {
//                     Swal.fire({
//                         icon: 'error',
//                         title: 'Oops...',
//                         text: `${errorMessage.slice(i + 1, errorMessage.length - 2)}`,
//                     })
//                     break
//                 }
//             }
//         });
// }


// window.signInWithGoogle = signInWithGoogle;
window.addUserData = addUserData;
window.login = login;

if (localStorage.getItem("userUid")) {
    let user = localStorage.getItem("userUid");
    user = JSON.parse(user);
    const userUid = user.uid;
    console.log(userUid)
    
    if (userUid && window.location.pathname != "/index.html" && window.location.pathname != "/login.html") {
        window.location.replace("index.html")
    } else {
        console.log("User is signed out")
    }
}