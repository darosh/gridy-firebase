const functions = require('firebase-functions')
const secureCompare = require('secure-compare')

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
