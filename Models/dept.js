module.exports = (sequelize, Sequelize) => {
    const dept = sequelize.define('tblDepts', {
        id: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        deptName: {
            type: Sequelize.STRING
        }
    })
    return dept;
}