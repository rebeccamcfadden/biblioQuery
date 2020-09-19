// book.html

$(function () {
  $('[data-toggle="popover-hover"]').popover({
      container: 'body',
      html: true,
      trigger: 'hover',
      placement: 'bottom',
      content: function () { return '<img src="' + $(this).data('img') + '" />'; }
  });
});

$(function () {
  $("#bookimg").click(function () {
      $("#previewModal").modal();
      initialize();
      getAltPreview();
  });
});
// initialize google book viewer
function initialize() {
  const urlString = window.location.search;
  const urlParams = new URLSearchParams(urlString);
  var isbn = urlParams.get("isbn");
  var viewer = new google.books.DefaultViewer(document.getElementById('viewerCanvas'));
  viewer.load(`ISBN:${isbn}`, alertNotFound, removePreviewFooter);
}
function alertNotFound() {
  // alert("could not find the book!");
  //   console.log("book not found");
  document.getElementById('errormsg').textContent = "Book not found";
  document.getElementById('altViewer').style.display = "block";
}

function removePreviewFooter() {
  $('#viewerCanvas > div > div:nth-child(2)').css('display', 'none');
}
function getAltPreview() {
  const urlString = window.location.search;
  const urlParams = new URLSearchParams(urlString);
  var isbn = urlParams.get("isbn");
  const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json`;
  let request = new XMLHttpRequest();
  request.open("GET", url);
  request.onload = function () {
      //  //console.log(this.response);
      var data = JSON.parse(this.response);
      if (request.status >= 200 && request.status < 400) {
          if (data[`ISBN:${isbn}`]) {
              const link = document.createElement('a');
              link.href = data[`ISBN:${isbn}`].preview_url;
              link.textContent = data[`ISBN:${isbn}`].preview_url;
              document.getElementById('altViewer').appendChild(link);
          }
      } else {
          const errorMessage = document.createElement('marquee');
          errorMessage.textContent = 'Gah, its not working!';
          app.appendChild(errorMessage);
      }
  }
  request.send();
}
//book.html
function getBook() {
  const urlString = window.location.search;
  const urlParams = new URLSearchParams(urlString);
  var isbn = urlParams.get("isbn");
  const url = "https://api2.isbndb.com/book/" + isbn;
  //  //console.log(url);
  let request = new XMLHttpRequest();
  request.open("GET", url);
  request.setRequestHeader("Content-Type", 'application/json');
  request.setRequestHeader("Authorization", '43940_f752a0ce9e17dad0f26891f083c9cd0b');
  request.onload = function () {
      //  //console.log("Get BiblioQuerySellers Called Below");
      getBiblioQuerySellers(isbn);
      var data = JSON.parse(this.response);
      if (request.status >= 200 && request.status < 400) {
          document.getElementById("title").textContent = data.book.title;
          title = data.book.title + " - biblioQuery";
          if(document.title.indexOf('(') >= 0){
              document.title = document.title + " " + title;
          } else document.title = title;
          if (data.book.image != "") {
              document.getElementById("bookimg").src = data.book.image;
          } else {
              document.getElementById("bookimg").src = `http://covers.openlibrary.org/b/isbn/${data.book.isbn}-L.jpg`
          }
          document.getElementById("author").textContent = data.book.authors;
          document.getElementById("publisher").textContent = data.book.publisher;
          document.getElementById("pubDate").textContent = "Publication Date: " + (data.book.date_published);
          document.getElementById("edition").textContent = "Edition: " + (data.book.edition);
          document.getElementById("isbn").textContent = "ISBN: " + (isbn);
          if (data.book.synopsys != undefined) {
              document.getElementById("description").innerHTML = (data.book.synopsys);
          }
      } else {
          const errorMessage = document.createElement('marquee');
          errorMessage.textContent = 'Gah, its not working!';
          app.appendChild(errorMessage);
      }
  }
  request.send();
}

function getCondition(quality) {
  switch (quality) {
      case 1:
          return "Poor";
      case 2:
          return "Fair";
      case 3:
          return "Good";
      case 4:
          return "Excellent/Like new";
      case 5:
          return "New";
      default:
          return "Unknown";
  }
}
function contactUser(uid, listingid, display_name, title, isbn, price) {
  $("#contactModal").modal();
  // if(user.phoneContact == true){
  let db = firebase.firestore();
  // }
  document.getElementById('selleruid').value = uid;
  document.getElementById('listing').value = listingid;
  document.getElementById('salename').textContent = display_name;
  document.getElementById('saletitle').textContent = title;
  document.getElementById('saleisbn').textContent = `ISBN: ${isbn}`;
  document.getElementById('saleprice').textContent = price;
  document.getElementById('salecontact').value = firebase.auth().currentUser.email;
  document.getElementById('salesign').value = firebase.auth().currentUser.displayName;
}

function getBiblioQuerySellers(isbn) {
  //  //console.log(`ISBN: ${isbn}`);

  let db = firebase.firestore();
  db.collection('book-listings').where("isbn10", "==", isbn).get()
      .then(function (querySnapshot) {
          querySnapshot.forEach(function (doc) {
              let data = doc.data();
              var row = document.createElement('tr');
              var sellholder = document.createElement('td');
              var starholder = document.createElement('td');
              var sell = document.createElement('a');
              var link = document.createElement('a');
              var stars = [];
              sell.textContent = "Fetching Seller";
              db.collection('user-info')
                  .doc(data.seller)
                  .get()
                  .then(function (udoc) {
                      sell.textContent = udoc.data().display_name;
                      if (udoc.data().userrating) {
                          var i = 0;
                          while (i < udoc.data().userrating) {
                              var star = document.createElement('i');
                              star.setAttribute('class', "fa fa-star star-gold");
                              starholder.appendChild(star);
                              i++;
                          }
                          while (i < 5) {
                              var star = document.createElement('i');
                              star.setAttribute('class', "fa fa-star");
                              starholder.appendChild(star);
                              i++;
                          }
                      } else {
                          starholder.textContent = "n/a";
                      }
                      let user = firebase.auth().currentUser;
                      if (user.uid == data.seller) {
                          link.textContent = "Remove Listing";
                          link.onclick = () => {
                              doc.ref.delete()
                                  .then(() => {
                                      link.textContent = "Listing Removed Successfully";
                                      if (data.url != null) {
                                          var book_url = `gs://biblioquery.appspot.com/images/${data.seller}/${data.isbn}.jpg`;
                                          let storage = firebase.storage();
                                          let gsReference = storage.refFromURL(book_url);
                                          gsReference.delete()
                                              .catch((error) => {
                                                  alert('Image failed to delete.');
                                                  console.error(error);
                                              });
                                          link.removeAttribute('onclick');
                                          link.removeAttribute('href');
                                      }
                                  })
                                  .catch((error) => {
                                      link.textContent = "There was an error removing the listing";
                                      console.error(error);
                                  });
                          }
                          link.href = "#";
                      } else {
                          link.textContent = "Contact User";
                          // link.href = `profile.html?user=${userinfo.uid}`;
                          link.setAttribute('type', 'button');
                          link.setAttribute('class', 'btn btn-aggie');
                          link.setAttribute('onclick', `contactUser("${udoc.data().uid}", "${doc.id}", "${udoc.data().display_name}", "${data.title}", "${data.isbn}", ${data.price});`);
                      }
                  })
                  .catch(function (error) {
                      console.error('Seller ' + data.seller + ' could not be fetched! ' + error);
                  });
              sell.setAttribute('class', 'btn');
              sell.setAttribute('role', 'button');
              sell.setAttribute('href', `profile.html?user=${data.seller}`)
              var cond = document.createElement('td');
              cond.textContent = getCondition(data.quality);
              var linkholder = document.createElement('td');
              var imageholder = document.createElement('td');
              var img = document.createElement('a');
              if (data.url != null) {
                  img.textContent = "Hover to Preview Image";
                  img.setAttribute('class', 'btn');
                  img.setAttribute('role', 'button');
                  img.setAttribute('data-toggle', 'popover-hover');
                  img.setAttribute('data-img', data.url);
              } else {
                  img.textContent = "No Preview Available";
                  img.setAttribute('class', 'btn');
                  img.setAttribute('role', 'button');
                  img.setAttribute('data-toggle', 'popover-hover');
                  img.setAttribute('data-img', 'https://i.stack.imgur.com/Q3vyk.png');
              }
              var price = document.createElement('td');
              price.textContent = data.price;
              document.getElementById('pricetable').appendChild(row);
              sellholder.appendChild(sell);
              row.appendChild(sellholder);
              row.appendChild(starholder);
              row.appendChild(cond);
              row.appendChild(imageholder);
              imageholder.appendChild(img);
              row.appendChild(price);
              row.appendChild(linkholder);
              linkholder.appendChild(link);
          });
          getPrices(isbn);
      });
}

function sendContactMessage() {
  const url = 'https://us-central1-biblioquery.cloudfunctions.net/sendMail';
  const seller = document.getElementById('selleruid').value;
  let myuid = firebase.auth().currentUser.uid;
  const listingid = document.getElementById('listing').value;
  const extra = document.getElementById('saleextra').value;
  const urlParams = `?selleruid=${seller}&listingid=${listingid}&contactuid=${myuid}&extra='${extra}'`
  let request = new XMLHttpRequest();
  request.open("GET", url + urlParams);
  request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
          alert('message sent');
      } else {
          alert('message failed');
      }
      window.location.href = window.location.href;
  }
  request.send();
}
// function closeContact() {
//     document.getElementById("contactModal").style.display = "none";
// }0669417521
function getEvenMorePrices(isbn){
    const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json`;
    let request = new XMLHttpRequest();
    request.open("GET", url);
    request.onload = function () {
        var data = JSON.parse(this.response);
        //  //console.log(data);
        if (request.status >= 200 && request.status < 400) {
            if (data[`ISBN:${isbn}`]) {
                var row = document.createElement('tr');
                var sell = document.createElement('td');
                sell.textContent = "OpenLibrary PDF/Preview";
                var starholder = document.createElement('td');
                starholder.textContent = "n/a";
                var cond = document.createElement('td');
                cond.textContent = "PDF/Online";
                var linkholder = document.createElement('td');
                var link = document.createElement('a');
                link.textContent = "Link";
                link.href = data[`ISBN:${isbn}`].preview_url;
                var imageholder = document.createElement('td');
                var img = document.createElement('a');
                img.textContent = "No Preview Available";
                img.setAttribute('class', 'btn');
                img.setAttribute('role', 'button');
                img.setAttribute('data-toggle', 'popover-hover');
                img.setAttribute('data-img', 'https://i.stack.imgur.com/Q3vyk.png'); // TODO add image finding for results that return photos
                var price = document.createElement('td');
                price.textContent = "0.00";
                document.getElementById('pricetable').appendChild(row);
                row.appendChild(sell);
                row.appendChild(starholder);
                row.appendChild(cond);
                row.appendChild(imageholder);
                imageholder.appendChild(img);
                row.appendChild(price);
                row.appendChild(linkholder);
                linkholder.append(link);
            }
        } else {
            const errorMessage = document.createElement('marquee');
            errorMessage.textContent = 'Gah, its not working!';
            app.appendChild(errorMessage);
        }
        getMorePrices(isbn);
    }
    request.send();
}

function getMorePrices(isbn) {
  //  //console.log("getting more prices");
  const url = 'https://us-central1-biblioquery.cloudfunctions.net/getPriceData';
  const urlParams = `?isbn=${isbn}`;
  let request = new XMLHttpRequest();
  request.open("GET", url + urlParams);
  request.onload = function () {
      document.onreadystatechange = showOrHideLoader();
      if (request.status >= 200 && request.status < 400) {
          var data = JSON.parse(this.response);
          //  //console.log(data);
          var sellers = data.data;
          sellers.forEach(listing => {
              var row = document.createElement('tr');
              var sell = document.createElement('td');
              if (!listing.seller || listing.seller == undefined) return;
              sell.textContent = listing.seller;
              var starholder = document.createElement('td');
              starholder.textContent = "n/a";
              var cond = document.createElement('td');
              cond.textContent = listing.condition;
              var linkholder = document.createElement('td');
              var link = document.createElement('a');
              link.textContent = "Link";
              link.href = listing.link;
              var imageholder = document.createElement('td');
              var img = document.createElement('a');
              if (listing.image) {
                  img.textContent = "Preview";
                  img.setAttribute('class', 'btn');
                  img.setAttribute('role', 'button');
                  img.setAttribute('data-toggle', 'popover-hover');
                  img.setAttribute('data-img', listing.image);
              } else {
                  img.textContent = "No Preview Available";
                  img.setAttribute('class', 'btn');
                  img.setAttribute('role', 'button');
                  img.setAttribute('data-toggle', 'popover-hover');
                  img.setAttribute('data-img', 'https://i.stack.imgur.com/Q3vyk.png');
              }
              // TODO add image finding for results that return photos
              var price = document.createElement('td');
              price.textContent = listing.price;
              document.getElementById('pricetable').appendChild(row);
              row.appendChild(sell);
              row.appendChild(starholder);
              row.appendChild(cond);
              row.appendChild(imageholder);
              imageholder.appendChild(img);
              row.appendChild(price);
              row.appendChild(linkholder);
              linkholder.append(link);
          });
          $(document).ready(function () {
              $('#dtBasicExample').DataTable({
                  "paging": false,
                  "info": false,
                  "searching": false
              });
              $('.dataTables_length').addClass('bs-select');
          });
          $(function () {
              $('[data-toggle="popover-hover"]').popover({
                  html: true,
                  trigger: 'hover',
                  placement: 'bottom',
                  content: function () { return '<img src="' + $(this).data('img') + '" />'; }
                  , container: 'body'
              });
          });
      } else {
          alert('message failed');
      }
  }
  request.send();
}


function getPrices(isbn) {
  "use strict";
  //  //console.log("getting Prices");
  const url = `https://cors-anywhere.herokuapp.com/https://booksrun.com/api/v3/price/buy/${isbn}?key=uwllq00qr2f2a6vqs4r3`;
  let request = new XMLHttpRequest();
  request.open("GET", url);
  request.setRequestHeader("Content-Type", 'application/json');
  request.onload = function () {
    //   document.onreadystatechange = showOrHideLoader();
      var data = JSON.parse(this.response);
      //  //console.log(data);
      if (request.status >= 200 && request.status < 400) {
          var sellers = Object.keys(data.result.offers);
          sellers.forEach(seller => {
              var conditions = ['new', 'used'];
              conditions.forEach(condition => {
                  var listing = data.result.offers[seller][condition];
                  if (listing == "none" || !listing) { return; }
                  var row = document.createElement('tr');
                  var sell = document.createElement('td');
                  sell.textContent = seller;
                  var starholder = document.createElement('td');
                  starholder.textContent = "n/a";
                  var cond = document.createElement('td');
                  cond.textContent = condition;
                  var linkholder = document.createElement('td');
                  var link = document.createElement('a');
                  link.textContent = "Link";
                  link.href = listing.cart_url;
                  var imageholder = document.createElement('td');
                  var img = document.createElement('a');
                  img.textContent = "No Preview Available";
                  img.setAttribute('class', 'btn');
                  img.setAttribute('role', 'button');
                  img.setAttribute('data-toggle', 'popover-hover');
                  img.setAttribute('data-img', 'https://i.stack.imgur.com/Q3vyk.png'); // TODO add image finding for results that return photos
                  var price = document.createElement('td');
                  price.textContent = listing.price;
                  document.getElementById('pricetable').appendChild(row);
                  row.appendChild(sell);
                  row.appendChild(starholder);
                  row.appendChild(cond);
                  row.appendChild(imageholder);
                  imageholder.appendChild(img);
                  row.appendChild(price);
                  row.appendChild(linkholder);
                  linkholder.append(link);
              })
          });
          getEvenMorePrices(isbn);
      } else {
          const errorMessage = document.createElement('marquee');
          errorMessage.textContent = 'Gah, its not working!';
          app.appendChild(errorMessage);
      }
  }
  request.send();
}