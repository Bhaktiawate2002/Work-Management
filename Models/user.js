module.exports = (sequelize, Sequelize) => {
    const user = sequelize.define('tblUsers', {
        id: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        },
        password: {
            type: Sequelize.STRING
        },
        gender: {
            type: Sequelize.STRING
        },
        dob: {
            type: Sequelize.DATEONLY
        },
        contact: {
            type: Sequelize.BIGINT
        },
        joinDate: {
            type: Sequelize.DATEONLY
        },
        address: {
            type: Sequelize.STRING
        },
        profile: {
            type: Sequelize.STRING
        },
        deptId: {
            type: Sequelize.BIGINT
        },
        roleId: {
            type: Sequelize.BIGINT,
        },
        orgId: {
            type: Sequelize.BIGINT
        },
        resToken: {
            type: Sequelize.STRING,
            default: ''
        },
        resTokenExpiry: {
            type: Sequelize.DATE,
            default: ''
        },
        isPassChng: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        isSuperAdmin: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        }
    })
    return user;
}