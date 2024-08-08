module.exports = (sequelize, Sequelize) => {
    const userOrgAssign = sequelize.define('tblOrgUsers', {
        id: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: Sequelize.INTEGER
        },
        orgId: {
            type: Sequelize.INTEGER
        }
    })
    return userOrgAssign;
}