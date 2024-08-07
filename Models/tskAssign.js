module.exports = (sequelize, Sequelize) => {
    const tskAssign = sequelize.define('tblTaskAssign', {
        id: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: Sequelize.INTEGER
        },
        proId: {
            type: Sequelize.INTEGER
        }
    })
    return tskAssign;
}