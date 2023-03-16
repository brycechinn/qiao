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
        const amount = paymentHistoryData.detail_rows[0].value
        const source = paymentHistoryData.detail_rows[1].value
        const paymentId = paymentHistoryData.detail_rows[2].value
        const recipient = paymentHistoryData.detail_rows[3].value
        const sender = paymentHistoryData.detail_rows[4].value
        const date = paymentHistoryData.support_subtitle

        const headerSubtext = paymentHistoryData.header_subtext
        const recipientHandle = getRecipientHandle(headerSubtext)

        /*
        if (await isIpBanned('192.168.1.1')) {
            throw new Error('IP banned')
        }
        */

        if (!(await isUniquePaymentId(paymentId))) {
            const reason = `Reused payment receipt "${paymentId}"`

            sendFailureEmail(amount, recipient, sender, date, reason)
            throw new Error(reason)
        }

        if (recipientHandle != '$tangrui') {
            const reason = `Invalid recipient "${recipientHandle}"`

            sendFailureEmail(amount, recipient, sender, date, reason)
            throw new Error(reason)
        }

        if (source != 'Cash') {
            const reason = `Invalid source "${source}"`

            sendFailureEmail(amount, recipient, sender, date, reason)
            throw new Error(reason)
        }

        insertPaymentId(paymentId)
        sendSuccessEmail(amount, recipient, sender, date, bitcoinAddress)

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


async function isIpBanned(ip) {
    try {
        const encodedIp = encodeURIComponent(ip)
        const response = await fetch(`/banned-ips?ip=${encodedIp}`)

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

async function banIp(ip) {
    try {
        const encodedIp = encodeURIComponent(ip)
        const response = await fetch(`/banned-ips?ip=${encodedIp}`, {
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

function createCopyButton(element) {
    const copyButton = document.createElement('button')
    copyButton.textContent = 'Copy'

    copyButton.addEventListener('click', function () {
        const textToCopy = '$tangrui'

        console.log(navigator.clipboard)
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                console.log('Text copied to clipboard')
                copyButton.textContent = 'Copied!'

                setTimeout(() => {
                    copyButton.textContent = 'Copy'
                }, 1000)
            })
            .catch((error) => {
                console.error('Failed to copy text: ', error)
            })
    })

    element.appendChild(copyButton)
}

function getPaymentHistoryData(html) {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html

    const scriptText = tempDiv.querySelector('#__next script').innerText
    const regex = /var bootstrap = {paymentHistoryData: (.*) };/
    const match = regex.exec(scriptText)

    return JSON.parse(match[1])
}

function getRecipientHandle(headerSubtext) {
    const recipientHandle = headerSubtext.match(/\$[\w]+/)[0]

    return recipientHandle
}

function isValidReceiptLink(receiptLink) {
    const regex = /^https:\/\/cash\.app\/payments\/[a-z\d]{25}\/receipt$/

    return regex.test(receiptLink)
}

function sendSuccessEmail(amount, recipient, sender, date, bitcoinAddress) {
    fetch('/email/success', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            amount: amount,
            recipient: recipient,
            sender: sender,
            date: date,
            bitcoinAddress: bitcoinAddress
        })
    })
        .then(response => response.text())
        .then(data => console.log(data))
        .catch(error => console.error(error))
}

function sendFailureEmail(amount, recipient, sender, date, reason) {
    fetch('/email/failure', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            amount: amount,
            recipient: recipient,
            sender: sender,
            date: date,
            reason: reason
        })
    })
        .then(response => response.text())
        .then(data => console.log(data))
        .catch(error => console.error(error))
}

registerButtonCallbacks()