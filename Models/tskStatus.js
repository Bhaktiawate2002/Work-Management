module.exports = (sequelize, Sequelize) => {
    const status = sequelize.define('tblStatus', {
        id: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        statusName: {
            type: Sequelize.STRING
        }
    })
    return status;
}