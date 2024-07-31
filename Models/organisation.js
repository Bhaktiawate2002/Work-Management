module.exports = (sequelize, Sequelize) => {
    const orgs = sequelize.define('tblOrgs', {
        id: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        orgName: {
            type: Sequelize.STRING
        },
        orgEmail: {
            type: Sequelize.STRING
        },
        contact: {
            type: Sequelize.BIGINT
        },
        address: {
            type: Sequelize.STRING
        },
        password: {
            type: Sequelize.STRING
        }
    })
    return orgs;
}