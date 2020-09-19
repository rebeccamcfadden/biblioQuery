//profile.html

function stars(stars) {
  var array = document.getElementsByClassName('ratings');
  for (i = 0; i < stars; i++) {
      array[i].classList.add('star-gold');
  }
  for (i = stars; i < array.length; i++) {
      array[i].setAttribute('class', 'fa fa-star ratings');
  }
}

function sendReview() {
  let db = firebase.firestore();
  // const reviewer_name = document.getElementById('name').value;
  const reviewer_id = firebase.auth().currentUser.uid;
  const rating = document.getElementsByClassName('ratings star-gold').length;
  const data = document.getElementById('reviewcontent').value;
  const urlString = window.location.search;
  const urlParams = new URLSearchParams(urlString);
  var subject_id = urlParams.get('user');
  if (subject_id == "me") {
      subject_id = firebase.auth().currentUser.uid;
  }
  db.collection('reviews').add({
      reviewer_id: reviewer_id,
      rating: rating,
      data: data,
      subject_id: subject_id,
      posted: firebase.firestore.Timestamp.fromDate(new Date())
  }).then(ref => {
      //  //console.log('Added document with ID: ', ref.id);
      alert("Review posted");
      window.location.href = window.location.href;
  });
}

function editReview(doc_id) {
  let db = firebase.firestore();
  // const reviewer_name = document.getElementById('name').value;
  const rating = document.getElementsByClassName('ratings star-gold').length;
  const data = document.getElementById('reviewcontent').value;
  db.collection('reviews').doc(doc_id).update({
      rating: rating,
      data: data,
      last_updated: firebase.firestore.Timestamp.fromDate(new Date())
  }).then(ref => {
      //  //console.log('Updated document with ID: ', doc_id);
      alert("Review updated");
      window.location.href = window.location.href;
  });
}

function deleteReview(doc_id) {
  let db = firebase.firestore();
  db.collection('reviews').doc(doc_id).delete().then(function () {
      //  //console.log('Deleted document with ID: ', doc_id);
      alert("Review deleted");
      window.location.href = window.location.href;
  }).catch(function (error) {
      console.error(error);
  });
}

function writeReview() {
  $("#reviewModal").modal();
  if (isUserSignedIn()) {
      document.getElementById('name').value = firebase.auth().currentUser.displayName;
  }
}

function getFields(doc, elems) {
  elems.forEach(function (element) {
      if (doc.get(element.id)) {
          element.textContent = doc.get(element.id);
      }
      element.hidden = false;
  });
}

function getUser(extradata = true) {
  let db = firebase.firestore();
  const urlString = window.location.search;
  const urlParams = new URLSearchParams(urlString);
  if (isUserSignedIn()) {
      let signInButton = document.getElementById("signInButton");
      let messageMe = document.getElementById("userchatbutton");
      // signInButton.removeEventListener("click", viewCurrentUserProfile);
      // // signInButton.addEventListener("click", event.preventDefault());
      var user_id = urlParams.get('user');
      //  //console.log(user_id);
      var user;
      if (user_id == "me") {
          signInButton.disabled = true;
          messageMe.hidden = true;
          user = firebase.auth().currentUser;
          document.title = user.displayName + " | Biblioquery";
          document.getElementById('nickname').textContent = user.displayName;
          let profilePicture = document.getElementById('userimg');
          document.getElementById('email').textContent = user.email;
          document.getElementById('email').href = `mailto:${user.email}`;
          document.getElementById('editprofile').hidden = false;
          document.getElementById('reviewbutton').hidden = true;
          var docRef = db.collection('user-info').doc(user.uid);
          docRef.get().then(function (doc) {
              var elems = window.document.getElementsByClassName('profiledata');
              getFields(doc, Array.from(elems));
              profilePicture.src = doc.data().photoURL;
              document.title = doc.data().name + " | Biblioquery";
              document.getElementById('nickname').textContent = doc.data().name;
          }).catch((error) => {
              console.error(error);
              profilePicture.src = user.photoURL;
          });
          if (extradata) {
              getUserPostings(user);
              getReviews(user);
          }
      } else {
          db.collection('user-info').doc(user_id).get().then(function (doc) {
              if (!doc.exists) {
                  alert("Error finding user");
                  window.location.replace("504.html");
                  //use window location replace to fix back button errors
              } else {
                  user = doc.data();
                  messageMe.hidden = false;
                  messageMe.setAttribute('onclick', `chatWith('${user.uid}');`)
                  document.title = user.name + " | Biblioquery";
                  document.getElementById('nickname').textContent = user.name;
                  document.getElementById('userimg').src = user.photoURL;
                  document.getElementById('email').textContent = user.email;
                  document.getElementById('email').href = `mailto:${user.email}`;
                  if (extradata) {
                      getUserPostings(user);
                      getReviews(user);
                  }
              }
          }).catch(err => {
              console.error("Error getting document", err);
          });
      }
  } else {
      window.location.replace("403.html");
  }
}
function getUserPostings(user) {
  let db = firebase.firestore();
  //  //console.log(user);
  db.collection('book-listings').where('seller', '==', user.uid)
      .get()
      .then(function (querySnapshot) {
          const indicators = document.getElementById('bookcarousel-indicators');
          const carousel = document.getElementById('bookcarousel-inner');
          var i = 0;
          querySnapshot.forEach(function (doc) {
              const carouselItem = document.createElement('div');
              const navItem = document.createElement('li');
              navItem.setAttribute('data-target', '#carouselExampleIndicators');
              navItem.setAttribute('data-slide-to', i);
              if (i == 0) {
                  navItem.setAttribute('class', 'active');
                  carouselItem.setAttribute('class', 'carousel-item active');
              } else {
                  carouselItem.setAttribute('class', 'carousel-item');
              }
              indicators.appendChild(navItem);
              carousel.appendChild(carouselItem);
              let book = doc.data();
              const col = document.createElement('div');
              col.setAttribute('class', 'col');
              const row = document.createElement('div');
              row.setAttribute('class', 'row');
              const innercol = document.createElement('div');
              innercol.setAttribute('class', 'col-sm-3');
              innercol.setAttribute('align', 'right');
              const innercol2 = document.createElement('div');
              innercol2.setAttribute('class', 'col-md-9 text-left');
              const card = document.createElement('div');
              card.setAttribute('class', 'card result-card');
              card.setAttribute('onclick', 'loadBook("' + book.isbn10 + '");')
              const img = document.createElement('img');
              img.setAttribute('class', 'result-img');
              img.setAttribute('style', 'width: auto; height: 150px');
              if (book.url != null && book.url != "") {
                  img.src = book.url;
              } else {
                  const url = "https://api2.isbndb.com/book/" + book.isbn10;
                  let request = new XMLHttpRequest();
                  request.open("GET", url);
                  request.setRequestHeader("Content-Type", 'application/json');
                  request.setRequestHeader("Authorization", '43940_f752a0ce9e17dad0f26891f083c9cd0b');
                  request.onload = function () {
                      var data = JSON.parse(this.response);
                      if (request.status >= 200 && request.status < 400) {
                          img.src = data.book.image;
                      }
                  }
                  request.send();
              }
              const h1 = document.createElement('h5');
              h1.textContent = book.title;
              const p = document.createElement('p');
              p.textContent = book.isbn;
              const p1 = document.createElement('p');
              p1.textContent = book.authors;
              carouselItem.appendChild(card);
              card.appendChild(row);
              row.appendChild(innercol);
              row.appendChild(innercol2);
              innercol.appendChild(img);
              innercol2.appendChild(h1);
              innercol2.appendChild(p);
              innercol2.appendChild(p1);
              i++;
              document.getElementById('carouselExampleIndicators').style.display = "block";
          });
      });
}
function getReviews(user) {
  let db = firebase.firestore();
  var ratingSum = 0;
  var ratingTotal = 0;
  var docRef = db.collection('user-info').doc(user.uid);
  db.collection('reviews').where('subject_id', '==', user.uid)
      .get()
      .then(function (querySnapshot) {
          const reviewDiv = document.getElementById('reviews');
          stars(5);
          querySnapshot.forEach(function (doc) {
              document.getElementById('reviews_empty').style.display = "none";
              const card = document.createElement('div');
              card.setAttribute('class', 'card result-card');
              reviewDiv.appendChild(card);
              const innercol = document.createElement('div');
              innercol.setAttribute('class', 'col-sm-3');
              const reviewer = document.createElement('a');
              var reviewerRef = db.collection('user-info').doc(doc.data().reviewer_id);
              if (doc.data().reviewer_id == firebase.auth().currentUser.uid) {
                  //  //console.log(doc);
                  let reviewButton = document.getElementById('reviewbutton');
                  reviewButton.innerHTML = "Edit Review";
                  let title = document.getElementById('reviewModalTitle');
                  title.innerHTML = "Edit Review";
                  stars(doc.data().rating);
                  let reviewContent = document.getElementById('reviewcontent');
                  reviewContent.innerHTML = doc.data().data;
                  let deleteReviewButton = document.getElementById("deleteReviewButton");
                  deleteReviewButton.hidden = false;
                  deleteReviewButton.setAttribute('onclick', `deleteReview("${doc.id}");`);
                  deleteReviewButton.onclick = function () { deleteReview(doc.id); };
                  let sendReviewButton = document.getElementById("sendReviewButton");
                  sendReviewButton.setAttribute('onclick', `editReview("${doc.id}");`);
                  sendReviewButton.onlick = function () { editReview(doc.id); };
              }
              reviewerRef.get().then(function (doc2) {
                  reviewer.textContent = doc2.data().name;
                  reviewer.href = "profile.html?user=" + doc2.data().uid;
              });
              const innercol2 = document.createElement('div');
              innercol2.setAttribute('class', 'col-md-9 text-left');
              card.appendChild(innercol);
              innercol.appendChild(reviewer);
              card.appendChild(innercol2);
              var rating = doc.data().rating;
              ratingSum += rating;
              ratingTotal += 1;
              for (s = 0; s < 5; s++) {
                  const star = document.createElement('i');
                  if (s < rating) {
                      star.setAttribute('class', 'fa fa-star star-gold');
                  } else {
                      star.setAttribute('class', 'fa fa-star');
                  }
                  innercol2.appendChild(star);
              }
              const body = document.createElement('p');
              body.textContent = doc.data().data;
              card.appendChild(body);
          })
          let i = 0;
          if (ratingTotal != 0) {
              ratingSum = Math.ceil(ratingSum / ratingTotal);
              docRef.update({ userrating: ratingSum });
          } else {
              docRef.update({ userrating: firebase.firestore.FieldValue.delete() });
          }
          Array.from(document.getElementById('userrating').getElementsByClassName('fa')).forEach(function (element) {
              if (i < ratingSum) {
                  element.classList.add('star-gold');
              } else {
                  element.classList.remove('star-gold');
              }
              i++;
          })
      });
}

var uploadFile = null;

function setupDragAndDrop() {
    // Global variable from self-calling function
    var isAdvancedUpload = function () {
        var div = document.createElement('div');
        return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
    }();

    //    //console.log(`isAdvancedUpload: ${isAdvancedUpload}`);

    var $form = $('.box');

    if (isAdvancedUpload) {
        $form.addClass('has-advanced-upload');
    }

    var droppedFiles = false;

    $form.on('drag dragstart dragend dragover dragenter dragleave drop', function (e) {
        e.preventDefault();
        e.stopPropagation();
    }).on('dragover dragenter', function () {
        $form.addClass('is-dragover');
    }).on('dragleave dragend drop', function () {
        $form.removeClass('is-dragover');
    })

    var $input = $form.find('input[type="file"]'),
        $label = $form.find('label'),
        showFiles = function (files) {
            $label.text(files.length > 0 ? files[files.length - 1].name : "No file chosen");
        };
    var $image = $form.find('img[id="book-preview"]');

    if (isAdvancedUpload) {
        $form.on('drop', function (e) {
            droppedFiles = e.originalEvent.dataTransfer.files; // the files that were dropped
            showFiles(droppedFiles);
            if (droppedFiles.length > 0) {
                uploadFile = droppedFiles[droppedFiles.length - 1];
                if(!uploadFile.type.includes("image")) {
                    alert("Please upload an image");
                    uploadFile = null;
                    showFiles([]);
                    return;
                } else if(uploadFile.size > 25000000) {
                    alert("Image is too large");
                    uploadFile = null;
                    showFiles([]);
                    return;
                }
                var reader = new FileReader();
                reader.onload = (e) => {
                    $image.attr("src", e.target.result);
                }
                reader.readAsDataURL(uploadFile);
            } else {
                uploadFile = null;
            }
        });
    }
    $input.on('change', function (e) { // when drag & drop is NOT supported
        showFiles(e.target.files);
        if (e.target.files.length > 0) {
            uploadFile = e.target.files[e.target.files.length - 1];
            if(!uploadFile.type.includes("image")) {
                alert("Please upload an image");
                uploadFile = null;
                showFiles([]);
                return;
            } else if(uploadFile.size > 25000000) {
                alert("Image is too large");
                uploadFile = null;
                showFiles([]);
                return;
            }
            var reader = new FileReader();
            reader.onload = (e) => {
                $image.attr("src", e.target.result);
            }
            reader.readAsDataURL(uploadFile);
        } else {
            uploadFile = null;
        }
    });
}

function uploadImg() {
    var storage = firebase.storage();
    var user = firebase.auth().currentUser;
    // var selectedFile = document.getElementById("fileselect").files[0];
    var selectedFile = uploadFile;
    //  //console.log(selectedFile);
    const urlbase = "gs://biblioquery.appspot.com/";
    const url = `images/${user.uid}.jpg`;
    const uploadTask = storage.ref().child(url).put(selectedFile); //create a child directory called images, and place the file inside this directory
    uploadTask.on('state_changed', (snapshot) => {
        // Observe state change events such as progress, pause, and resume
    }, (error) => {
        // Handle unsuccessful uploads
        console.error(error);
    }, () => {
        // Do something once upload is complete
        let storage = firebase.storage();
        let gsReference = storage.refFromURL(urlbase + url);
        gsReference.getDownloadURL().then((download_url) => {
            let db = firebase.firestore();
            var userRef = db.collection("user-info").doc(user.uid);
            userRef.update({
                photoURL: download_url
            }).then(() => {
                document.getElementById('userimg').src = document.getElementById('book-preview').src;
                onSaveConfirm();
            }).catch((error) => {
                console.error(error);
            });
        }).catch((error) => {
            console.error(error);
        });
    });
}

function saveProfile() {
    if (confirm("Save changes?")) {
        if (uploadFile != null)
            uploadImg();
        else onSaveConfirm();
        return true;
    } else {
        return false;
    }
}

function onSaveConfirm() {
    let db = firebase.firestore();
    let user = firebase.auth().currentUser;
    document.getElementById('editprofile').hidden = false;
    document.getElementById('saveprofile').hidden = true;
    document.getElementById('cancelprofile').hidden = true;
    document.getElementById('removePFP').hidden = true;
    document.getElementById('userimg').hidden = false;
    document.getElementById('image').style.display = "none";
    var docRef = db.collection('user-info').doc(user.uid)
    var object = {};
    Array.from(document.getElementById('profileform').getElementsByTagName('input')).forEach(element => {
        var field = element.id.substring(5, element.id.length);
        if (element.value != "") {
            object[field] = element.value;
            if (field == "nickname") object["name"] = element.value;
        } else if (field == "nickname") {
            object[field] = firebase.firestore.FieldValue.delete();
            object["name"] = user.displayName;
        }
        element.hidden = true;
    });
    //  //console.log(object);
    var element = document.getElementById('inputbio');
    if (element.value != "") {
        var field = element.id.substring(5, element.id.length);
        object[field] = element.value;
    }
    element.hidden = true;
    docRef.update(object).then(function () {
        alert("Profile saved successfully");
    });
    getUser(false);
}

function cancelProfile() {
    if (confirm("Are you sure you want to cancel these changes?")) {
        document.getElementById('editprofile').hidden = false;
        document.getElementById('saveprofile').hidden = true;
        document.getElementById('cancelprofile').hidden = true;
        document.getElementById('removePFP').hidden = true;
        document.getElementById('userimg').hidden = false;
        document.getElementById('image').style.display = "none";
        Array.from(document.getElementById('profileform').getElementsByTagName('input')).forEach(element => {
            element.hidden = true;
        });
        document.getElementById('inputbio').hidden = true;
        getUser(false);
    } else {
        return false;
    }
}

function editProfile() {
    document.getElementById('editprofile').hidden = true;
    document.getElementById('saveprofile').hidden = false;
    document.getElementById('cancelprofile').hidden = false;
    document.getElementById('removePFP').hidden = false;
    document.getElementById('userimg').hidden = true;
    document.getElementById('image').style.display = "block";
    Array.from(document.getElementById('profileform').getElementsByTagName('input')).forEach(function (element) {
        element.hidden = false;
        var field = element.id.substring(5);
        if (document.getElementById(field).textContent != "") {
            element.value = document.getElementById(field).textContent;
        }
    });
    Array.from(document.getElementsByClassName('profiledata')).forEach(function (element) {
        element.hidden = true;
    });
    document.getElementById('inputbio').hidden = false;
}

function removePFP() {
    var user = firebase.auth().currentUser;
    let db = firebase.firestore();
    var userRef = db.collection("user-info").doc(user.uid);
    userRef.update({
        photoURL: user.photoURL
    }).then(() => {
        document.getElementById('userimg').src = user.photoURL;
        alert("Profile Picture Removed Successfully");
    }).catch((error) => {
        console.error(error);
    });
}
