const messaging = firebase.messaging();

var title = document.title;
var count = 0;

window.onfocus = function () {
    focused = true;
    if(window.location.pathname == "/chat.html"){
        updateCount(0);
        firebase.firestore().collection('user-info').doc(firebase.auth().currentUser.uid)
            .update({ 'notifications': { count: 0 } });
    }
};
window.onblur = function () {
    focused = false;
};

function saveMessagingDeviceToken() {
    firebase.messaging().getToken().then(function (currentToken) {
        if (currentToken) {
             //console.log('Got FCM device token:', currentToken);
            // Saving the Device Token to the datastore.
            firebase.firestore().collection('fcmTokens').doc(firebase.auth().currentUser.uid)
                .set({
                    token: currentToken
                });
        } else {
            // Need to request permissions to show notifications.
            requestNotificationsPermissions();
        }
    }).catch(function (error) {
        console.error('Unable to get messaging token.', error);
    });
}

function requestNotificationsPermissions() {
     //console.log('Requesting notifications permission...');
    firebase.messaging().requestPermission().then(function () {
        // Notification permission granted.
        saveMessagingDeviceToken();
    }).catch(function (error) {
        console.error('Unable to get permission to notify.', error);
    });
}

messaging.onTokenRefresh(() => {
    messaging.getToken().then((refreshedToken) => {
         //console.log('Token refreshed.');
        // Indicate that the new Instance ID token has not yet been sent to the
        // app server.
        setTokenSentToServer(false);
        // Send Instance ID token to app server.
        sendTokenToServer(refreshedToken);
        // ...
    }).catch((err) => {
          console.log('Unable to retrieve refreshed token ', err);
        showToken('Unable to retrieve refreshed token ', err);
    });
});

function updateCount(count){
     //console.log('update count ' + count);
    var newTitle;
    const el = document.getElementById('chatbutton');
    if ((window.location.pathname == "/chat.html" && !document.hidden) || count == 0){
        el.setAttribute('data-count', 0);
        el.classList.remove('show-count');
        newTitle = title;
    } else {
        el.setAttribute('data-count', count);
        el.classList.add('show-count');
        newTitle = '(' + count + ') ' + title;
    }
    document.title = newTitle;
    el.offsetWidth = el.offsetWidth;
}

function chatNotify() {
    let db = firebase.firestore();
    
    let query = db.collection('user-info').where('uid', '==', firebase.auth().currentUser.uid);
    unsubMessages = query.onSnapshot(function (snapshot) {
        snapshot.docChanges().forEach(function (change) {
             //console.log('got a message');
             //console.log(change.doc.data());
            if(change.doc.data().notifications){
                var count = parseInt(change.doc.data().notifications.count);
                if (window.location.pathname == "/chat.html" && !document.hidden){
                    updateCount(0);
                    db.collection('user-info').doc(firebase.auth().currentUser.uid)
                        .update({ 'notifications': { count: 0}});
                    if (change.doc.data().notifications.chatIDs) {
                        change.doc.data().notifications.chatIDs.forEach(chatID => {
                            if(document.getElementById('chatID').value != chatID)
                                document.getElementById('chat-' + chatID).classList.add('chat-notify');
                        });
                    }
                } else updateCount(count);
                if (change.doc.data().notifications.chatIDs) {
                    
                    sessionStorage.setItem('chatIDs', JSON.stringify(change.doc.data().notifications.chatIDs));
                }
            } else {
                db.collection('user-info').doc(firebase.auth().currentUser.uid)
                    .update({ 'notifications': { count: 0, chatIDs : [] } });
            }
        });
    });
}

messaging.onMessage(payload => {
     //console.log('got a message ' + document.hidden);
    if (window.location.pathname != "/chat.html" || document.hidden) {
        //  //console.log(payload);
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(function (registration) {
                registration.showNotification(payload.notification.title, {
                    body : payload.notification.body,
                    icon : payload.notification.icon,
                    click_action : payload.notification.click_action
                });
            });
        }
    }
});

function deleteToken() {
    // Delete Instance ID token.
    // [START delete_token]
    messaging.getToken().then((currentToken) => {
        messaging.deleteToken(currentToken).then(() => {
             //console.log('Token deleted.');
            setTokenSentToServer(false);
        }).catch((err) => {
              console.log('Unable to delete token. ', err);
        });
        // [END delete_token]
    }).catch((err) => {
          console.log('Error retrieving Instance ID token. ', err);
        showToken('Error retrieving Instance ID token. ', err);
    });

}

function sendTokenToServer(currentToken) {
    if (!isTokenSentToServer()) {
         //console.log('Sending token to server...');
        // TODO(developer): Send the current token to your server.
        setTokenSentToServer(true);
    } else {
          console.log('Token already sent to server so won\'t send it again ' +
            'unless it changes');
    }

}
