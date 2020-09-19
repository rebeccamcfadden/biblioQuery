

function reset_searchbar() {
  recognizing = false;
  document.getElementById('main-searchbar').value = "";
};
function dictate_searchbar() {
  var mic_src = document.getElementById("mic");
  var recognition = new webkitSpeechRecognition();

  if (mic_src.src.indexOf("images/mic.png") != -1) {
      mic_src.src = "images/record_icon.png";

      $("#mic").addClass("record_icon");

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      reset_searchbar();

      recognition.start();

      recognition.onresult = function (e) {
          for (var i = e.resultIndex; i < e.results.length; ++i) {
              if (e.results[i].isFinal) {
                  document.getElementById('main-searchbar').value += e.results[i][0].transcript;
              }
          }
      };

      recognition.onsoundend() = function (e) {
          recognition.stop();
          reset_searchbar();
      };
  }
  else {
      mic_src.src = "images/mic.png";

      $("#mic").removeClass("record_icon");

      recognition.start();
      recognition.stop();
  }
};

function reset_ISBN() {
  recognizing = false;
  document.getElementById('isbn').value = "";
};
function dictate_ISBN() {
  var mic_src = document.getElementById("mic_ISBN");
  var recognition = new webkitSpeechRecognition();

  if (mic_src.src.indexOf("images/mic.png") != -1) {
      mic_src.src = "images/record_icon.png";

      $("#mic_ISBN").addClass("record_icon_ISBN");

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      reset_ISBN();

      recognition.start();

      recognition.onresult = function (e) {
          for (var i = e.resultIndex; i < e.results.length; ++i) {
              if (e.results[i].isFinal) {
                  document.getElementById('isbn').value += e.results[i][0].transcript;
              }
          }
      };

      recognition.onsoundend() = function (e) {
          recognition.stop();
          reset_ISBN();
      };
  }
  else {
      mic_src.src = "images/mic.png";

      $("#mic_ISBN").removeClass("record_icon_ISBN");

      recognition.start();
      recognition.stop();
  }
};

function reset_title() {
  recognizing = false;
  document.getElementById('title').value = "";
};
function dictate_title() {
  var mic_src = document.getElementById("mic_title");
  var recognition = new webkitSpeechRecognition();

  if (mic_src.src.indexOf("images/mic.png") != -1) {
      mic_src.src = "images/record_icon.png";

      $("#mic_title").addClass("record_icon_title");

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      reset_title();

      recognition.start();

      recognition.onresult = function (e) {
          for (var i = e.resultIndex; i < e.results.length; ++i) {
              if (e.results[i].isFinal) {
                  document.getElementById('title').value += e.results[i][0].transcript;
              }
          }
      };

      recognition.onsoundend() = function (e) {
          recognition.stop();
          reset_title();
      };
  }
  else {
      mic_src.src = "images/mic.png";

      $("#mic_title").removeClass("record_icon_title");

      recognition.start();
      recognition.stop();
  }
};

function reset_author() {
  recognizing = false;
  document.getElementById('author').value = "";
};
function dictate_author() {
  var mic_src = document.getElementById("mic_author");
  var recognition = new webkitSpeechRecognition();

  if (mic_src.src.indexOf("images/mic.png") != -1) {
      mic_src.src = "images/record_icon.png";

      $("#mic_author").addClass("record_icon_author");

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      reset_author();

      recognition.start();

      recognition.onresult = function (e) {
          for (var i = e.resultIndex; i < e.results.length; ++i) {
              if (e.results[i].isFinal) {
                  document.getElementById('author').value += e.results[i][0].transcript;
              }
          }
      };

      recognition.onsoundend() = function (e) {
          recognition.stop();
          reset_author();
      };
  }
  else {
      mic_src.src = "images/mic.png";

      $("#mic_author").removeClass("record_icon_author");

      recognition.start();
      recognition.stop();
  }
};

function reset_class() {
  recognizing = false;
  document.getElementById('class').value = "";
};
function dictate_class() {
  var mic_src = document.getElementById("mic_class");
  var recognition = new webkitSpeechRecognition();

  if (mic_src.src.indexOf("images/mic.png") != -1) {
      mic_src.src = "images/record_icon.png";

      $("#mic_class").addClass("record_icon_class");

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      reset_class();

      recognition.start();

      recognition.onresult = function (e) {
          for (var i = e.resultIndex; i < e.results.length; ++i) {
              if (e.results[i].isFinal) {
                  document.getElementById('class').value += e.results[i][0].transcript;
              }
          }
      };

      recognition.onsoundend() = function (e) {
          recognition.stop();
          reset_class();
      };
  }
  else {
      mic_src.src = "images/mic.png";

      $("#mic_class").removeClass("record_icon_class");

      recognition.start();
      recognition.stop();
  }
};

function reset_searchbar_posting() {
  recognizing = false;
  document.getElementById('main-searchbar').value = "";
};
function dictate_searchbar_posting() {
  var mic_src = document.getElementById("mic_posting");
  var recognition = new webkitSpeechRecognition();

  if (mic_src.src.indexOf("images/mic.png") != -1) {
      mic_src.src = "images/record_icon.png";

      $("#mic_posting").addClass("record_icon_posting");

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      reset_searchbar_posting();

      recognition.start();

      recognition.onresult = function (e) {
          for (var i = e.resultIndex; i < e.results.length; ++i) {
              if (e.results[i].isFinal) {
                  document.getElementById('main-searchbar').value += e.results[i][0].transcript;
              }
          }
      };

      recognition.onsoundend() = function (e) {
          recognition.stop();
          reset_searchbar_posting();
      };
  }
  else {
      mic_src.src = "images/mic.png";

      $("#mic_posting").removeClass("record_icon_posting");

      recognition.start();
      recognition.stop();
  }
};

function reset_searchbar_results() {
  recognizing = false;
  document.getElementById('main-searchbar').value = "";
};
function dictate_searchbar_results() {
  var mic_src = document.getElementById("mic_results");
  var recognition = new webkitSpeechRecognition();

  if (mic_src.src.indexOf("images/mic.png") != -1) {
      mic_src.src = "images/record_icon.png";

      $("#mic_results").addClass("record_icon_results");

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      reset_searchbar_results();

      recognition.start();

      recognition.onresult = function (e) {
          for (var i = e.resultIndex; i < e.results.length; ++i) {
              if (e.results[i].isFinal) {
                  document.getElementById('main-searchbar').value += e.results[i][0].transcript;
              }
          }
      };

      recognition.onsoundend() = function (e) {
          recognition.stop();
          reset_searchbar_results();
      };
  }
  else {
      mic_src.src = "images/mic.png";

      $("#mic_results").removeClass("record_icon_results");

      recognition.start();
      recognition.stop();
  }
};

function reset_searchbar_book() {
  recognizing = false;
  document.getElementById('main-searchbar').value = "";
};
function dictate_searchbar_book() {
  var mic_src = document.getElementById("mic_book");
  var recognition = new webkitSpeechRecognition();

  if (mic_src.src.indexOf("images/mic.png") != -1) {
      mic_src.src = "images/record_icon.png";

      $("#mic_book").addClass("record_icon_book");

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      reset_searchbar_book();

      recognition.start();

      recognition.onresult = function (e) {
          for (var i = e.resultIndex; i < e.results.length; ++i) {
              if (e.results[i].isFinal) {
                  document.getElementById('main-searchbar').value += e.results[i][0].transcript;
              }
          }
      };

      recognition.onsoundend() = function (e) {
          recognition.stop();
          reset_searchbar_book();
      };
  }
  else {
      mic_src.src = "images/mic.png";

      $("#mic_book").removeClass("record_icon_book");

      recognition.start();
      recognition.stop();
  }
};

function reset_searchbar_about() {
  recognizing = false;
  document.getElementById('main-searchbar').value = "";
};
function dictate_searchbar_about() {
  var mic_src = document.getElementById("mic_about");
  var recognition = new webkitSpeechRecognition();

  if (mic_src.src.indexOf("images/mic.png") != -1) {
      mic_src.src = "images/record_icon.png";

      $("#mic_about").addClass("record_icon_about");

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      reset_searchbar_about();

      recognition.start();

      recognition.onresult = function (e) {
          for (var i = e.resultIndex; i < e.results.length; ++i) {
              if (e.results[i].isFinal) {
                  document.getElementById('main-searchbar').value += e.results[i][0].transcript;
              }
          }
      };

      recognition.onsoundend() = function (e) {
          recognition.stop();
          reset_searchbar_about();
      };
  }
  else {
      mic_src.src = "images/mic.png";

      $("#mic_about").removeClass("record_icon_about");

      recognition.start();
      recognition.stop();
  }
};

function reset_searchbar_chat() {
  recognizing = false;
  document.getElementById('main-searchbar').value = "";
};
function dictate_searchbar_chat() {
  var mic_src = document.getElementById("mic_chat");
  var recognition = new webkitSpeechRecognition();

  if (mic_src.src.indexOf("images/mic.png") != -1) {
      mic_src.src = "images/record_icon.png";

      $("#mic_chat").addClass("record_icon_chat");

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      reset_searchbar_chat();

      recognition.start();

      recognition.onresult = function (e) {
          for (var i = e.resultIndex; i < e.results.length; ++i) {
              if (e.results[i].isFinal) {
                  document.getElementById('main-searchbar').value += e.results[i][0].transcript;
              }
          }
      };

      recognition.onsoundend() = function (e) {
          recognition.stop();
          reset_searchbar_chat();
      };
  }
  else {
      mic_src.src = "images/mic.png";

      $("#mic_chat").removeClass("record_icon_chat");

      recognition.start();
      recognition.stop();
  }
};

function reset_searchbar_profile() {
  recognizing = false;
  document.getElementById('main-searchbar').value = "";
};
function dictate_searchbar_profile() {
  var mic_src = document.getElementById("mic_profile");
  var recognition = new webkitSpeechRecognition();

  if (mic_src.src.indexOf("images/mic.png") != -1) {
      mic_src.src = "images/record_icon.png";

      $("#mic_profile").addClass("record_icon_profile");

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      reset_searchbar_profile();

      recognition.start();

      recognition.onresult = function (e) {
          for (var i = e.resultIndex; i < e.results.length; ++i) {
              if (e.results[i].isFinal) {
                  document.getElementById('main-searchbar').value += e.results[i][0].transcript;
              }
          }
      };

      recognition.onsoundend() = function (e) {
          recognition.stop();
          reset_searchbar_profile();
      };
  }
  else {
      mic_src.src = "images/mic.png";

      $("#mic_profile").removeClass("record_icon_profile");

      recognition.start();
      recognition.stop();
  }
};