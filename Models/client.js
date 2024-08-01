module.exports = (sequelize, Sequelize) => {
    const client = sequelize.define('tblClients', {
        id: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        clientName: {
            type: Sequelize.STRING
        }
    })
    return client;
}