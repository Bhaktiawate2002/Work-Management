module.exports = (sequelize, Sequelize) => {
    const category = sequelize.define('tblCategory', {
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