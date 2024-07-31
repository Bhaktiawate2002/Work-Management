const { check, body } = require('express-validator');

exports.validate = (method) => {
    switch (method) {
        case 'signup': {
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
    }
}