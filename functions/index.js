const functions = require('firebase-functions')
const admin = require('firebase-admin')
const secureCompare = require('secure-compare')
const cors = require('cors')


const USER_LIMIT = 100

admin.initializeApp()

const corsHandler = cors({ origin: true });
const db = admin.database()
const usersRef = db.ref('users').orderByChild('online').equalTo(true)

let onlineUsers = []
let onlineCount = 0
let onlineUsersRequestCount = 0
let connectionReuseCount = 0
let resolveUsers

const usersPromise = new Promise(resolve => {
  resolveUsers = resolve
})

usersRef.on('value', (snap) => {
  const val = snap.val() || {}
  const keys = Object.keys(val)
  onlineCount = keys.length
  connectionReuseCount++
  onlineUsers = keys.filter((k, i) => i < USER_LIMIT).map(k => {
    const i = val[k]
    return {
      name: i.name,
      avatar: i.avatar
    }
  })

  if (connectionReuseCount === 1) {
    resolveUsers()
  }
})

exports.hello = functions.https.onRequest((req, res) => {
  res.send('Hello from Firebase!')
})

exports.secretHello = functions.https.onRequest((req, res) => {
  const key = req.query.key

  if (!secureCompare(key, functions.config().secret.key)) {
    console.log('Security key does not match')
    res.status(403).send('Security key does not match')
    return null
  }

  res.send('Secret hello from Firebase!')
})

exports.onlineUsers = functions.https.onRequest((req, res) => {
  corsHandler(req, res, () => {
    usersPromise.then(() => {
      onlineUsersRequestCount++
      res.json({ data: { onlineCount, connectionReuseCount, onlineUsersRequestCount, onlineUsers } })
    })
  })
})
