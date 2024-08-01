module.exports = (sequelize, Sequelize) => {
    const project = sequelize.define('tblProjects', {
        id: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        proName: {
            type: Sequelize.STRING
        },
        proDesc: {
            type: Sequelize.STRING
        },
        startDate: {
            type: Sequelize.DATEONLY
        },
        deadLine: {
            type: Sequelize.DATEONLY
        },
        deptId: {
            type: Sequelize.INTEGER
        },
        proLead: {
            type: Sequelize.STRING
        },
        clientId: {
            type: Sequelize.INTEGER
        },
        orgId: {
            type: Sequelize.INTEGER
        }

    })
    return project;
}