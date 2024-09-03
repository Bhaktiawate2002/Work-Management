module.exports = (sequelize, Sequelize) => {
    const task = sequelize.define('tblTasks', {
        id: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        taskName: {
            type: Sequelize.STRING
        },
        taskDesc: {
            type: Sequelize.STRING
        },
        startDate: {
            type: Sequelize.DATEONLY,
            defaultValue: Sequelize.NOW
        },
        endDate: {
            type: Sequelize.DATEONLY,
            defaultValue: Sequelize.NOW
        },
        startTime: {
            type: Sequelize.DATE,
            // defaultValue: Sequelize.NOW
        },
        endTime: {
            type: Sequelize.DATE,
            // defaultValue: Sequelize.NOW
        },
        totalHoursLogged: {
            type: Sequelize.INTEGER,
        },
        isPause: {
            type: Sequelize.INTEGER,
            // defaultValue: 0
        },
        isCompleted: {
            type: Sequelize.INTEGER,
            // defaultValue: 0
        },
        pauseTime: {
            type: Sequelize.DATE,
            // defaultValue: Sequelize.NOW
        },
        proId: {
            type: Sequelize.INTEGER
        },
        priorityId: {
            type: Sequelize.BIGINT
        },
        statusId: {
            type: Sequelize.INTEGER
        },
        categoryId: {
            type: Sequelize.BIGINT
        }
    })
    return task;
}