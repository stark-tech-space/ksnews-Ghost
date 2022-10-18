const {
    addPermissionWithRoles,
    combineTransactionalMigrations
} = require('../../utils');

/**
 * add thirdparty user permission to administrator role
*/
module.exports = combineTransactionalMigrations(
    addPermissionWithRoles({
        name: 'Get Third Party User Token',
        action: 'token',
        object: 'thirdparty'
    }, [
        'Administrator'
    ]),
    addPermissionWithRoles({
        name: 'Add Third Party User',
        action: 'user',
        object: 'thirdparty'
    }, [
        'Administrator'
    ])
);
