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
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME
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
    'http://api.scraperapi.com?api_key=' + process.env.SCRAPERAPI_API_KEY + '&url=' + receiptLink + '&render=true'
  )
    .then(response => {
      return res.json({ html: response })
    })
    .catch(error => {
      console.log(error)
      return res.json({ html: null })
    })
})

app.post('/email/success', (req, res) => {
  const { amount, recipient, sender, bitcoinAddress } = req.body

  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const msg = {
    to: [process.env.EMAIL_RECIPIENT, process.env.EMAIL_SENDER],
    from: process.env.EMAIL_SENDER,
    subject: `Payment Verification Successful ✅`,
    html: `
      <p>The following payment has been verified successfully:</p>
      <ul>
        <li>Sender: ${sender}</li>
        <li>Recipient: ${recipient}</li>
        <li>Amount: ${amount}</li>
        <li>Bitcoin address: ${bitcoinAddress}</li>
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
  const { amount, recipient, sender, reason } = req.body

  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const msg = {
    to: [process.env.EMAIL_RECIPIENT, process.env.EMAIL_SENDER],
    from: process.env.EMAIL_SENDER,
    subject: `Payment Verification Failed 🚨`,
    html: `
      <p>The following payment has failed verification:</p>
      <ul>
        <li>Sender: ${sender}</li>
        <li>Recipient: ${recipient}</li>
        <li>Amount: ${amount}</li>
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
  const ipv6Address = req.socket.remoteAddress
  const ipv4Address = IPv6ToIPv4(ipv6Address)

  console.log('Client IP: ' + ipv4Address)

  connection.query('SELECT ip, expiration_date FROM banned_ips WHERE ip = ? AND expiration_date > NOW()', [ipv4Address], (err, results) => {
    if (err) {
      console.log('Error querying database:', err)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
    if (results.length > 0) {
      return res.json({ banned: true, expirationDate: results[0].expiration_date })
    } else {
      return res.json({ banned: false })
    }
  })
})

app.post('/banned-ips', (req, res) => {
  const ipv6Address = req.socket.remoteAddress
  const ipv4Address = IPv6ToIPv4(ipv6Address)

  const expirationDate = new Date()

  expirationDate.setDate(expirationDate.getDate() + 7)

  connection.query('SELECT * FROM banned_ips WHERE ip = ?', [ipv4Address], (err, results) => {
    if (err) {
      console.log('Error querying database:', err)
      return res.status(500).json({ error: 'Internal Server Error' })
    }

    if (results.length > 0) {
      return res.status(400).json({ error: 'IP already banned' })
    } else {
      connection.query('INSERT INTO banned_ips (ip, expiration_date) VALUES (?, ?)', [ipv4Address, expirationDate], (err, results) => {
        if (err) {
          console.log('Error inserting banned IP:', err)
          return res.status(500).json({ error: 'Internal Server Error' })
        }

        return res.sendStatus(200)
      })
    }
  })
})

app.get('/payment-ids', (req, res) => {
  const paymentId = req.query.paymentId

  connection.query('SELECT * FROM payment_ids WHERE payment_id = ?', [paymentId], (err, results) => {
    if (err) {
      console.log('Error querying database:', err)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
    if (results.length > 0) {
      return res.json({ success: false })
    }

    return res.json({ success: true })
  })
})

app.post('/payment-ids', (req, res) => {
  const paymentId = req.query.paymentId

  connection.query('SELECT * FROM payment_ids WHERE payment_id = ?', [paymentId], (err, results) => {
    if (err) {
      console.log('Error querying database:', err)
      return res.status(500).json({ error: 'Internal Server Error' })
    }

    if (results.length > 0) {
      return res.status(400).json({ error: 'ID already exists' })
    } else {
      connection.query('INSERT INTO payment_ids (payment_id) VALUES (?)', [paymentId], (err, results) => {
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

app.listen(80, () => {
  console.log('Server listening on port 80')
})

function IPv6ToIPv4(ipv6Address) {
  const ipv4Regex = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/;
  const match = ipv6Address.match(ipv4Regex);
  
  return match ? match[1] : null;
}