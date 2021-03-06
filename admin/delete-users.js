var admin = require('firebase-admin')

var serviceAccount = require('../.admin.json')
const { databaseURL } = require('../../gridy-games/.firebase.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL
})

function listAllUsers (nextPageToken) {
  // List batch of users, 1000 at a time.
  admin.auth().listUsers(5, nextPageToken)
    .then(function (listUsersResult) {
      listUsersResult.users.forEach(function (userRecord) {
        // console.log('user', userRecord.toJSON())

        admin.auth().deleteUser(userRecord.uid)
          .then(function () {
            console.log('Successfully deleted user')
          })
          .catch(function (error) {
            console.log('Error deleting user:', error)
          })
      })
      if (listUsersResult.pageToken) {
        // List next batch of users.
        setTimeout(() => {
          listAllUsers(listUsersResult.pageToken)
        }, 5000)
      } else {
        process.exit()
      }
    })
    .catch(function (error) {
      console.log('Error listing users:', error)
    })
}

// Start listing users from the beginning, 1000 at a time.
listAllUsers()
