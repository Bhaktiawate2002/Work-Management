const { check, body } = require('express-validator');

exports.validate = (method) => {
    switch (method) {

        case 'orgRegistration': {
            return [
                check('name', "Organization name is required").not().isEmpty(),
                check('email', "Valid email is required").isEmail(),
                check('password', "Password must be at least 6 characters long").isLength({ min: 6 })
            ]
        }

        case 'registerUser': {
            return [
                check('name', "Name is required").not().isEmpty(),
                body('email', 'Email required').exists(),
                check('email', 'Invalid email id').isEmail(),
                check('password', "Invalid Password").notEmpty(),
                check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
                body('password', "Password required")
            ]
        }

        case 'userLogin': {
            return [
                check('email', "Enter a valid email").isEmail(),
                check('password', "Password is required").notEmpty(),
                check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
            ]
        }

        case 'forgotPassword': {
            return [
                check('email', "Email is not valid").isEmail(),
            ]
        }

        case 'resetPassword': {
            return [
                check('token', "Token is required").notEmpty(),
                body('newPassword', "New Password is required").notEmpty(),
                check('newPassword', "New password must be at least 6 characters long").isLength({ min: 6 })
            ]
        }

        case 'changePassword': {
            return [
                body('oldPassword', "Old Password is required").notEmpty(),
                body('newPassword', "New Password is required").notEmpty(),
                body('confirmPassword', "Confirm Password is required").notEmpty(),
                body('newPassword', "New Password must be at least 6 characters long").isLength({ min: 6 }),
                body('confirmPassword', "Confirmation password must be at least 6 characters long").isLength({ min: 6 })
            ];
        }

        case 'deptApi': {
            return [
                check('deptName', "Department name is required").notEmpty()
            ];
        }

        case 'createRole': {
            return [
                check('roleName', "Role name is required").notEmpty()
            ];
        }

        case 'showEmpDetails': {
            return [
                body('userId', "Enter a valid user ID").isInt()
            ];
        }

        case 'getUserDetail': {
            return [
                body('userId', "Enter user id").notEmpty()
            ]
        }

        case 'deleteUser': {
            return [
                body('id', "User ID is required").notEmpty()
            ]
        }

        case 'orgList': {
            return [
                body('orgEmail', "Organisation email is required").isEmail()
            ];
        }

        case 'searchUser': {
            return [
                check('email', 'Invalid email id').isEmail(),
                body('orgId', "Enter organisation id")
            ]
        }

        case 'createNotes': {
            return [
                body('notesName', "Notes name is required").notEmpty(),
                body('userId', "User ID is required").notEmpty()
            ];
        }

        case 'updateNotes': {
            return [
                check('notesName', "Notes name is required").notEmpty(),
                check('id', "ID is required and must be numeric").isNumeric()
            ]
        }

        case 'deleteNotes': {
            return [
                body('id', "Note ID is required").notEmpty()
            ]
        }

        case 'tskPriorityApi': {
            return [
                body('priorityName', "Priority name is required").notEmpty()
            ]
        }

        case 'tskStatusApi': {
            return [
                check('statusName', "Status name is required").notEmpty()
            ];
        }

        case 'createTaskCategory': {
            return [
                check('tskCategoryName', "Task Category Name is required").notEmpty()
            ];
        }

        case 'createTask': {
            return [
                body('taskName', "Task name is required").notEmpty(),
                body('startDate', "Start date is required").notEmpty(),
                body('categoryId', "Category ID is required").notEmpty()
            ];
        }

        case 'taskAssignUserList': {
            return [
                body('taskId', "Task ID is required").notEmpty()
            ];
        }

        case 'projectApi': {
            return [
                check('proName', "Project name is required").notEmpty(),
                check('startDate', "Start date is required").isDate()
            ]
        }

        case 'addClient': {
            return [
                check('clientName', "Client Name is required").notEmpty()
            ]
        }

        case 'projectAssign': {
            return [
                body('userId', "Enter user ids").isArray().notEmpty()
            ]
        }

        case 'proAssignUserList': {
            return [
                body('proId', "Enter project id").not().isEmpty()
            ]
        }
    }
}