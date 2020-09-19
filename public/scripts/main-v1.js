const whitelist = ["dantevbarbieri@gmail.com", "rebecca.mcfadden16@gmail.com", "biblioquery@gmail.com"];
const use_tamu_login = true;

// Main function - called on page load
// firebase.performance();
window.onload = function () {
    // this. //console.log(window.location.pathname);
    const urlString = window.location.search;
    const urlParams = new URLSearchParams(urlString);

    initFirebaseAuth(function () {

        if (window.location.pathname == "/results.html") {
            var searchType = urlParams.get("search_type");
            var querystring = urlParams.get("query_string");
            $(`#searchtypes option[value=${searchType}]`).prop('selected', true);
            if (searchType == "seller") {
                document.getElementById("searchtypes").hidden = true;
                document.getElementById("searchFrom").value = "Users";
                if (!isUserSignedIn())
                    window.location.replace("403.html");
            }
            if (searchType == "isbn" && querystring != "") {
                window.location.replace("book.html?isbn=" + querystring);
                //use window location replace to fix back button errors
            } else {
                initSearch();
            }
        } else if (window.location.pathname == "/book.html") {
            google.books.load();
            getBook();
        } else if (window.location.pathname == "/profile.html") {
            const urlString = window.location.search;
            const urlParams = new URLSearchParams(urlString);
            var user_id = urlParams.get('user');
            if (isUserSignedIn() && firebase.auth().currentUser.uid == user_id) {
                window.location.replace("profile.html?user=me");
                //use window location replace to fix back button errors
            } else if (user_id == "me") {
                setupDragAndDrop();
                getUser();
            } else {
                getUser();
            }
        } else if (window.location.pathname == "/posting.html") {
            if (!isUserSignedIn()) {
                window.location.replace("403.html");
            } else {
                setupDragAndDrop();
            }
        } else if (window.location.pathname == "/chat.html") {
            sessionStorage.setItem('notifications', "0");
            var recipientID = urlParams.get('openchat');
            if (recipientID == "" || chatID == undefined || !chatID) {
                getChats();
                displayBlankMessages();
            } else {
                firebase.firestore().collection('user-info').doc(firebase.auth().currentUser.uid)
                    .update({ 'notifications': { count: 0 } });
                var recipientID = urlParams.get('openchat');
                if (recipientID == "" || chatID == undefined || !chatID) {
                    getChats();
                    displayBlankMessages();
                } else {
                    newChat(recipientID);
                }
            }
        }
        let signInButton = document.getElementById("signInButton");
        if (isUserSignedIn()) signInButton.addEventListener("click", viewCurrentUserProfile);
        else signInButton.addEventListener("click", firebaseGoogleSignin);
        //  //console.log(signInButton);
    });
}

function viewCurrentUserProfile() {
    window.location.href = "profile.html?user=me";
}

//posting.html
function initPost() {
    if (firebase.auth().currentUser) {
        window.location.href = "posting.html";
    } else {
        alert("You must login to post a book.");
    }
}

$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})
// Auth functions
function isUserSignedIn() {
    return !!firebase.auth().currentUser;
}

function loadBook(isbn) {
    window.location.href = "book.html?isbn=" + isbn;
}

function firebaseGoogleSignin() {
    let db = firebase.firestore();
     //console.log("hello!");
    if (!isUserSignedIn()) {
        sessionStorage.clear();
        var provider = new firebase.auth.GoogleAuthProvider();
        if (use_tamu_login)
            provider.setCustomParameters({
                hd: "tamu.edu"
            });
        firebase.auth().useDeviceLanguage();
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
        // firebase.auth().signInWithPopup(provider);	
        firebase.auth().signInWithPopup(provider).then(function (result) {
            // This gives you a Google Access Token. You can use it to access the Google API.	
            var token = result.credential.accessToken;
            // The signed-in user info.	
            var user = result.user;
            var docRef = db.collection('user-info').doc(user.uid);
            docRef.get().then(function (doc) {
                if (!doc.exists) {
                    // doc.data() will be undefined in this case
                    docRef.set({
                        display_name: user.displayName,
                        name: user.displayName,
                        email: user.email,
                        photoURL: user.photoURL,
                        uid: user.uid
                    });
                }
            }).catch(function (error) {
                console.error("Error getting document:", error);
            });
            // ...	
            if (!user.email.substring(user.email.indexOf('@')).includes('tamu.edu') && !whitelist.includes(user.email)) {
                user.delete().then(() => alert("This website is only usable by Texas A&M University Students, please log in with your school email.")).catch(error => console.error(error));
                signOut();
            }
            // if(user.email )
            //  //console.log(user);
        }).catch(function (error) {
            // Handle Errors here.	
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.	
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.	
            var credential = error.credential;
            // ...	
            alert(errorMessage);
        });
    } else {
        viewCurrentUserProfile();
    }
}
function signOut() {
    // Sign out of Firebase.
    firebase.auth().signOut().then(function () {
        sessionStorage.clear();
        document.getElementById("buttonText").childNodes[0].nodeValue = "Login with Net ID";
        document.getElementById("logoimg").style.display = "block";
        document.getElementById("profileimg").style.display = "none";
        // document.getElementById("profile-dropdown").href = "profile.html";
        document.getElementById("profile-dropdown").style.display = "none";
        window.location.href = "index.html";
    }).catch(error => console.error(error));
}
function initFirebaseAuth(_callback) {
    // Listen to auth state changes.
    let db = firebase.firestore();
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            if (!user.email.substring(user.email.indexOf('@')).includes('tamu.edu') && !whitelist.includes(user.email)) {
                user.delete().then(() => alert("This website is only usable by Texas A&M University Students, please log in with your school email.")).catch(error => console.error(error));
                signOut();
                document.getElementById("buttonText").childNodes[0].nodeValue = "Login with Net ID";
                document.getElementById("logoimg").style.display = "block";
                document.getElementById("profileimg").style.display = "none";
                document.getElementById("chatbutton").hidden = true;
                // document.getElementById("profile-dropdown").href = "profile.html";
                document.getElementById("profile-dropdown").style.display = "none";
            } else {
                document.getElementById("buttonText").childNodes[0].nodeValue = firebase.auth().currentUser.displayName;
                document.getElementById("logoimg").style.display = "none";
                document.getElementById("profileimg").style.display = "block";
                document.getElementById("chatbutton").hidden = false;
                document.getElementById("profileimg").src = firebase.auth().currentUser.photoURL;
                // document.getElementById("profile-dropdown").href = "profile.html";
                document.getElementById("profile-dropdown").style.display = "inline-block";

                db.collection('user-info')
                    .doc(firebase.auth().currentUser.uid)
                    .get()
                    .then((doc) => {
                        let user = doc.data();
                        document.getElementById('profileimg').src = user.photoURL;
                        document.getElementById('buttonText').innerHTML = user.name;
                    })
                    .catch((error) => console.error(error));
                saveMessagingDeviceToken();
                chatNotify();
            }
            _callback();
        } else {
            document.getElementById("buttonText").childNodes[0].nodeValue = "Login with Net ID";
            document.getElementById("logoimg").style.display = "block";
            document.getElementById("profileimg").style.display = "none";
            // document.getElementById("profile-dropdown").href = "profile.html";
            document.getElementById("profile-dropdown").style.display = "none";
            _callback();
        }
    });
}

// function openPrices() {
//     // document.getElementById("myModal").style.display = "block";
//     $("#myModal").modal();
// }

// function closePrices() {
//     document.getElementById("myModal").style.display = "none";
// }


$(function () {
    $('[name="search_type"]').on('change', function () {
        var value = $(this).children("option:selected").text();
        //  //console.log(value);
        if (value == 'Class name') {
            $('#main-searchbar').attr('placeholder', "Enter classname (ex: CSCE 121)");
        } else {
            $('#main-searchbar').attr('placeholder', `Enter ${value}`);
        }
    });
});

function showOrHideLoader() {
    if (document.readyState !== "complete") {
        document.querySelector(
            "body").style.visibility = "hidden";
        document.querySelector(
            "#loader").style.visibility = "visible";
    } else {
        document.querySelector(
            "#loader").style.display = "none";
        document.querySelector(
            "body").style.visibility = "visible";
    }
}

function dark_toggle() {
    var el1 = document.getElementById("dark-styles");
    if (el1.disabled) {
        el1.disabled = false;
        localStorage.setItem("darkreader", "enabled");
        // document.getElementById("nightowl").src = "images/nightowl.png";
    } else {
        el1.disabled = true;
        localStorage.setItem("darkreader", "disabled");
        // document.getElementById("nightowl").src = "images/owl.png";
    }
}

function searchToggle() {
    var vis = document.getElementById("searchnav").hidden;
    if (vis) {
        document.getElementById("searchnav").hidden = false;
    } else {
        document.getElementById("searchnav").hidden = true;
    }
}

$(function () {
    $("#searchFrom").change(function () {
        var value = $(this).children("option:selected").val();
        //  //console.log(value);
        if (value.toLowerCase() == "books") {
            document.getElementById("searchtypes").hidden = false;
            $("#searchtypes option[value='keywords']").prop('selected', true);
            document.getElementById("main-searchbar").placeholder = "Search by ISBN, title, or author";
        } else {
            document.getElementById("searchtypes").hidden = true;
            $("#searchtypes option[value='seller']").prop('selected', true);
            document.getElementById("main-searchbar").placeholder = "Search by name";
        }
    });
});
// function searchTypeChange() {
//     if(document.getElementById("searchFrom").value == "searchbooks"){
//         document.getElementById("searchtypes").hidden = false;
//     } else {
//         document.getElementById("searchtypes").hidden = true;
//         document.getElementById("searchType5").checked = true;
//     }
// }

// document.addEventListener('DOMContentLoaded', function () {
//     // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥	
//     // // The Firebase SDK is initialized and available here!	
//     //	
//     // firebase.auth().onAuthStateChanged(user => { });	
//     // firebase.database().ref('/path/to/ref').on('value', snapshot => { });	
//     // firebase.messaging().requestPermission().then(() => { });	
//     // firebase.storage().ref('/path/to/ref').getDownloadURL().then(() => { });	
//     //	
//     // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥	

//     try {
//         let app = firebase.app();
//         let features = ['auth', 'database', 'messaging', 'storage'].filter(feature => typeof app[feature] === 'function');
//         document.getElementById('load').innerHTML = `Firebase SDK loaded with ${features.join(', ')}`;
//     } catch (e) {
//         console.error(e);
//         document.getElementById('load').innerHTML = 'Error loading the Firebase SDK, check the console.';
//     }
// }); 
//helper functions
function compareStrings(a, b) {
    a = a.toLowerCase();
    b = b.toLowerCase();
    return (a < b) ? -1 : (a > b) ? 1 : 0;
}

function htmlString(str, cap = -1, end = '...') {
    if (str[0] == '<') {
        var el = document.createElement('html');
        el.innerHTML = str;
        var paragraphs = el.getElementsByTagName('p');
        str = "";
        for (let paragraph of paragraphs) {
            str += paragraph.innerHTML + '\n';
        }
    }
    if (cap >= 0 && str.length > cap) return str.substring(0, cap) + end;
    else return str;
}
var isValidIsbn = function (str) { //source - StackOverflow
    var sum,
        weight,
        digit,
        check,
        i;
    str = str.replace(/[^\dX]/gi, '');
    //  //console.log(str);
    if (str.length != 10 && str.length != 13) {
        return false;
    }
    if (str.length == 13) {
        sum = 0;
        for (i = 0; i < 12; i++) {
            digit = parseInt(str[i]);
            if (i % 2 == 1) {
                sum += 3 * digit;
            } else {
                sum += digit;
            }
        }
        check = (10 - (sum % 10)) % 10;
        return (check == str[str.length - 1]);
    }
    if (str.length == 10) {
        weight = 10;
        sum = 0;
        for (i = 0; i < 9; i++) {
            digit = parseInt(str[i]);
            sum += weight * digit;
            weight--;
        }
        check = 11 - (sum % 11);
        if (check == 10) {
            check = 'X';
        }
        return (check == str[str.length - 1].toUpperCase());
    }
}

function openChat() {
    window.location.href = "chat.html";
}

function chatWith(userid) {
    window.location.href = "chat.html?openchat=" + userid;
}
