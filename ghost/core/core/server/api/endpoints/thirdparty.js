const thirdparty = require('../../services/thirdparty');
const UNSAFE_ATTRS = [];

module.exports = {
    docName: 'thirdparty',

    session: {
        validation: {
            data: {
                role: {
                    required: true
                },
                email: {
                    required: true
                },
                name: {
                    required: true
                },
                password: {
                    required: true
                }
            }
        },
        permissions: {
            unsafeAttrs: UNSAFE_ATTRS
        },
        async query(frame) {
            const user = await thirdparty.getSetUser(frame.data);
            return user;
        }
    }
};
