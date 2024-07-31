module.exports = (sequelize, Sequelize) => {
    const notes = sequelize.define('tblNotes', {
        id: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        notesName: {
            type: Sequelize.TEXT
        },
        userId: {
            type: Sequelize.BIGINT
        }
    })
    return notes;
}