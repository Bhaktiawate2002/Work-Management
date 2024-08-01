require('dotenv').config();
const pg = require ('pg');
const Sequelize = require('sequelize').Sequelize;

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false, // Disable logging for production
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // For self-signed certificates
      },
    },
  });

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// requiring models
db.user = require('../Models/user')(sequelize, Sequelize);
db.orgs = require('../Models/organisation')(sequelize, Sequelize);
db.dept = require('../Models/dept')(sequelize, Sequelize);
db.role = require('../Models/role')(sequelize, Sequelize);
db.project = require('../Models/project')(sequelize, Sequelize);
db.task = require('../Models/task')(sequelize, Sequelize);
db.priority = require('../Models/tskPriority')(sequelize, Sequelize);
db.status = require('../Models/tskStatus')(sequelize, Sequelize);
db.notes = require('../Models/notes')(sequelize, Sequelize);
db.category = require('../Models/tskCategory')(sequelize, Sequelize);
db.assign = require('../Models/tskAssign')(sequelize, Sequelize);

// connecting models
// db.user.belongsTo(db.dept, { foreignKey: 'deptId' });
// db.user.belongsTo(db.role, { foreignKey: 'roleId' });
// db.user.belongsTo(db.orgs, { foreignKey: 'orgId' });
// db.task.belongsTo(db.priority, { foreignKey: 'priorityId' });
// db.task.belongsTo(db.status, { foreignKey: 'statusId' });
// db.task.belongsTo(db.category, { foreignKey: 'categoryId' });
// db.task.belongsTo(db.project, { foreignKey: 'proId' });
// db.task.belongsTo(db.user, { foreignKey: 'userId' });
// db.assign.belongsTo(db.task, { foreignKey: 'taskId' });
// db.assign.belongsTo(db.user, { foreignKey: 'userId' });
// db.notes.belongsTo(db.user, { foreignKey: 'userId' });

module.exports = db;