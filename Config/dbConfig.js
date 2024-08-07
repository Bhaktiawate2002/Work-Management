require('dotenv').config();
const pg = require ('pg');
const Sequelize = require('sequelize').Sequelize;


// const sequelize = new Sequelize('workManagement', 'postgres', 'HsmOnline', {
//     host: 'localhost',
//     dialect: 'postgres',
//     port: '5432',
//     logging: false
// });

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
db.client = require('../Models/client')(sequelize, Sequelize);
db.projectAssign = require('../Models/projectAssign')(sequelize, Sequelize);
db.tskAssign = require('../Models/tskAssign')(sequelize, Sequelize);

// connecting models
db.user.belongsTo(db.dept, { foreignKey: 'deptId' });
db.user.belongsTo(db.role, { foreignKey: 'roleId' });
db.user.belongsTo(db.orgs, { foreignKey: 'orgId' });

db.task.belongsTo(db.priority, { foreignKey: 'priorityId' });
db.task.belongsTo(db.status, { foreignKey: 'statusId' });
db.task.belongsTo(db.category, { foreignKey: 'categoryId' });
db.task.belongsTo(db.project, { foreignKey: 'proId' });
db.task.belongsTo(db.user, { foreignKey: 'userId' });

db.project.belongsTo(db.client, { foreignKey: 'clientId' });
db.project.belongsTo(db.orgs, { foreignKey: 'orgId' });

db.projectAssign.belongsTo(db.user, { as: 'tblUsers', foreignKey: 'userId' });

db.tskAssign.belongsTo(db.user, { as: 'tblUsers', foreignKey: 'userId' });
db.tskAssign.belongsTo(db.project, { foreignKey: 'proId' });
db.tskAssign.belongsTo(db.task, { foreignKey: 'taskId' });

db.notes.belongsTo(db.user, { foreignKey: 'userId' });

module.exports = db;