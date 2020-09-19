var uploadFile = null;

function setupDragAndDrop() {
    // Global variable from self-calling function
    var isAdvancedUpload = function () {
        var div = document.createElement('div');
        return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
    }();

     //console.log(`isAdvancedUpload: ${isAdvancedUpload}`);

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
    var user = firebase.auth().currentUser.uid;
    // var selectedFile = document.getElementById("fileselect").files[0];
    var selectedFile = uploadFile;
     //console.log(selectedFile);
    var isbn = document.getElementById("isbn").value.replace("-", '');
    const uploadTask = storage.ref().child('images/' + user + '/' + isbn + '.jpg').put(selectedFile); //create a child directory called images, and place the file inside this directory
    uploadTask.on('state_changed', (snapshot) => {
        // Observe state change events such as progress, pause, and resume
    }, (error) => {
        // Handle unsuccessful uploads
          console.log(error);
    }, () => {
        // Do something once upload is complete
         //console.log('success');
        // alert("Upload Complete");
        doPost();
    });
}

function autofill() {
    var isbn = document.getElementById("isbn").value;
    if (isbn == "" || !isValidIsbn(isbn)) {
        alert("You must enter a valid ISBN number to autofill.");
        return false;
    }
    let request = new XMLHttpRequest();
    const url = "https://api2.isbndb.com/book/" + isbn;
    request.open("GET", url);
    request.setRequestHeader("Content-Type", 'application/json');
    request.setRequestHeader("Authorization", '43940_f752a0ce9e17dad0f26891f083c9cd0b');
    request.onload = function () {
        let response = this.response.replace(/\r?\n|\r/g, '');
        var data;
        try {
            data = JSON.parse(response);
        } catch (error) {
            alert("An error occured, please try another ISBN.");
        }
        if (request.status >= 200 && request.status < 400) {
            var booktitle = data.book.title
            let bookauthors = data.book.authors
             //console.log(title + ", " + bookauthors);
            document.getElementById("title").value = booktitle;
            document.getElementById("author").value = bookauthors;
        } else {
            const errorMessage = document.createElement('marquee');
            errorMessage.textContent = 'Gah, its not working!';
            app.appendChild(errorMessage);
        }
    }
    request.send();
}

function postBook() {
    event.preventDefault();
     //console.log("Post Button Pressed");
     //console.log(uploadFile);
    if (uploadFile != null) {
         //console.log(uploadFile);
        uploadImg();
        return false;
    }
    doPost();
    return false;
}

function doPost() {
    let db = firebase.firestore();
    var true_isbn = document.getElementById('isbn').value;
    var isbn = true_isbn.replace("-", '');
    var title = document.getElementById('title').value;
    var authors = document.getElementById('author').value.split(";");
    // Remove a period from the end of the author's name.
    authors.map(str => { if (str[str.length - 1] == '.') str = str.substring(0, str.length - 1); return str; });
    authors.map(str => str.trim());
    var _class = document.getElementById('class').value.trim();
    var className = _class.substring(0, _class.search(/\W/i)).toUpperCase();
    var classNumber = parseInt(_class.substring(_class.search(/\d/)));
    var radios = document.getElementsByName('gridRadios');
    var quality;
    for (let i = 0, length = radios.length; i < length; ++i) if (radios[i].checked) {
        quality = length - i;
        break;
    }
    var price = document.getElementById('price').value;
    var uuid = firebase.auth().currentUser.uid;
    var book_url = `gs://biblioquery.appspot.com/images/${uuid}/${isbn}.jpg`;
    const url = "https://api2.isbndb.com/book/" + isbn;
    let request = new XMLHttpRequest();
    request.open("GET", url);
    request.setRequestHeader("Content-Type", 'application/json');
    request.setRequestHeader("Authorization", '43940_f752a0ce9e17dad0f26891f083c9cd0b');
    let storage = firebase.storage();
    let gsReference = storage.refFromURL(book_url);
    gsReference.getDownloadURL().then(function (download_url) {
        request.onload = function () {
            let response = this.response.replace(/\r?\n|\r/g, '');
            var data;
            try {
                data = JSON.parse(response);
            } catch (error) {
                alert("An error occured, please try another ISBN.");
                return -1;
            }
            if (request.status >= 200 && request.status < 400) {
                db.collection("book-listings").add({
                    isbn10: data.book.isbn,
                    isbn: isbn,
                    title: title,
                    authors: authors,
                    class_name: className,
                    class_num: classNumber,
                    quality: quality,
                    price: price,
                    url: download_url,
                    seller: uuid
                }).then(function (docRef) {
                     //console.log("Document written with ID: ", docRef.id);
                    // alert("form submitted")
                    window.location.href = `book.html?isbn=${data.book.isbn}`;
                }).catch(function (error) {
                    console.error("Error adding document: ", error);
                    alert("form failed");
                    window.location.href = "posting.html";
                });
            } else {
                alert("Looks like that failed. Try another ISBN for the same book if there's another or try again later.");
            }
        };
        request.send();
    }).catch(function (error) {
        request.onload = function () {
            let response = this.response.replace(/\r?\n|\r/g, '');
            var data;
            try {
                data = JSON.parse(response);
            } catch (error) {
                alert("An error occured, please try another ISBN.");
                return -1;
            }
            if (request.status >= 200 && request.status < 400) {
                db.collection("book-listings").add({
                    isbn10: data.book.isbn,
                    isbn: isbn,
                    title: title,
                    authors: authors,
                    class_name: className,
                    class_num: classNumber,
                    quality: quality,
                    price: price,
                    url: null,
                    seller: uuid
                }).then(function (docRef) {
                      console.log("Document written with ID: ", docRef.id);
                    // alert("form submitted")
                    window.location.href = `book.html?isbn=${data.book.isbn}`;
                }).catch(function (error) {
                    console.error("Error adding document: ", error);
                    alert("form failed");
                    window.location.href = "posting.html";
                });
            } else {
                alert("Looks like that failed. Try another ISBN for the same book if there's another or try again later.");
            }
        };
        request.send();
    });
}