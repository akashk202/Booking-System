var admin = require("firebase-admin");

var serviceAccount = require("../controls/firebasekey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports.admin = admin