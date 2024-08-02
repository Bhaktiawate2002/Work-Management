const express = require('express');
const router = express.Router();
const validation = require('../Middleware/validation');

const userController = require('../Controller/userController');
//const taskController = require('../Controller/taskController');

router.post('/orgApi', userController.orgRegistration);
router.post('/registerUserApi', validation.validate('signup'), userController.registerUserApi);
router.post('/userLogin', userController.userLogin);
router.post('/updateUserApi', userController.updateUser);
router.post('/deleteUserApi', userController.deleteUser);
router.post('/deptApi', userController.deptApi);
router.post('/roleApi', userController.roleApi);
router.get('/deptList', userController.deptList); // dept dropdown api
router.get('/roleList', userController.roleList); // role dropdown api
router.post('/userDetail', userController.getUserDetail);
router.post('/updateProfilePic', userController.updateProfilePic);
router.post('/orgList', userController.orgList);
router.post('/searchUser', validation.validate('searchUser'), userController.searchUser);
router.post('/forgotPassword', userController.forgotPassword);
router.post('/resetPassword', userController.resetPassword);
router.post('/changePassword', userController.changePassword);
router.get('/priorityList', userController.tskPriorityList);
router.get('/statusList', userController.tskStatusList);
router.post('/createTask', userController.createTaskApi);
router.post('/tskPriorityApi', userController.tskPriorityApi);
router.post('/tskStatusApi', userController.tskStatusApi);
router.post('/showEmpDetails', userController.showEmpDetails);
router.post('/createNotes', userController.createNotes);
router.post('/updateNotes', userController.updateNotes);
router.post('/deleteNotes', userController.deleteNotes);
router.get('/projectList', userController.projectList);
router.post('/tskCategoryApi', userController.tskCategoryApi);
router.get('/tskCategoryList', userController.tskCategoryList);
router.get('/tskAssignUserList', userController.tskAssignUserList);
router.post('/createProject', userController.projectApi);
router.post('/addClient', userController.addClientApi);
router.post('/clientList', userController.clientList);
router.post('/userDropDownList', userController.userDropDownList);
router.post('/projectAssign', userController.projectAssign);
router.post('/proAssignUserList', userController.proAssignUserList);

module.exports = router;