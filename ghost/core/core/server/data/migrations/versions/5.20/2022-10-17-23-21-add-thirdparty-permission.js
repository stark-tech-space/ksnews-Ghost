const {
    addPermissionWithRoles,
    combineTransactionalMigrations
} = require('../../utils');

/**
 * add thirdparty user permission to administrator role
*/
module.exports = combineTransactionalMigrations(
    addPermissionWithRoles({
        name: 'Get Third Party User Session',
        action: 'session',
        object: 'thirdparty'
    }, [
        'Administrator'
    ])
);
