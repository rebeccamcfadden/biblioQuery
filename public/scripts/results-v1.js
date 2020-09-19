//results.html
function betaSearch() {
  const urlString = window.location.search;
  const urlParams = new URLSearchParams(urlString);
  var searchType = urlParams.get("search_type");
  var querystring = urlParams.get("query_string");
  var page = parseInt(urlParams.get("page"));
  var url;
  if (searchType == "author") {
      url = `https://api2.isbndb.com/authors/${encodeURIComponent(querystring.trim())}`;
      let request = new XMLHttpRequest();
      //  //console.log(url);
      document.getElementById('resultstitle').textContent = "Loading author results for " + querystring;
      request.open("GET", url);
      request.setRequestHeader("Content-Type", 'application/json');
      request.setRequestHeader("Authorization", '43940_f752a0ce9e17dad0f26891f083c9cd0b');
      request.onload = function () {
          document.onreadystatechange = showOrHideLoader();
          var data = JSON.parse(this.response);
          if (request.status >= 200 && request.status < 400) {
              document.getElementById('resultstitle').textContent = "Author results for " + querystring;
              document.getElementById('disclaimer').innerHTML = "Click a listing to be directed to a list of books by this author. Results from <a href='http://openlibrary.org'>OpenLibrary Database</a>";
              var numPages = Math.ceil(parseInt(data.authors.length) / 100);
              var resultVal = (page - 1) * 100;
              //  //console.log(numPages);
              makeNav(numPages, page);
              const container = document.getElementById('carddeck');
              if (data.num_found == 0) {
                  const col = document.createElement('div');
                  col.setAttribute('class', 'col mx-auto');
                  const row = document.createElement('div');
                  row.setAttribute('class', 'row');
                  const innercol = document.createElement('div');
                  innercol.setAttribute('class', 'col mx-auto');
                  const msg = document.createElement('h2');
                  msg.textContent = "No results found";
                  const card = document.createElement('div');
                  card.setAttribute('class', 'card result-card');
                  container.appendChild(col);
                  col.appendChild(card);
                  card.appendChild(row);
                  row.appendChild(innercol);
                  innercol.appendChild(msg);
              }
              data.authors.forEach(author => {
                  const col = document.createElement('div');
                  col.setAttribute('class', 'col');
                  const row = document.createElement('div');
                  row.setAttribute('class', 'row');
                  const innercol2 = document.createElement('div');
                  innercol2.setAttribute('class', 'col-md-9 text-left');
                  const card = document.createElement('div');
                  card.setAttribute('class', 'card result-card');
                  card.setAttribute('onclick', 'getAuthor("' + author + '");');
                  const h1 = document.createElement('h5');
                  h1.textContent = author;
                  container.appendChild(col);
                  col.appendChild(card);
                  // card.appendChild(img);
                  card.appendChild(row);
                  row.appendChild(innercol2);
                  innercol2.appendChild(h1);
                  resultVal += 1;
              });
              document.getElementById("carddeck").style.display = "block";
              document.getElementById("spinner").style.display = "none";
              //  //console.log("finished");
          } else {
              const errorMessage = document.createElement('marquee');
              errorMessage.textContent = 'Gah, its not working!';
              app.appendChild(errorMessage);
          }
      }
      request.send();
  } else {
      if (searchType == "title") {
          url = `https://openlibrary.org/search.json?title=${encodeURIComponent(querystring.trim())}&page=${page}`;
      } else if (searchType == "keywords") {
          url = `https://openlibrary.org/search.json?q=${encodeURIComponent(querystring.trim())}&page=${page}`;
      }
      let request = new XMLHttpRequest();
      //  //console.log(url);
      request.open("GET", url);
      document.getElementById('resultstitle').textContent = "Loading book results for " + querystring;
      request.onload = function () {
          document.onreadystatechange = showOrHideLoader();
          var data = JSON.parse(this.response);
          if (request.status >= 200 && request.status < 400) {
              // data.books.sort(function (a, b) {
              //     return compareStrings(a.title, b.title);
              // });
              document.getElementById('resultstitle').textContent = "Book results for " + querystring;
              document.getElementById('disclaimer').textContent = "Click a listing to be directed to a list of editions matching this title."
              //  //console.log(data);
              sessionStorage.setItem('result', this.response);
              var numPages = 0;
              var resultVal = (page - 1) * 100;
              //  //console.log(numPages);
              const container = document.getElementById('carddeck');
              if (data.num_found == 0) {
                  const col = document.createElement('div');
                  col.setAttribute('class', 'col mx-auto');
                  const row = document.createElement('div');
                  row.setAttribute('class', 'row');
                  const innercol = document.createElement('div');
                  innercol.setAttribute('class', 'col mx-auto');
                  const msg = document.createElement('h2');
                  msg.textContent = "No results found";
                  const card = document.createElement('div');
                  card.setAttribute('class', 'card result-card');
                  container.appendChild(col);
                  col.appendChild(card);
                  card.appendChild(row);
                  row.appendChild(innercol);
                  innercol.appendChild(msg);
              }
              data.docs.forEach(book => {
                  if (book.isbn && book.isbn.length > 0) {
                      uniq = [...new Set(book.isbn)];
                      let books_seen = [];
                      const card = document.createElement('div');
                      card.setAttribute('class', 'card result-card');
                      card.setAttribute('onclick', 'getEditions("' + resultVal + '");');
                      const p = document.createElement('p');
                      function setEditionCount() {
                          p.textContent = "Edition count: " + books_seen.length;
                          if (books_seen.length == 1) card.setAttribute('onclick', `loadBook("${books_seen[0]}");`);
                          else card.setAttribute('onclick', `getEditions("${card.getAttribute('data-resultVal')}");`);
                      }
                      uniq.forEach(function (isbn) {
                          let request = new XMLHttpRequest();
                          const url = "https://api2.isbndb.com/book/" + isbn;
                          request.open("GET", url);
                          request.setRequestHeader("Content-Type", 'application/json');
                          request.setRequestHeader("Authorization", '43940_f752a0ce9e17dad0f26891f083c9cd0b');
                          request.onload = function () {
                              document.onreadystatechange = showOrHideLoader();
                              if (request.status >= 200 && request.status < 400) {
                                  try {
                                      var data = JSON.parse(this.response);
                                  } catch (err) {
                                      console.error("couldn't parse JSON");
                                      return;
                                  }
                                  let book = data.book;
                                  if (books_seen.includes(book.isbn)) return;
                                  books_seen.push(book.isbn);
                              }
                              setEditionCount();
                          }
                          request.send();
                      });
                      //  //console.log(book);
                      ++numPages;
                      const col = document.createElement('div');
                      col.setAttribute('class', 'col');
                      const row = document.createElement('div');
                      row.setAttribute('class', 'row');
                      const innercol = document.createElement('div');
                      innercol.setAttribute('class', 'col-sm-3');
                      const innercol2 = document.createElement('div');
                      innercol2.setAttribute('class', 'col-md-9 text-left');
                      card.setAttribute('data-resultVal', resultVal);
                      const img = document.createElement('img');
                      img.setAttribute('class', 'result-img')
                      if (book.cover_edition_key != "") {
                          img.src = `https://covers.openlibrary.org/b/olid/${book.cover_edition_key}-M.jpg`
                      } else {
                          img.src = `https://covers.openlibrary.org/b/isbn/${book.isbn[0]}-M.jpg`
                      }
                      const h1 = document.createElement('h5');
                      h1.textContent = book.title;

                      const p1 = document.createElement('p');
                      p1.textContent = book.author_name;
                      container.appendChild(col);
                      col.appendChild(card);
                      // card.appendChild(img);
                      card.appendChild(row);
                      row.appendChild(innercol);
                      row.appendChild(innercol2);
                      innercol.appendChild(img);
                      innercol2.appendChild(h1);
                      innercol2.appendChild(p);
                      innercol2.appendChild(p1);
                      resultVal += 1;
                  }
              });
              document.getElementById("carddeck").style.display = "block";
              document.getElementById("spinner").style.display = "none";
              //  //console.log(`Number Found: ${data.num_found}`);
              //  //console.log(`Number Books Length: ${data.docs.length}`);
              //  //console.log(`Number Pages: ${numPages}`);
              var numPages = Math.ceil(numPages / 100);
              makeNav(numPages, page);
              //  //console.log("finished");
          } else {
              const errorMessage = document.createElement('marquee');
              errorMessage.textContent = 'Gah, its not working!';
              app.appendChild(errorMessage);
          }
      }
      request.send();
  }

}

function searchAuthor(authorname) {
  let request = new XMLHttpRequest();
  const url = "https://api2.isbndb.com/author/" + authorname;
  request.open("GET", url);
  request.setRequestHeader("Content-Type", 'application/json');
  request.setRequestHeader("Authorization", '43940_f752a0ce9e17dad0f26891f083c9cd0b');
  document.getElementById('resultstitle').textContent = "Loading results for " + authorname;
  request.onload = function () {
      document.onreadystatechange = showOrHideLoader();
      //  //console.log(this.response);
      const container = document.getElementById('carddeck');
      document.getElementById('resultstitle').textContent = "Book results for " + authorname;
      var fixstring = `${this.responseText}`;
      // fixstring = fixstring.replace("\"", "");
      fixstring = fixstring.replace(/(\r\n|\n|\r)/gm, "");
      var n = fixstring.search('"overview"');
      while (n != -1) {
          var m = fixstring.substring(n, fixstring.length).search('"title_long"');
          var remove = fixstring.substring(n, n + m - 1);
          fixstring = fixstring.replace(remove, "");
          //  //console.log(fixstring);
          n = fixstring.search('"overview"');
      }

      var data = JSON.parse(fixstring);
      if (request.status >= 200 && request.status < 400) {
          let books = data.books;
          if (books.length == 0) {
              const col = document.createElement('div');
              col.setAttribute('class', 'col mx-auto');
              const row = document.createElement('div');
              row.setAttribute('class', 'row');
              const innercol = document.createElement('div');
              innercol.setAttribute('class', 'col mx-auto');
              const msg = document.createElement('h2');
              msg.textContent = "No results found";
              const card = document.createElement('div');
              card.setAttribute('class', 'card result-card');
              container.appendChild(col);
              col.appendChild(card);
              card.appendChild(row);
              row.appendChild(innercol);
              innercol.appendChild(msg);
          }
          books.forEach(function (book) {
              const col = document.createElement('div');
              col.setAttribute('class', 'col');
              const row = document.createElement('div');
              row.setAttribute('class', 'row');
              const innercol = document.createElement('div');
              innercol.setAttribute('class', 'col-sm-3');
              const innercol2 = document.createElement('div');
              innercol2.setAttribute('class', 'col-md-9 text-left');
              const card = document.createElement('div');
              card.setAttribute('class', 'card result-card');
              card.setAttribute('onclick', 'loadBook("' + book.isbn + '");')
              const img = document.createElement('img');
              img.setAttribute('class', 'result-img')
              if (book.image != "") {
                  img.src = book.image;
              } else {
                  img.src = `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`
              }
              const h1 = document.createElement('h5');
              h1.textContent = book.title;
              const p = document.createElement('p');
              p.textContent = book.isbn;
              const p1 = document.createElement('p');
              p1.textContent = book.authors;
              const p2 = document.createElement('p');
              var description = book.synopsys;
              if (description != undefined) {
                  p2.textContent = htmlString(description, 300);
              }
              container.appendChild(col);
              col.appendChild(card);
              // card.appendChild(img);
              card.appendChild(row);
              row.appendChild(innercol);
              row.appendChild(innercol2);
              innercol.appendChild(img);
              innercol2.appendChild(h1);
              innercol2.appendChild(p);
              innercol2.appendChild(p1);
              innercol2.appendChild(p2);
          });
          document.getElementById("carddeck").style.display = "block";
          document.getElementById("spinner").style.display = "none";
      } else {
          const errorMessage = document.createElement('marquee');
          errorMessage.textContent = 'Gah, its not working!';
          app.appendChild(errorMessage);
      }
  }
  request.send();
}


function searchEditions() {
  const urlString = window.location.search;
  const urlParams = new URLSearchParams(urlString);
  var searchType = urlParams.get("search_type");
  var i = parseInt(urlParams.get("query_string"));
  var data = JSON.parse(sessionStorage.result);
  var book = data.docs[i];
  document.getElementById('resultstitle').textContent = "Loading book results";
  const container = document.getElementById('carddeck');
  uniq = [...new Set(book.isbn)];
  //  //console.log(uniq);
  if (uniq.length == 0) {
      const col = document.createElement('div');
      col.setAttribute('class', 'col mx-auto');
      const row = document.createElement('div');
      row.setAttribute('class', 'row');
      const innercol = document.createElement('div');
      innercol.setAttribute('class', 'col mx-auto');
      const msg = document.createElement('h2');
      msg.textContent = "No results found";
      const card = document.createElement('div');
      card.setAttribute('class', 'card result-card');
      container.appendChild(col);
      col.appendChild(card);
      card.appendChild(row);
      row.appendChild(innercol);
      innercol.appendChild(msg);
  } else {
      let books_seen = [];
      uniq.forEach(function (isbn) {
          let request = new XMLHttpRequest();
          const url = "https://api2.isbndb.com/book/" + isbn;
          request.open("GET", url);
          request.setRequestHeader("Content-Type", 'application/json');
          request.setRequestHeader("Authorization", '43940_f752a0ce9e17dad0f26891f083c9cd0b');
          request.onload = function () {
              //  //console.log(this.response);

              if (request.status >= 200 && request.status < 400) {
                  try {
                      var data = JSON.parse(this.response);
                  } catch (err) {
                      console.error("couldn't parse JSON");
                      return;
                  }
                  let book = data.book;
                  if (books_seen.includes(book.isbn)) return;
                  books_seen.push(book.isbn);
                  const col = document.createElement('div');
                  col.setAttribute('class', 'col');
                  const row = document.createElement('div');
                  row.setAttribute('class', 'row');
                  const innercol = document.createElement('div');
                  innercol.setAttribute('class', 'col-sm-3');
                  const innercol2 = document.createElement('div');
                  innercol2.setAttribute('class', 'col-md-9 text-left');
                  const card = document.createElement('div');
                  card.setAttribute('class', 'card result-card');
                  card.setAttribute('onclick', 'loadBook("' + book.isbn + '");')
                  const img = document.createElement('img');
                  img.setAttribute('class', 'result-img')
                  if (book.image != "") {
                      img.src = book.image;
                  } else {
                      img.src = `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`
                  }
                  const h1 = document.createElement('h5');
                  h1.textContent = book.title;
                  const p = document.createElement('p');
                  p.textContent = book.isbn;
                  const p1 = document.createElement('p');
                  p1.textContent = book.authors;
                  const p2 = document.createElement('p');
                  var description = book.synopsys;
                  if (description != undefined) {
                      p2.textContent = htmlString(description, 300);
                  }

                  container.appendChild(col);
                  col.appendChild(card);
                  // card.appendChild(img);
                  card.appendChild(row);
                  row.appendChild(innercol);
                  row.appendChild(innercol2);
                  innercol.appendChild(img);
                  innercol2.appendChild(h1);
                  innercol2.appendChild(p);
                  innercol2.appendChild(p1);
                  innercol2.appendChild(p2);
              } else {
                  const errorMessage = document.createElement('marquee');
                  errorMessage.textContent = 'Gah, its not working!';
                  app.appendChild(errorMessage);
              }
          }
          request.send();
      });
      document.onreadystatechange = showOrHideLoader();
  }
  document.getElementById("carddeck").style.display = "block";
  document.getElementById("spinner").style.display = "none";
  document.getElementById('resultstitle').textContent = "Book results";
}

function getEditions(i) {
  window.location.href = `results.html?search_type=editions&query_string=${i}&page=0`;
}
function getAuthor(author) {
  window.location.href = `results.html?search_type=getAuthor&query_string=${author}&page=0`;
}

function makeNav(numPages, page) {
  const urlString = window.location.search;
  const urlParams = new URLSearchParams(urlString);
  var searchType = urlParams.get("search_type");
  var querystring = urlParams.get("query_string");
  var page = parseInt(urlParams.get("page"));

  if (numPages == 1) {
      return;
  }
  const nav = document.getElementById("navigation");
  const nav2 = document.getElementById("navigation2");
  if (page > 1) {
      const li = document.createElement('li');
      li.setAttribute('class', 'page-item');
      const a = document.createElement('a');
      a.setAttribute('class', 'page-link');
      a.setAttribute('href', `results.html?query_string=${querystring.replace(" ", "+")}&page=${page - 1}&search_type=${searchType}`);
      a.textContent = "Previous";
      nav.appendChild(li);
      li.appendChild(a);
      const dup = li.cloneNode(true);
      nav2.appendChild(dup);
  }
  if (numPages > 5) {
      numPages = 5;
  }
  for (i = page; i < numPages; i++) {
      if (i == page + 4 || i == numPages - 1) {
          const li = document.createElement('li');
          li.setAttribute('class', 'page-item');
          const a = document.createElement('a');
          a.setAttribute('class', 'page-link');
          a.setAttribute('href', `results.html?query_string=${querystring}&page=${page + 1}&search_type=${searchType}`);
          a.textContent = "Next";
          nav.appendChild(li);
          li.appendChild(a);
          const dup = li.cloneNode(true);
          nav2.appendChild(dup);
      } else {
          const li = document.createElement('li');
          li.setAttribute('class', 'page-item');
          const a = document.createElement('a');
          a.setAttribute('class', 'page-link');
          a.setAttribute('href', `results.html?query_string=${querystring}&page=${i}&search_type=${searchType}`);
          a.textContent = i;
          nav.appendChild(li);
          li.appendChild(a);
          const dup = li.cloneNode(true);
          nav2.appendChild(dup);
      }
  }
}

function initSearch() {
  const urlString = window.location.search;
  const urlParams = new URLSearchParams(urlString);
  var searchType = urlParams.get("search_type");
  var querystring = urlParams.get("query_string");
  var page = parseInt(urlParams.get("page"));
  if (searchType == "editions") {
      searchEditions();
  }
  if (searchType == "getAuthor") {
      searchAuthor(querystring);
  }
  else if (searchType == "isbn" && querystring != "") {
      window.location.href = "book.html?isbn=" + querystring;
  }
  else {
      if (searchType == "classname") {
          let db = firebase.firestore();
          var _class = querystring.trim();
          var className = _class.substring(0, _class.search(/\W/i)).toUpperCase();
          var classNumber = parseInt(_class.substring(_class.search(/\d/)));
          document.getElementById('resultstitle').textContent = "Loading book results for " + querystring;
          document.getElementById('disclaimer').textContent = "Results reflect user-reported data.";
          db.collection('book-listings')
              .where('class_name', '==', className)
              .where('class_num', '==', classNumber)
              .get()
              .then(function (querySnapshot) {
                  var numPages = Math.ceil(parseInt(querySnapshot.length) / 100);
                  makeNav(numPages, page);
                  const container = document.getElementById('carddeck');
                  let array = [];
                  querySnapshot.forEach(function (doc) {
                      array.push(doc.data().isbn);
                  });
                  document.getElementById('resultstitle').textContent = "Book results for " + querystring;
                  uniq = [...new Set(array)];
                  if (uniq.length == 0) {
                      const col = document.createElement('div');
                      col.setAttribute('class', 'col mx-auto');
                      const row = document.createElement('div');
                      row.setAttribute('class', 'row');
                      const innercol = document.createElement('div');
                      innercol.setAttribute('class', 'col mx-auto');
                      const msg = document.createElement('h2');
                      msg.textContent = "No results found";
                      const card = document.createElement('div');
                      card.setAttribute('class', 'card result-card');
                      container.appendChild(col);
                      col.appendChild(card);
                      card.appendChild(row);
                      row.appendChild(innercol);
                      innercol.appendChild(msg);
                  }
                  uniq.forEach(isbn => {
                      let request = new XMLHttpRequest();
                      const url = "https://api2.isbndb.com/book/" + isbn;
                      request.open("GET", url);
                      request.setRequestHeader("Content-Type", 'application/json');
                      request.setRequestHeader("Authorization", '43940_f752a0ce9e17dad0f26891f083c9cd0b');
                      request.onload = function () {
                          var data = JSON.parse(this.response);
                          if (request.status >= 200 && request.status < 400) {
                              let book = data.book;
                              const col = document.createElement('div');
                              col.setAttribute('class', 'col');
                              const row = document.createElement('div');
                              row.setAttribute('class', 'row');
                              const innercol = document.createElement('div');
                              innercol.setAttribute('class', 'col-sm-3');
                              const innercol2 = document.createElement('div');
                              innercol2.setAttribute('class', 'col-md-9 text-left');
                              const card = document.createElement('div');
                              card.setAttribute('class', 'card result-card');
                              card.setAttribute('onclick', 'loadBook("' + book.isbn + '");')
                              const img = document.createElement('img');
                              img.setAttribute('class', 'result-img')
                              if (book.image != "") {
                                  img.src = book.image;
                              } else {
                                  img.src = `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`
                              }
                              const h1 = document.createElement('h5');
                              h1.textContent = book.title;
                              const p = document.createElement('p');
                              p.textContent = book.isbn;
                              const p1 = document.createElement('p');
                              p1.textContent = book.authors;
                              const p2 = document.createElement('p');
                              var description = book.synopsys;
                              if (description != undefined) {
                                  p2.textContent = htmlString(description, 300);
                              }

                              container.appendChild(col);
                              col.appendChild(card);
                              // card.appendChild(img);
                              card.appendChild(row);
                              row.appendChild(innercol);
                              row.appendChild(innercol2);
                              innercol.appendChild(img);
                              innercol2.appendChild(h1);
                              innercol2.appendChild(p);
                              innercol2.appendChild(p1);
                              innercol2.appendChild(p2);
                          } else {
                              const errorMessage = document.createElement('marquee');
                              errorMessage.textContent = 'Gah, its not working!';
                              app.appendChild(errorMessage);
                          }
                      }
                      request.send();
                  });
                  document.onreadystatechange = showOrHideLoader();
                  document.getElementById("carddeck").style.display = "block";
                  document.getElementById("spinner").style.display = "none";
              })
              .catch(function (error) {
                  console.error("Error getting documents: ", error);
              });
          //TODO database query here
      } else if (searchType == "seller") {
          document.getElementById('resultstitle').textContent = "Loading user results for " + querystring;
          var seller = querystring.trim();
          //  //console.log(seller);
          const url = 'https://us-central1-biblioquery.cloudfunctions.net/getUsers';
          const urlParams = `?search=${seller}`;
          let request = new XMLHttpRequest();
          request.open("GET", url + urlParams);
          request.onload = function () {
              if (request.status >= 200 && request.status < 400) {
                  var data = JSON.parse(this.response);
                  let results = data.data;
                  let numPages = Math.ceil(parseInt(results.length) / 100);
                  const container = document.getElementById('carddeck');
                  makeNav(numPages, page);
                  if (results.length == 0) {
                      const col = document.createElement('div');
                      col.setAttribute('class', 'col mx-auto');
                      const row = document.createElement('div');
                      row.setAttribute('class', 'row');
                      const innercol = document.createElement('div');
                      innercol.setAttribute('class', 'col mx-auto');
                      const msg = document.createElement('h2');
                      msg.textContent = "No results found";
                      const card = document.createElement('div');
                      card.setAttribute('class', 'card result-card');
                      container.appendChild(col);
                      col.appendChild(card);
                      card.appendChild(row);
                      row.appendChild(innercol);
                      innercol.appendChild(msg);
                  }
                  results.forEach((record) => {
                      let user = record.user;
                      const col = document.createElement('div');
                      col.setAttribute('class', 'col');
                      const row = document.createElement('div');
                      row.setAttribute('class', 'row');
                      const innercol = document.createElement('div');
                      innercol.setAttribute('class', 'col-sm-3');
                      innercol.setAttribute('align', 'center');
                      const innercol2 = document.createElement('div');
                      innercol2.setAttribute('class', 'col-md-9 text-left');
                      const card = document.createElement('div');
                      card.setAttribute('class', 'card result-card');
                      card.setAttribute('onclick', `window.location.href = "profile.html?user=${user.uid}";`)
                      const img = document.createElement('img');
                      img.setAttribute('class', 'result-img');
                      img.setAttribute('style', 'height: 125px; width: 125px; object-fit: cover;');

                      if (user.photoURL != "") {
                          img.src = user.photoURL;
                      } else {
                          img.src = `https://p7.hiclipart.com/preview/981/645/182/united-states-computer-icons-desktop-wallpaper-clip-art-free-high-quality-person-icon.jpg`
                      }
                      const h1 = document.createElement('h5');
                      h1.textContent = user.name;
                      var rating = user.userrating;
                      if (rating != undefined) {
                          var rating_row = document.createElement('div');
                          rating_row.setAttribute('class', 'row');
                          const userrating = document.createElement('div');
                          userrating.setAttribute('class', 'col-md-8');
                          userrating.setAttribute('id', 'userrating');
                          userrating.setAttribute('style', 'position: absolute; margin-left: auto; margin-right: auto; left: 0; right: 0;');
                          for (s = 0; s < 5; s++) {
                              const star = document.createElement('i');
                              if (s < rating) {
                                  star.setAttribute('class', 'fa fa-star star-gold');
                              } else {
                                  star.setAttribute('class', 'fa fa-star');
                              }
                              userrating.appendChild(star);
                          }
                          rating_row.appendChild(userrating);
                      }
                      const p = document.createElement('p');
                      if (user.location != undefined)
                          p.textContent = user.location;
                      const p1 = document.createElement('p');
                      let major = user.major;
                      let year = user.year;
                      if (major != undefined && year != undefined)
                          p1.textContent = `${major} | ${year}`;
                      else if (major != undefined)
                          p1.textContent = major;
                      else if (year != undefined)
                          p1.textContent = year;
                      const p2 = document.createElement('p');
                      var description = user.bio;
                      if (description != undefined) {
                          p2.textContent = htmlString(description, 300);
                      }

                      container.appendChild(col);
                      col.appendChild(card);
                      // card.appendChild(img);
                      card.appendChild(row);
                      row.appendChild(innercol);
                      row.appendChild(innercol2);
                      innercol.appendChild(img);
                      innercol2.appendChild(h1);
                      if (rating != undefined)
                          innercol.appendChild(rating_row);
                      innercol2.appendChild(p);
                      innercol2.appendChild(p1);
                      innercol2.appendChild(p2);
                  });
                  document.onreadystatechange = showOrHideLoader();
                  document.getElementById('resultstitle').textContent = "User results for " + querystring;
                  document.getElementById('disclaimer').textContent = "Click a user to be directed to their page."
              }
          }
          request.send();
      } else {
          betaSearch(urlParams);
      }
  }
  document.getElementById("carddeck").style.display = "block";
  document.getElementById("spinner").style.display = "none";
}