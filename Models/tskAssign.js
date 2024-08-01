module.exports = (sequelize, Sequelize) => {
    const TskAssign = sequelize.define('tblTskAssign', {
        id: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        taskId: {
            type: Sequelize.BIGINT
        },
        proId: {
            type: Sequelize.BIGINT,
            defaultValue: 0
        },
        userId: {
            type: Sequelize.BIGINT
        }
    })
    return TskAssign;
}