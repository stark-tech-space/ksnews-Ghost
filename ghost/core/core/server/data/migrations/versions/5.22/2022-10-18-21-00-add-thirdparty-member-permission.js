const {
    addPermissionWithRoles,
    combineTransactionalMigrations
} = require('../../utils');

/**
 * add thirdparty user permission to administrator role
*/
module.exports = combineTransactionalMigrations(
    addPermissionWithRoles({
        name: 'Get Third Party Member Login Url',
        action: 'memberLoginUrl',
        object: 'thirdparty'
    }, [
        'Administrator'
    ])
);
