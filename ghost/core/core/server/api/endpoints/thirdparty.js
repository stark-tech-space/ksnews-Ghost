const thirdparty = require('../../services/thirdparty');

module.exports = {
    docName: 'thirdparty',

    user: {
        permissions: true,
        async query(frame) {
            const user = await thirdparty.getSetUser(frame.data);
            return user;
        }
    },

    token: {
        permissions: true,
        async query(frame) {
            const user = await thirdparty.genToken(frame.data);
            return user;
        }
    },

    memberLoginUrl: {
        permissions: true,
        async query(frame) {
            const url = await thirdparty.genMemberLoginUrl(frame.data);
            return url;
        }
    }
};
