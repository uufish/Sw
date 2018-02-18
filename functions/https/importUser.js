const bcrypt = require('bcrypt');
const crypto = require('crypto');

const cors = require('cors');
const admin = require('firebase-admin');
const functions = require('firebase-functions');

const failureResponse = require('../helpers/failureResponse').default;
const successResponse = require('../helpers/successResponse').default;

exports.default = functions.https.onRequest((request, response) => {
  return cors({origin: true})(request, response, () => {
    const args = getArguments(request.body);
    return importUser(args.username, args.password).
      then((result) => {
        return successResponse(response, result);
      }).
      catch((err) => {
        return failureResponse(response, err);
      });
  });
});

const getArguments = (body) => {
  return {
    username: body.username,
    password: body.password,
  };
};

const importUser = (username, password) => {
  return admin.firestore().
    collection('export-users').
    where('username', '==', username).
    limit(1).
    get().
    then((snapshots) => {
      const snapshot = snapshots.docs[0];
      if (!snapshot) {
        return {exists: false, uid: null};
      }
      const user = snapshot.data();

      if (!user.bycript) {
        return {exists: true, uid: null};
      }

      const sha512 = crypto.createHash('sha256');

      sha512.update(password);

      const hash = sha512.digest('hex');

      return compare(hash, user.bycript).
        then((result) => {
          if (result) {
            return {exists: true, uid: user.uid};
          } else {
            return {exists: true, uid: null};
          }
        });
    });
};

const compare = (hash, bcryptHash) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(hash, bcryptHash, (err, res) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(res);
    });
  });
};
