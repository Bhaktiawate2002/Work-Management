module.exports = (sequelize, Sequelize) => {
    const role = sequelize.define('tblRoles', {
        id: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        roleName: {
            type: Sequelize.STRING
        }
    })
    return role;
}