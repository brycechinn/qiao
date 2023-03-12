const express = require('express')
const path = require('path')
const app = express()
const bodyParser = require('body-parser')
const mysql = require('mysql')
const sgMail = require('@sendgrid/mail')
const request = require('request-promise')

app.use(express.static('public'))
app.use(bodyParser.json())

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Allinpreflop!',
  database: 'qiao'
})

connection.connect((err) => {
  if (err) {
    console.log('Error connecting to database:', err)
  } else {
    console.log('Connected to database')
  }
})

app.get('/payment-history-data', async (req, res) => {
  const receiptLink = req.query.receiptLink

  request(
    'http://api.scraperapi.com?api_key=' + process.env.SCRAPERAPI_API_KEY + '&url=' + receiptLink
  )
    .then(response => {
      console.log(response)
      return res.json({ html: response })
    })
    .catch(error => {
      console.log(error)
      return res.json({ html: null })
    })
})

app.post('/email/success', (req, res) => {
  const { amount, recipient, sender, date, bitcoinAddress } = req.body

  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const bitcoinAddressCopyButton = `<button onclick="copyToClipboard('${bitcoinAddress}')">Copy</button>`

  const msg = {
    to: 'qiao.noreply@gmail.com',
    from: 'qiao.noreply@gmail.com',
    subject: `✅ Payment Verification Successful`,
    html: `
      <p>The following payment has been verified successfully:</p>
      <ul>
        <li>Sender: ${sender}</li>
        <li>Recipient: ${recipient}</li>
        <li>Amount: ${amount}</li>
        <li>Date: ${date}</li>
        <li>Bitcoin address: ${bitcoinAddress} ${bitcoinAddressCopyButton}</li>
      </ul>
    `
  }
  sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent')
      res.status(200).send('Email sent')
    })
    .catch((error) => {
      console.error(error)
      res.status(500).send('Error sending email')
    })
})

app.post('/email/failure', (req, res) => {
  const { amount, recipient, sender, date, reason } = req.body

  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const msg = {
    to: 'qiao.noreply@gmail.com',
    from: 'qiao.noreply@gmail.com',
    subject: `🚨 Payment Verification Failed`,
    html: `
      <p>The following payment has failed verification:</p>
      <ul>
        <li>Sender: ${sender}</li>
        <li>Recipient: ${recipient}</li>
        <li>Amount: ${amount}</li>
        <li>Date: ${date}</li>
        <li>Reason: ${reason}</li>
      </ul>
    `
  }
  sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent')
      res.status(200).send('Email sent')
    })
    .catch((error) => {
      console.error(error)
      res.status(500).send('Error sending email')
    })
})

app.get('/banned-ips', (req, res) => {
  const ip = req.query.ip

  // TODO: add expiration date to ban 'AND expiration_date > NOW()'
  connection.query('SELECT * FROM banned_ips WHERE ip = ?', [ip], (err, results) => {
    if (err) {
      console.log('Error querying database:', err)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
    if (results.length > 0) {
      return res.json({ banned: true })
    } else {
      return res.json({ banned: false })
    }
  })
})

app.post('/banned-ips', (req, res) => {
  const ip = req.query.ip
  const expirationDate = new Date() // set the expiration date to the current date/time

  // add one week to the expiration date
  expirationDate.setDate(expirationDate.getDate() + 7)

  console.log(expirationDate)

  connection.query('SELECT * FROM banned_ips WHERE ip = ?', [ip], (err, results) => {
    if (err) {
      console.log('Error querying database:', err)
      return res.status(500).json({ error: 'Internal Server Error' })
    }

    if (results.length > 0) {
      // IP already banned, do not insert again
      return res.status(400).json({ error: 'IP already banned' })
    } else {
      // IP not banned, insert into database
      connection.query('INSERT INTO banned_ips (ip, expiration_date) VALUES (?, ?)', [ip, expirationDate], (err, results) => {
        if (err) {
          console.log('Error inserting banned IP:', err)
          return res.status(500).json({ error: 'Internal Server Error' })
        }

        return res.sendStatus(200)
      })
    }
  })
})

app.get('/payments', (req, res) => {
  const paymentId = req.query.paymentId

  connection.query('SELECT * FROM payments WHERE payment_id = ?', [paymentId], (err, results) => {
    if (err) {
      console.log('Error querying database:', err)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
    if (results.length > 0) {
      return res.json({ exists: true })
    }

    return res.json({ exists: false })
  })
})

app.post('/payments', (req, res) => {
  const paymentId = req.query.paymentId

  connection.query('SELECT * FROM payments WHERE payment_id = ?', [paymentId], (err, results) => {
    if (err) {
      console.log('Error querying database:', err)
      return res.status(500).json({ error: 'Internal Server Error' })
    }

    if (results.length > 0) {
      // Payment ID already exists, do not insert again
      return res.status(400).json({ error: 'ID already exists' })
    } else {
      // Payment ID does not exist, insert into database
      connection.query('INSERT INTO payments (payment_id) VALUES (?)', [paymentId], (err, results) => {
        if (err) {
          console.log('Error inserting payment ID:', err)
          return res.status(500).json({ error: 'Internal Server Error' })
        }

        return res.sendStatus(200)
      })
    }
  })
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.post('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.listen(3000, () => {
  console.log('Server listening on port 3000')
})