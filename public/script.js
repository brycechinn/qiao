function registerButtonCallbacks() {
    const requestButton = document.getElementById('request-button')

    requestButton.addEventListener('click', function () {
        const validateStatus = document.getElementById('validate-status')

        validateStatus.textContent = 'Validating...'

        validateReceipt()
    })
}

async function validateReceipt() {
    const receiptLinkField = document.getElementById('link-field')
    const bitcoinAddressField = document.getElementById('address-field')
    const receiptLink = receiptLinkField.value
    const bitcoinAddress = bitcoinAddressField.value
    const validateStatus = document.getElementById('validate-status')

    try {
        receiptLinkField.style.border = receiptLink ? '1px solid white' : '1px solid red'
        bitcoinAddressField.style.border = bitcoinAddress ? '1px solid white' : '1px solid red'

        if (!receiptLink || !bitcoinAddress) {
            throw new Error('Missing required field(s)')
        }

        if (!isValidReceiptLink(receiptLink)) {
            throw new Error('Invalid receipt link')
        }

        const paymentHistoryData = await fetchPaymentHistoryData(receiptLink)
        const [, recipientHandle, amount, source, paymentId, recipient, sender] = paymentHistoryData.match(/Payment\s+to\s+(\$.*?)\$.*?Amount(.*?)Source(.*?)Identifier(.*?)To(.*?)From(.*)/);

        if (await isIpBanned()) {
            throw new Error('IP is banned.')
        }

        if (!(await isUniquePaymentId(paymentId))) {
            banIp()

            const reason = `Reused payment receipt with identifier "${paymentId}". IP has been banned for one week.`

            sendFailureEmail(amount, recipient, sender, reason)
            throw new Error(reason)
        }

        if (recipientHandle.toLowerCase() != '$zhangwilly') {
            banIp()
            
            const reason = `Invalid recipient "${recipientHandle}". IP has been banned for one week.`

            sendFailureEmail(amount, recipient, sender, reason)
            throw new Error(reason)
        }

        if (source != 'Cash') {
            banIp()

            const reason = `Invalid source "${source}". IP has been banned for one week.`

            sendFailureEmail(amount, recipient, sender, reason)
            throw new Error(reason)
        }

        insertPaymentId(paymentId)
        sendSuccessEmail(amount, recipient, sender, bitcoinAddress)

        validateStatus.textContent = 'Success ✅'
    } catch (error) {
        console.error(error.message)

        validateStatus.textContent = 'Failure 🚨'

        const validateFailureReason = document.createElement('span')
        validateFailureReason.textContent = 'Reason: ' + error.message
        validateFailureReason.setAttribute('id', 'validate-failure-reason')
        validateStatus.appendChild(validateFailureReason)
    }
}

async function fetchPaymentHistoryData(receiptLink) {
    const encodedReceiptLink = encodeURIComponent(receiptLink)

    try {
        const response = await fetch(`/payment-history-data?receiptLink=${encodedReceiptLink}`)
        const data = await response.json()
        const html = data.html

        return getPaymentHistoryData(html)
    } catch (error) {
        console.error(error)
        return null
    }
}


async function isIpBanned() {
    try {
        const response = await fetch('/banned-ips')

        if (!response.ok) {
            throw new Error('Could not check IP')
        }

        const data = await response.json()
        return data.banned
    } catch (error) {
        console.error(error.message)
        return null
    }
}

async function banIp() {
    try {
        const response = await fetch('/banned-ips', {
            method: 'POST'
        })

        if (!response.ok) {
            throw new Error('Could not ban IP')
        }
    } catch (error) {
        console.error(error.message)
    }
}

async function isUniquePaymentId(paymentId) {
    try {
        const encodedPaymentId = encodeURIComponent(paymentId)
        const response = await fetch(`/payment-ids?paymentId=${encodedPaymentId}`)

        if (!response.ok) {
            throw new Error('Could not check payment ID')
        }

        const data = await response.json()
        return data.success
    } catch (error) {
        console.error(error.message)
        return false
    }
}

async function insertPaymentId(paymentId) {
    try {
        const encodedPaymentId = encodeURIComponent(paymentId)
        const response = await fetch(`/payment-ids?paymentId=${encodedPaymentId}`, {
            method: 'POST'
        })

        if (!response.ok) {
            throw new Error('Could not insert payment ID')
        }
    } catch (error) {
        console.error(error.message)
    }
}

function getPaymentHistoryData(html) {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html

    return tempDiv.querySelector('.css-nzo54n').innerText
}

function getRecipientHandle(headerSubtext) {
    const recipientHandle = headerSubtext.match(/\$[\w]+/)[0]

    return recipientHandle
}

function isValidReceiptLink(receiptLink) {
    const regex = /^https:\/\/cash\.app\/payments\/[a-z\d]{25}\/receipt$/

    return regex.test(receiptLink)
}

function sendSuccessEmail(amount, recipient, sender, bitcoinAddress) {
    fetch('/email/success', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            amount: amount,
            recipient: recipient,
            sender: sender,
            bitcoinAddress: bitcoinAddress
        })
    })
        .then(response => response.text())
        .then(data => console.log(data))
        .catch(error => console.error(error))
}

function sendFailureEmail(amount, recipient, sender, reason) {
    fetch('/email/failure', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            amount: amount,
            recipient: recipient,
            sender: sender,
            reason: reason
        })
    })
        .then(response => response.text())
        .then(data => console.log(data))
        .catch(error => console.error(error))
}

registerButtonCallbacks()