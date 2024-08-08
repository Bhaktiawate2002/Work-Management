module.exports = (sequelize, Sequelize) => {
    const category = sequelize.define('tblTskCategory', {
        id: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        tskCategoryName: {
            type: Sequelize.STRING
        }
    })
    return category;
}