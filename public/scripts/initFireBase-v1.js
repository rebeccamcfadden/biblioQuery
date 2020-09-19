if (firebase.apps.length === 0) {
   //console.log("Loading Firebase")
  const firebaseConfig = {
      apiKey: "AIzaSyDFD3ASPa4CD4EAotVoczK_pPfzEX_jIgk",
      authDomain: "biblioquery.firebaseapp.com",
      databaseURL: "https://biblioquery.firebaseio.com",
      projectId: "biblioquery",
      storageBucket: "biblioquery.appspot.com",
      messagingSenderId: "616201462184",
      appId: "1:616201462184:web:343a2f2b6810e461a37d9d",
      measurementId: "G-GTWZ02FN16"
  };
  // Initialize Cloud Firestore through Firebase
  firebase.initializeApp(firebaseConfig);

  navigator.serviceWorker
    .register('firebase-messaging-sw.js')
    .then((registration) => {
      firebase.messaging().useServiceWorker(registration);
      firebase.messaging().usePublicVapidKey("BNsoQ1WIvpoP51P7j0dqsrrZ2KLAS_WjvRWbatfMM_FC9GI9WiwixRDdlDBnFWCUmELPGTYLQoQHPjgDhpG7Y5M");
    });
}