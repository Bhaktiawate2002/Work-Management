const { check, body } = require('express-validator');

exports.validate = (method) => {
    switch (method) {
        case 'registerUserApi': {
            return [
                body('email', 'Email required').exists(),
                check('email', 'Invalid email id').isEmail(),
                check('password', "Invalid Password").notEmpty(),
                check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
                body('password', "Password required"),
            ]
        }

        case 'searchUser': {
            return [
                check('email', "Enter at least one character").isLength({ min: 1 }),
                body('orgId', "Enter organisation id"),
            ]
        }

        case 'proAssignUserList': {
            return [
                body('proId', "Enter project id").not().isEmpty(),
            ]
        }

        case 'projectAssign': {
            return [
                body('proId', "Enter project id").notEmpty(),
                body('userId', "Enter user ids").isArray().notEmpty(),
            ]
        }

        case 'addClient': {
            return [
                check('clientName', "Client Name is required").notEmpty(),
            ]
        }

        case 'projectApi': {
            return [
                check('proName', "Project name is required").notEmpty(),
                check('startDate', "Start date is required").isDate(),
                check('deptId', "Department ID is required").notEmpty(),
                check('orgId', "Organization ID is required").notEmpty()
            ]
        }
    }
}