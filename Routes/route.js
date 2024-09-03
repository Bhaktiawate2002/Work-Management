const express = require('express');
const router = express.Router();
const validation = require('../Middleware/validation');
const userController = require('../Controller/userController');

router.get('/deptList', userController.deptList);
router.get('/roleList', userController.roleList);
router.get('/priorityList', userController.tskPriorityList);
router.get('/statusList', userController.tskStatusList);
router.get('/clientList', userController.clientList);
router.get('/tskCategoryList', userController.tskCategoryList);
router.get('/showEmpDetails', userController.showEmpDetails);
router.get('/getProject', userController.getProject);
router.get('/projectList', userController.projectList);
router.get('/getTask', userController.getTask);
router.get('/excelSheet', userController.excelSheet);

router.post('/orgRegistration', validation.validate('orgRegistration'), userController.orgRegistration);
router.post('/registerUser', validation.validate('registerUser'), userController.registerUserApi);
router.post('/userLogin', validation.validate('userLogin'), userController.userLogin);
router.post('/updateUser', userController.updateUser);
router.post('/deleteUser', validation.validate('deleteUser'), userController.deleteUser);
router.post('/deptApi', validation.validate('deptApi'), userController.deptApi);
router.post('/createRole', validation.validate('createRole'), userController.roleApi);
router.post('/getUserDetail', validation.validate('getUserDetail'), userController.getUserDetail);
router.post('/updateProfilePic', userController.updateProfilePic);
router.post('/orgList', validation.validate('orgList'), userController.orgList);
router.post('/searchUser', validation.validate('searchUser'), userController.searchUser);
router.post('/forgotPassword', validation.validate('forgotPassword'), userController.forgotPassword);
router.post('/resetPassword', validation.validate('resetPassword'), userController.resetPassword);
router.post('/changePassword', validation.validate('changePassword'), userController.changePassword);
router.post('/createTask', validation.validate('createTask'), userController.createTaskApi);
router.post('/tskPriorityApi', validation.validate('tskPriorityApi'), userController.tskPriorityApi);
router.post('/tskStatusApi', validation.validate('tskStatusApi'), userController.tskStatusApi);
router.post('/createNotes', validation.validate('createNotes'), userController.createNotes);
router.post('/updateNotes', validation.validate('updateNotes'), userController.updateNotes);
router.post('/deleteNotes', validation.validate('deleteNotes'), userController.deleteNotes);
router.post('/createTaskCategory', validation.validate('createTaskCategory'), userController.tskCategoryApi);
router.post('/taskAssignUserList', validation.validate('taskAssignUserList'), userController.taskAssignUserList);
router.post('/projectApi', validation.validate('projectApi'), userController.projectApi);
router.post('/addClient', validation.validate('addClient'), userController.addClientApi);
router.post('/userDropDownList', userController.userDropDownList);
router.post('/proAssignUserList', validation.validate('proAssignUserList'), userController.proAssignUserList);
router.post('/taskTimer', userController.taskTimer);
router.post('/pieTask', userController.pieTask);
router.post('/userProfile', userController.userProfile);
router.post('/getTaskApi', userController.getTaskApi);

module.exports = router;