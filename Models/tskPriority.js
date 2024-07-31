module.exports = (sequelize, Sequelize) => {
    const priority = sequelize.define('tblPriority', {
        id: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        priorityName: {
            type: Sequelize.STRING
        }
    })
    return priority;
}