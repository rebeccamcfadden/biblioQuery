var unsub = undefined;

function openSearch() {
    if (unsub) {
        unsub();
    }
    document.getElementById('messages').innerHTML = "";
    document.getElementById('messages').hidden = true;
    document.getElementById('recipientName').hidden = true;
    document.getElementById('recipientInput').hidden = false;
    document.getElementById('message-form').hidden = true;
    document.getElementById('openSearch').innerHTML = '<i class=" fas fa-times"></i>';
    document.getElementById('openSearch').setAttribute('onclick', `closeSearch();`);
    searchUsers();
}

function closeSearch() {
    document.getElementById('openSearch').setAttribute('onclick', `openSearch();`);
    document.getElementById('openSearch').innerHTML = '<i class=" fas fa-edit"></i>';
    var chatID = document.getElementById('chatID').value;
    if (!chatID || chatID == "") {
        displayBlankMessages();
    } else
        loadMessages(chatID);
}

var SEARCH_USER = '<button class="btn btn-light search-cards"><input class="search-nickname" hidden></button>';

function searchUsers() {
    const container = document.getElementById('chat-search-results');
    container.hidden = false;
    container.innerHTML = "";
    let db = firebase.firestore();
    db.collection('user-info').orderBy('name').get().then(querySnapshot => {
        querySnapshot.forEach(function (doc) {
            const li = document.createElement('div');
            li.innerHTML = SEARCH_USER;
            li.querySelector('.search-cards').textContent = doc.data().name;
            // if(doc.data().nickname){
            //     li.querySelector('.search-nickname').value = doc.data().nickname;
            // }
            li.querySelector('.search-cards').setAttribute('onclick', `newChat('${doc.data().uid}');`);
            container.appendChild(li);
        });
    });
    document.getElementById('recipientInput').focus();
}

function filterSearch() {
    // Declare variables
    var input, filter, results, buttons, i, txtValue;
    input = document.getElementById('recipientInput');
    filter = input.value.toUpperCase();
    results = document.getElementById("chat-search-results");
    buttons = results.getElementsByTagName('button');

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < buttons.length; i++) {
        txtValue = buttons[i].textContent;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            buttons[i].style.display = "";
        } else {
            buttons[i].style.display = "none";
        }
    }
}

function newChat(recipientID) {
    let db = firebase.firestore();
    let me = firebase.auth().currentUser;
    var chatID;
    var exists = false;
    if (recipientID == "" || !recipientID || recipientID == null) {
        getChats();
        displayBlankMessages();
        return;
    }
    //  //console.log(recipientID);
    db.collection('chats').where('users', 'array-contains', me.uid)
        .get().then(snapshot => {
            function callback() {
                if (!exists) {
                    db.collection('chats').add({
                        users: [
                            firebase.auth().currentUser.uid,
                            recipientID
                        ]
                    }).then(ref => {
                         //console.log('created a new chat with ID: ' + ref.id);
                        chatID = ref.id;
                        getChats(chatID, function () { return loadMessages(chatID); });
                    });
                }
            }
            if (snapshot.empty) {
                exists = false;
                callback();
            } else {
                var i = 0;
                snapshot.forEach(doc => {
                    //  //console.log(doc.data());
                    if (doc.data().users.includes(recipientID)) {
                        exists = true;
                        getChats(doc.id, function () { return loadMessages(doc.id); });
                    }
                    if (i == snapshot.docs.length - 1) {
                        callback();
                    }
                    i++;
                });
            }
        })
}

function createAndInsertChat(chatID, recipientName) {
    const chatListElement = document.getElementById('chat-sidebar');
    const container = document.createElement('button');
    container.setAttribute('class', 'btn btn-light chat-button');
    container.innerHTML = CHAT_TEMPLATE;
    const div = container;
    div.setAttribute('id', 'chat-' + chatID);

    div.setAttribute('name', recipientName);

    // figure out where to insert new message
    const existingMessages = chatListElement.children;
    if (existingMessages.length === 0) {
        chatListElement.appendChild(div);
    } else {
        let chatListNode = existingMessages[0];

        while (chatListNode) {
            const chatListNodeName = chatListNode.getAttribute('name');

            if (chatListNodeName) {
                if (compareStrings(chatListNodeName, recipientName)) {
                    break;
                }
            }
            chatListNode = chatListNode.nextSibling;
        }

        chatListElement.insertBefore(div, chatListNode);
    }
    return div;
}

function displayChat(chatID, sidebar, callback = null) {
    var chatIDs = JSON.parse(sessionStorage.getItem('chatIDs'));
    //  //console.log(chatIDs);
    let user = firebase.auth().currentUser;
    let db = firebase.firestore();
    let userDBRef = db.collection('user-info');
    var recipientID;
    if(chatID == null || !chatID) return;
    db.collection('chats').doc(chatID).get().then(function (doc) {
        let users = doc.data().users;
        if (!doc.exists) {
            return;
        } else if (users[0] == user.uid) {
            recipientID = users[1];
        } else recipientID = users[0];
        if (recipientID == null || !recipientID) return;
        userDBRef.doc(recipientID).get().then(function (doc2) {
            sessionStorage.setItem(chatID, JSON.stringify(doc2.data()));
            //  //console.log(JSON.parse(sessionStorage.getItem(recipientID)));
            recipient = doc2.data();
            var btn = document.getElementById('chat-' + chatID) || createAndInsertChat(chatID, recipient.name);
            btn.querySelector('.chat-img').src = addSizeToGoogleProfilePic(recipient.photoURL);
            btn.querySelector('.chat-name').textContent = recipient.name;
            btn.setAttribute('onclick', `loadMessages('${chatID}');`);
            if (chatIDs.includes(chatID)) {
                document.getElementById('chat-' + chatID).classList.add('chat-notify');
            };
            sidebar.appendChild(btn);
            if (callback != null) {
                callback();
            }
        }).catch(err => {
              console.log('Error getting documents', err);
        });
    }).catch(function (error) {
          console.log("Error getting document:", error);
        return;
    });
}

var SIDEBAR_SEARCH = '<div class="row">' +
    '<input class="chat-search" id="messages-search"' +
    'type="search" placeholder="Search chats...">' +
    '<button id="openSearch" class="btn btn-light chat-write" onclick="openSearch();">' +
    '<i class=" fas fa-edit"></i></button></div>';


function deleteChat(chatID) {
    if (document.getElementById('chat-' + chatID) && confirm("Are you sure you want to delete this chat?")){
       let db = firebase.firestore();
        db.collection('chats').doc(chatID).delete();
        document.getElementById('chat-' + chatID).remove();
    }
}

function getChats(chatID, callback = null) {
    let db = firebase.firestore();
    let user = firebase.auth().currentUser;
    let query = db.collection('chats')
        .where("users", 'array-contains', user.uid);
    const sidebar = document.getElementById('chat-sidebar');
    sidebar.innerHTML = SIDEBAR_SEARCH;
    query.onSnapshot(function (snapshot) {
        var i = 0;
        snapshot.docChanges().forEach(function (change) {
            i++;
            if (change.type === 'removed') {
                deleteChat(change.doc.id);
            } else {
                if (chatID == change.doc.id && callback != null) {
                    displayChat(change.doc.id, sidebar, callback);
                } else {
                    displayChat(change.doc.id, sidebar);
                }
            }
        });
    });
}

var CHAT_TEMPLATE =
    '<div class="row"><div class="col-sm-3">' +
    '<img class="chat-img" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;"></div>' +
    '<div class="col-md-9 text-left">' +
    '<h5 class="chat-name"></h5>' +
    '</div></div>';

var MESSAGE_TEMPLATE =
    '<div class="message-container">' +
    '<div class="spacing">' + '<div class="pic">' +
    '<img id="message-img" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover;">' +
    '</div>' + '</div>' +
    '<div class="message"></div>' +
    '<div class="row"><div class="name col-lg-auto"></div>' +
    '<p class="mr-0 col-2-sm timestamp"></p></div></div>';

function saveMessage(messageText) {
    // Add a new message entry to the database.
    let user = firebase.auth().currentUser;
    let db = firebase.firestore();
    var chatID = document.getElementById("chatID").value;
    var recipientID = document.getElementById("recipientID").value;
    if (chatID == "") {
        
        db.collection('chats').add({
            users: [
                user.uid, recipientID
            ]
        }).then(ref => {
             //console.log('created a new chat with ID: ' + ref.id);
            chatID = ref.id;
        });
    }
    const recipientRef = db.collection('user-info').doc(recipientID);
    recipientRef.get().then(function (doc) {
        var count;
        var myChatIDs;
        if(!doc.data().notifications) {
            count = 0
            myChatIDs = [];
        } else {
            count = doc.data().notifications.count;
            if(!count) count = 0;
            var myChatIDs = doc.data().notifications.chatIDs;
            if(!myChatIDs) myChatIDs = [];
        }
        
        myChatIDs.push(chatID);
        recipientRef.update({
            'notifications': {
                count: count + 1,
                chatIDs: myChatIDs
            }
        }).then(function () {
             //console.log('updated');
        });
    });
    var chatRef = db.collection('chats').doc(chatID);
    var timeNow = firebase.firestore.Timestamp.now();
    return chatRef.collection('messages').add({
        sender: user.uid,
        data: messageText,
        time: timeNow
    }).catch(function (error) {
        console.error('Error writing new message to database', error);
    });
}

function sendMessage() {
    var messageText = document.getElementById("messageText").value;
    saveMessage(messageText).then(function (result) {
        //  //console.log(result);
        document.getElementById('messageText').value = "";
        // TODO refresh message div;
        return false;
    });
}

function getRecipient(chatID, user) {
    let db = firebase.firestore();
    db.collection('chats').doc(chatID)
        .get().then(doc => {
            if (!doc.exists) {
                  console.log('No matching documents.');
                return "";
            }
            var recipient = doc.data().users.find(element => element != user);
            return recipient;
        }).catch(err => {
              console.log('Error getting documents', err);
            return "";
        });
}

function displayBlankMessages() {
    document.getElementById('messages').innerHTML = "";
    document.getElementById('messages').hidden = false;
    document.getElementById('recipientName').hidden = false;
    document.getElementById('recipientInput').hidden = true;
    document.getElementById('message-form').hidden = false;
    document.getElementById('chat-search-results').innerHTML = "";
    document.getElementById('chat-search-results').hidden = true;
}
function showChatMessages(){
        var x = document.getElementById("chat-sidebar");
        var y = document.getElementById("backbutton");
        if (x.style.display === "none") {
            x.style.display = "block";
            y.style.display = "none";
        } else {
            x.style.display = "none";
            y.style.display = "block";

        }
    
}
// Loads chat messages history and listens for upcoming ones.
function loadMessages(chatID) {
    //Deals with displaying back button
    var w = parseInt(window.innerWidth);
    if(w <= 800) {
        //max-width 500px
        // actions here...
        //new function for person button
        var chat_sidebar = document.getElementById("chat-sidebar");
        var back_button = document.getElementById("backbutton");
            if (chat_sidebar.style.display === "none") {
                chat_sidebar.style.display = "block";
                back_button.style.display = "none";
            } else {
                //hide chat sidebar and show back button
                chat_sidebar.style.display = "none";
                back_button.style.display = "block";
            }
    }
    if (unsub) {
        unsub();
    }
    var chatIDs = JSON.parse(sessionStorage.getItem('chatIDs'));
    if (chatIDs && chatIDs.includes(chatID)) {
        document.getElementById('chat-' + chatID).classList.remove('chat-notify');
        chatIDs.splice(chatIDs.indexOf(chatID), 1);
        // sessionStorage.setItem('chatIDs', JSON.stringify(chatIDs)); // TODO
    }
    document.getElementById('messages').innerHTML = "";
    document.getElementById('messages').hidden = false;
    document.getElementById('chatID').value = chatID;
    document.getElementById('recipientName').hidden = false;
    document.getElementById('recipientInput').hidden = true;
    document.getElementById('message-form').hidden = false;
    document.getElementById('chat-search-results').innerHTML = "";
    document.getElementById('chat-search-results').hidden = true;
    Array.from(document.getElementsByClassName('chat-button-open')).forEach(function (el) {
        if (el != null)
            el.classList.remove('chat-button-open');
    })
    document.getElementById('chat-' + chatID).classList.add('chat-button-open');
    let recipient = JSON.parse(sessionStorage.getItem(chatID));
    let name = recipient.name;
    document.getElementById('recipientName').hidden = false;
    document.getElementById('recipientName').textContent = name;
    document.getElementById('recipientName').href = "/profile.html?user=" + recipient.uid;
    document.getElementById('recipientID').value = recipient.uid;
    let db = firebase.firestore();
    var query = db.collection('chats')
        .doc(chatID)
        .collection('messages')
        .orderBy('time', 'asc')
        .limit(100);

    // Start listening to the query.
    unsub = query.onSnapshot(function (snapshot) {
        snapshot.docChanges().forEach(function (change) {
            if (change.type === 'removed') {
                deleteMessage(change.doc.id, chatID);
            } else {
                var message = change.doc.data();
                displayMessage(chatID, change.doc.id, message.time, message.sender,
                    message.data);
            }
        });
    });
}

function createAndInsertMessage(id, timestamp) {
    const messageListElement = document.getElementById('messages');
    const container = document.createElement('div');
    container.innerHTML = MESSAGE_TEMPLATE;
    const div = container.firstChild;
    div.setAttribute('id', id);

    // If timestamp is null, assume we've gotten a brand new message.
    // https://stackoverflow.com/a/47781432/4816918
    timestamp = timestamp ? timestamp.toMillis() : Date.now();
    div.setAttribute('timestamp', timestamp);

    // figure out where to insert new message
    const existingMessages = messageListElement.children;
    if (existingMessages.length === 0) {
        messageListElement.appendChild(div);
    } else {
        let messageListNode = existingMessages[0];

        while (messageListNode) {
            const messageListNodeTime = messageListNode.getAttribute('timestamp');

            if (!messageListNodeTime) {
                throw new Error(
                    `Child ${messageListNode.id} has no 'timestamp' attribute`
                );
            }

            if (messageListNodeTime > timestamp) {
                break;
            }

            messageListNode = messageListNode.nextSibling;
        }

        messageListElement.insertBefore(div, messageListNode);
    }

    return div;
}

function addSizeToGoogleProfilePic(url) {
    if (url.indexOf('googleusercontent.com') !== -1 && url.indexOf('?') === -1) {
        return url + '?sz=150';
    }
    return url;
}

const interval = setInterval(updateTimes, 5000);

function updateTimes() {
    let messages = Array.from(document.getElementsByClassName('message-contatiner'));
    messages.forEach(message => {
        let time = message.getAttribute('timestamp');
        var prettyTime = moment(time.toDate()).fromNow();
        message.querySelector('timestamp').textContent = prettyTime;
    });
}

// Displays a Message in the UI.
function displayMessage(chatID, messageID, time, sender, messageText) {
    const messageListElement = document.getElementById('messages');
    var div = document.getElementById(messageID) || createAndInsertMessage(messageID, time);
    var name;
    function setInfo(senderInfo) {
        let picUrl = senderInfo.photoURL;
        if (picUrl) {
            div.querySelector('#message-img').src = picUrl;//.querySelector('.pic').children.forEach((child) => child.src = picUrl);
        }
        name = senderInfo.name;
        div.querySelector('.name').textContent = name;
    }
    var senderInfo;
    if (sender == firebase.auth().currentUser.uid) {
        senderInfo = firebase.auth().currentUser;
        name = senderInfo.displayName;
        let db = firebase.firestore();
        db.collection('user-info')
            .doc(firebase.auth().currentUser.uid)
            .get()
            .then((doc) => setInfo(doc.data()))
            .catch((error) => console.error(error));
    } else {
        senderInfo = JSON.parse(sessionStorage.getItem(chatID));
        setInfo(senderInfo);
    }
    //  //console.log(senderInfo);
    div.querySelector('.timestamp').textContent = moment(time.toDate()).fromNow();
    //  //console.log(time);
    // profile picture
    var messageElement = div.querySelector('.message');

    if (messageText) { // If the message is text.
        messageElement.textContent = messageText;
        // Replace all line breaks by <br>.
        messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
    }
    // Show the card fading-in and scroll to view the new message.
    setTimeout(function () {
        div.classList.add('visible')
    }, 1);
    messageListElement.scrollTop = messageListElement.scrollHeight;
    document.getElementById('messageText').focus();
}

function deleteMessage(messageID, chatID) {
    let db = firebase.firestore();
    db.collection('chats').doc(chatID).collection('messages').doc(messageID).delete();
    if(document.getElementById(messageID)){
        document.getElementById(messageID).remove();
    }
}


(function () {

    "use strict";

    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //
    // H E L P E R    F U N C T I O N S
    //
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    /**
     * Function to check if we clicked inside an element with a particular class
     * name.
     * 
     * @param {Object} e The event
     * @param {String} className  The class name to check against
     * @return {Boolean}
     */
    function clickInsideElement(e, className1, className2=null) {
        var el = e.srcElement || e.target;
        if(className2){
           id = el.id; 
        }
        if (el.classList.contains(className1)){
             
            return el;
        } else if (className2 && el.classList.contains(className2)) {
            deleteType = "message";
             
            return el;
        } else {
            while (el = el.parentNode) {
                if (className2) {
                    id = el.id;
                }
                if (el.classList && el.classList.contains(className1)) {
                     
                    return el;
                } else if (el.classList && className2 && el.classList.contains(className2)) {
                    deleteType = "message";
                     
                    return el;
                }
            }
        }

        return false;
    }

    /**
     * Get's exact position of event.
     * 
     * @param {Object} e The event passed in
     * @return {Object} Returns the x and y position
     */
    function getPosition(e) {
        var posx = 0;
        var posy = 0;

        if (!e) var e = window.event;

        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        } else if (e.clientX || e.clientY) {
            posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        return {
            x: posx,
            y: posy
        }
    }

    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //
    // C O R E    F U N C T I O N S
    //
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    /**
     * Variables.
     */
    var contextMenuClassName = "context-menu";
    var contextMenuItemClassName = "context-menu__item";
    var contextMenuLinkClassName = "context-menu__link";
    var contextMenuActive = "context-menu--active";

    var chatClassName = "chat-button";
    var messageClassName = "message-container";
    var deleteType = "chat";
    var taskItemInContext;

    var clickCoords;
    var clickCoordsX;
    var clickCoordsY;

    var menu = document.querySelector(".context-menu");
    var menuItem = menu.querySelector(".context-menu__item");
    var menuState = 0;
    var menuWidth;
    var menuHeight;
    var menuPosition;
    var menuPositionX;
    var menuPositionY;

    var windowWidth;
    var windowHeight;
    var id;

    /**
     * Initialise our application's code.
     */
    function init() {
        contextListener();
        clickListener();
        keyupListener();
        resizeListener();
    }

    /**
     * Listens for contextmenu events.
     */
    function contextListener() {
        document.addEventListener("contextmenu", function (e) {
            taskItemInContext = clickInsideElement(e, chatClassName, messageClassName);

            if (taskItemInContext) {
                e.preventDefault();
                toggleMenuOn();
                positionMenu(e);
            } else {
                taskItemInContext = null;
                toggleMenuOff();
            }
        });
    }
    function clickListener() {
        document.addEventListener("click", function (e) {
            var clickeElIsLink = clickInsideElement(e, contextMenuLinkClassName);

            if (clickeElIsLink) {
                e.preventDefault();
                menuItemListener(clickeElIsLink);
            } else {
                var button = e.which || e.button;
                if (button === 1) {
                    toggleMenuOff();
                }
            }
        });
    }

    function keyupListener() {
        window.onkeyup = function (e) {
            if (e.keyCode === 27) {
                toggleMenuOff();
            }
        }
    }
    function resizeListener() {
        window.onresize = function (e) {
            toggleMenuOff();
        };
    }
    function toggleMenuOn() {
        if (menuState !== 1) {
            if(deleteType == "message"){
                menuItem.innerHTML = '<a class="context-menu__link"><i class="fa fa-times"></i> Delete message</a>';
            } else menuItem.innerHTML = '<a class="context-menu__link"><i class="fa fa-times"></i> Delete chat</a>';
            menuState = 1;
            menu.classList.add(contextMenuActive);
        }
    }
    function toggleMenuOff() {
        if (menuState !== 0) {
            menuState = 0;
            menu.classList.remove(contextMenuActive);
        }
    }

    /**
     * Positions the menu properly.
     * 
     * @param {Object} e The event
     */
    function positionMenu(e) {
        clickCoords = getPosition(e);
        clickCoordsX = clickCoords.x;
        clickCoordsY = clickCoords.y;

        menuWidth = menu.offsetWidth + 4;
        menuHeight = menu.offsetHeight + 4;

        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;

        if ((windowWidth - clickCoordsX) < menuWidth) {
            menu.style.left = windowWidth - menuWidth + "px";
        } else {
            menu.style.left = clickCoordsX + "px";
        }

        if ((windowHeight - clickCoordsY) < menuHeight) {
            menu.style.top = windowHeight - menuHeight + "px";
        } else {
            menu.style.top = clickCoordsY + "px";
        }
    }

    /**
     * Dummy action function that logs an action when a menu item link is clicked
     * 
     * @param {HTMLElement} link The link that was clicked
     */
    function menuItemListener(link) {
        if(deleteType == "message"){
            deleteMessage(id, document.getElementById('chatID').value);
        } else {
            deleteChat(id.substring(5));
        }
        toggleMenuOff();
    }
    init();

})();