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
        starTime: {
            type: Sequelize.TIME,
            // defaultValue: Sequelize.NOW
        },
        endTime: {
            type: Sequelize.TIME,
            // defaultValue: Sequelize.NOW
        },
        totalHoursLogged: {
            type: Sequelize.FLOAT
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
            type: Sequelize.TIME,
            // defaultValue: Sequelize.NOW
        },
        // endPauseTime: {
        //     type: Sequelize.TIME,
        //     // defaultValue: Sequelize.NOW
        // },
        // totalPauseTime: {
        //     type: Sequelize.TIME
        // },
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