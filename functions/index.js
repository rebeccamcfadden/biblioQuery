const functions = require('firebase-functions');

const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

let cheerio = require('cheerio');
let axios = require('axios');

const cors = require('cors')({
    origin: true
});
// var serviceAccount = require("../biblioquery-1813ceeb85e9.json");
admin.initializeApp({
    credential: admin.credential.applicationDefault()
});
// admin.initializeApp();
/**
 * Here we're using Gmail to send 
 */
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'biblioquery@gmail.com',
        pass: 'csce315-team34'
    }
});

(function () {
    TrigramIndex = function (inputPhrases) {
        function asTrigrams(phrase, callback) {
            var rawData = "  ".concat(phrase, "  ");
            for (var i = rawData.length - 3; i >= 0; i = i - 1)
                callback.call(this, rawData.slice(i, i + 3));
        }

        var instance = {
            phrases: [],
            trigramIndex: [],

            index: function (phrase) {
                if (!phrase || phrase === "" || this.phrases.indexOf(phrase) >= 0) return;
                var phraseIndex = this.phrases.push(phrase) - 1;
                asTrigrams.call(this, phrase, function (trigram) {
                    var phrasesForTrigram = this.trigramIndex[trigram];
                    if (!phrasesForTrigram) phrasesForTrigram = [];
                    if (phrasesForTrigram.indexOf(phraseIndex) < 0) phrasesForTrigram.push(phraseIndex);
                    this.trigramIndex[trigram] = phrasesForTrigram;
                });
            },

            find: function (phrase) {
                var phraseMatches = [];
                var trigramsInPhrase = 0;
                asTrigrams.call(this, phrase, function (trigram) {
                    var phrasesForTrigram = this.trigramIndex[trigram];
                    trigramsInPhrase += 1;
                    if (phrasesForTrigram)
                        for (var j in phrasesForTrigram) {
                            phraseIndex = phrasesForTrigram[j];
                            if (!phraseMatches[phraseIndex]) phraseMatches[phraseIndex] = 0;
                            phraseMatches[phraseIndex] += 1;
                        }
                });
                var result = [];
                for (var i in phraseMatches)
                    result.push({ phrase: this.phrases[i], matches: phraseMatches[i] });

                result.sort(function (a, b) {
                    var diff = b.matches - a.matches;
                    return diff;// == 0 ? a.phrase.localeCompare(b.phrase) : diff;
                });
                return result;
            }
        };
        for (var i in inputPhrases)
            instance.index(inputPhrases[i]);
        return instance;
    };
})();

function getUniqueTrigrams(trigA, trigB) {
    let arrA = Object.getOwnPropertyNames(trigA.trigramIndex);
    arrA.shift();
    let arrB = Object.getOwnPropertyNames(trigB.trigramIndex);
    arrB.shift();
    uniq = [...new Set(arrA.concat(arrB))];
    //  //console.log(uniq);
    return uniq.length;
}

function getNameSimilarities(queryResults, search) {
    let searchTrigrams = TrigramIndex(search.toLowerCase().split(' '));
    let docs = [];
    //  //console.log(searchTrigrams);
    queryResults.forEach((doc) => {
        let user = doc.data();
        let docTrigrams = TrigramIndex(user.display_name.toLowerCase().split(' '));
        // for(let phrase of searchTrigrams.phrases)
        let result = docTrigrams.find(search);
        //  //console.log(result);
        //  //console.log(docTrigrams.trigramIndex);
        let score = 0;
        for (let item of result)
            score += item.matches;
        score /= getUniqueTrigrams(searchTrigrams, docTrigrams);
        if (user.nickname) {
            let oscore = 0;
            let docTrigrams1 = TrigramIndex(user.nickname.toLowerCase().split(' '));
            let result1 = docTrigrams1.find(search);
            for (let item of result1)
                oscore += item.matches;
            oscore /= getUniqueTrigrams(searchTrigrams, docTrigrams1);
            score += oscore;
            score /= 2;
        }
        docs.push({ user, score });
    });
    let keepDocs = docs.filter((a) => { return a.score > 0.1 });
    keepDocs.sort((a, b) => { return b.score - a.score; });
    return keepDocs;
}

exports.getUsers = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        let search = req.query.search;
        let db = admin.firestore();
        db.collection('user-info')
            .get()
            .then(function (querySnapshot) {
                let results = getNameSimilarities(querySnapshot, search.toLowerCase());
                res.status(200).json({ data: results });
                return results;
            }).catch((error) => res.status(400).json(error));
    });
});

exports.getPriceData = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        let isbn = req.query.isbn;
        const url = `https://www.bookfinder.com/search/?&lang=en&isbn=${isbn}&mode=basic&st=sr&ac=qr`;
        axios.get(url).then((response) => {
            var books = [];
            if (response.status === 200) {
                const html = response.data;
                const $ = cheerio.load(html);
                $('.results-table-Logo').each(function (index, element) {
                    var condition = $(element).parent().find('.results-section-heading').text().split(" ")[0];
                    var centerCol;
                    var priceCol;
                    $(element).find('tbody').find('tr').each(function (index, row) {
                        if (!$(row).attr('data-price') && condition !== "Rent") {
                            return;
                        }
                        let entry = {};
                        if (condition === "Rent") {
                            centerCol = $(row).find('.results-table-rental-column-seller');
                            priceCol = $(row).find('.results-table-center').find('div > .results-price > a');
                            entry['seller'] = $(centerCol).find('a > img').attr('title');
                            if (!entry['seller']) {
                                entry['seller'] = $(centerCol).children().eq(1).find('a > img').attr('title');
                                if (!(entry['seller'])) {
                                    return;
                                }
                            }
                            entry['condition'] = condition;
                            entry['price'] = $(priceCol).text().substr(1);
                            entry['link'] = $(priceCol).attr('href');
                        } else {
                            centerCol = $(row).children('.results-table-center').eq(1).find('a');
                            priceCol = $(row).children('.results-table-center').eq(2).find('div > .results-price > a');
                            entry['seller'] = $(centerCol).find('img').attr('title');
                            entry['condition'] = condition;
                            entry['link'] = $(priceCol).attr('href');
                            entry['price'] = $(row).attr('data-price');
                        }
                        books.push(entry);
                    });
                });
                res.status(200).json({ data: books });

            } return books;
        }).catch(err => {
            res.json(err);
             console.log('Error getting document', err);
        });
    });
});

exports.sendMail = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        let db = admin.firestore();
        // getting dest email by query string
        const sellerid = req.query.selleruid;
        const listingid = req.query.listingid;
        const contact = req.query.contactuid;
        const extra = req.query.extra;
         //console.log(req.query);
        db.collection('book-listings').doc(listingid).get().then(function (doc) {
            if (!doc.exists) {
                 console.log('No such document!');
            } else {
                db.collection('user-info').doc(sellerid).get().then(function (seller) {
                    if (!seller.exists) {
                         console.log('No such document!');
                    } else {
                        db.collection('user-info').doc(contact).get().then(function (buyer) {
                            if (!buyer.exists) {
                                 console.log('No such document!');
                            } else {
                                const myemail = seller.data().email;
                                const myname = seller.data().display_name;
                                const title = doc.data().title;
                                const isbn = doc.data().isbn;
                                const price = doc.data().price;
                                // const extra = req.query.extra;
                                const dest = `${myname} <${myemail}>`;
                                const content = `<h3>You have a message from someone looking to buy your book!</h3>
                                <p style="margin-left: 20px;">Hi ${myname},</p>
                                <p style="margin-left: 40px;">I am interested in your sale 
                                    of <a href='biblioquery.firebaseapp.com/book.html?isbn=${isbn}'>${doc.data().title}</a> for ${price}. 
                                    If you could please contact me at <a href='mailto:${buyer.data().display_name}'>
                                    ${buyer.data().email}</a>, I would appreciate it.</p>
                                <p style = "margin-left: 40px;" >${extra} </p>
                                <p style = "margin-left: 20px;" > Thanks, </p>
                                <p style = "margin-left: 20px;"> ${buyer.data().display_name}</p>`
                                const mailOptions = {
                                    from: 'biblioQuery <biblioquery@gmail.com>', // Something like: Jane Doe <janedoe@gmail.com>
                                    to: dest,
                                    subject: 'Someone is interested in one of your books!', // email subject
                                    html: content // email content in HTML
                                };

                                // returning result
                                return transporter.sendMail(mailOptions, (erro, info) => {
                                    if (erro) {
                                        return res.send(erro.toString());
                                    }
                                    return res.send('Sent');
                                });
                            } return 0;
                        }).catch(err => {
                            console.error('Error getting document', err);
                        });
                    } return 0;
                }).catch(err => {
                    console.error('Error getting document', err);
                });
            } return 0;
        }).catch(err => {
            console.error('Error getting document', err);
        });
    });
});

exports.addWelcomeMessages = functions.auth.user().onCreate(async (user) => {
    //  //console.log('A new user signed in for the first time.');
    const fullName = user.displayName || 'Anonymous';

    // Saves the new welcome message into the database
    // which then displays it in the FriendlyChat clients.
    await admin.firestore().collection('chats').add({
        users:
            [user.uid, "biblioQueryBot"]
    }).then(ref => {
        admin.firestore().collection('chats').doc(ref.id)
            .collection('messages').add({
                sender: "biblioQueryBot",
                data: `${fullName} signed in for the first time! Welcome!`,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            }).catch(err => {
                 console.log('Error getting document', err);
            });
        return;
    });
    //  //console.log('Welcome message written to database.');
});

exports.sendNotifications = functions.firestore.document('chats/{chatID}/messages/{messageID}').onCreate(
    async (snapshot) => {
        // Notification details.
        let db = admin.firestore();

        const text = snapshot.data().data;
        const recipientID = await db.collection('chats').doc(snapshot.ref.parent.parent.id)
            .get().then(doc => {
                let users = doc.data().users;
                if (users[0] === snapshot.data().sender) {
                    return users[1];
                } else {
                    return users[0];
                }
            });
        const sender = await db.collection('user-info').doc(snapshot.data().sender).get();
        const payload = {
            notification: {
                title: `${sender.data().display_name} posted ${text ? 'a message' : 'an image'}`,
                body: text ? (text.length <= 100 ? text : text.substring(0, 97) + '...') : '',
                icon: sender.data().photoURL || '/images/profile_placeholder.png',
                click_action: `https://biblioQuery.firebaseapp.com`,
            },
            data: {
                chatID: snapshot.ref.parent.parent.id
            }
        };

        const webpush = {
            fcm_options: {
                link: "https://biblioQuery.firebaseapp.com"
            }
        }
        const tokens = [];
        // Get the list of device tokens.
        const recipientToken = await admin.firestore().collection('fcmTokens').doc(recipientID).get().then((doc) => {
            if (!doc.exists) {
                console.log('doc doesnt exist');
                return "";
            } else {
                tokens.push(doc.data().token);
                return doc.data().token;
            }
        });
        //  //console.log('sending token to ' + recipientToken.id + ', token:' + recipientToken.data().token);

        // tokens.push(recipientToken.token);

        if (tokens.length > 0) {
            // Send notifications to all tokens.
            const response = await admin.messaging().sendToDevice(tokens, payload, webpush);
            await cleanupTokens(response, tokens);
             console.log('Notifications have been sent and tokens cleaned up.');
        } else  console.log('No tokens. Notifications not sent');
    });

function cleanupTokens(response, tokens) {
    // For each notification we check if there was an error.
    response.results.forEach((result, index) => {
        const error = result.error;
        if (error) {
            console.error('Failure sending notification to', tokens[index], error);
            // Cleanup the tokens who are not registered anymore.
            if (error.code === 'messaging/invalid-registration-token' ||
                error.code === 'messaging/registration-token-not-registered') {
                admin.firestore().collection('fcmTokens').where("token", '==', tokens[index])
                    .get().then(function (querySnapshot) {
                        querySnapshot.forEach(function (doc) {
                            doc.ref.delete();
                        });
                        return;
                    }).catch(err => {
                         console.log('Error getting document', err);
                    });
            }
        }
    });
}
