const crypto = require('crypto');
const editJsonFile = require('edit-json-file');

var sessions = {
    data: editJsonFile("./sessions.json", { autosave: true }),
    create() {
        const sessionId = crypto.randomBytes(32).toString('hex');
        sessions.data.set(`${sessionId}`, {});
        return sessionId;
    },
    delete(id) {
        if(sessions.data.get(`${id}`)) {
            sessions.data.unset(`${sessionId}`);
            return true;
        } else {
            return false;
        }
    }
};

module.exports = sessions;