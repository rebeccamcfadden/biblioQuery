importScripts('https://www.gstatic.com/firebasejs/7.8.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.8.0/firebase-messaging.js');

const firebaseSWConfig = {
    apiKey: "AIzaSyDFD3ASPa4CD4EAotVoczK_pPfzEX_jIgk",
    projectId: "biblioquery",
    messagingSenderId: "616201462184",
    appId: "1:616201462184:web:343a2f2b6810e461a37d9d"
};
// Initialize Cloud Firestore through Firebase
firebase.initializeApp(firebaseSWConfig);

const messaging = firebase.messaging();
messaging.setBackgroundMessageHandler(function (payload) {
    client.postMessage({
            msg: "Hey I just got a fetch from you!",
            url: event.request.url
        });
     console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = 'Background Message Title';
    const notificationOptions = {
        body: 'Background Message body.',
        icon: 'images/bookicon.png'
    };
    return self.registration.showNotification(notificationTitle,
        notificationOptions);
});

// messaging.onMessage((payload) => {
//      //console.log('Message received. ', payload);
//     // ...
// });