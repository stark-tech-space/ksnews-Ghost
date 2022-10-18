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
        'Admin Integration'
    ]),
    addPermissionWithRoles({
        name: 'Get Third Party User Token',
        action: 'token',
        object: 'thirdparty'
    }, [
        'Admin Integration'
    ]),
    addPermissionWithRoles({
        name: 'Add Third Party User',
        action: 'user',
        object: 'thirdparty'
    }, [
        'Admin Integration'
    ])
);
