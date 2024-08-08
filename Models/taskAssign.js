module.exports = (sequelize, Sequelize) => {
    const tskAssign = sequelize.define('tblTaskAssign', {
        id: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: Sequelize.BIGINT
        },
        proId: {
            type: Sequelize.INTEGER
        },
        taskId: {
            type: Sequelize.INTEGER
        }
    })
    return tskAssign;
}