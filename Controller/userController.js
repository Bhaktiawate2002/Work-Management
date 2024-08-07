const db = require('../Config/dbConfig');
const { Sequelize } = require('sequelize');

const fs = require('fs');
const path = require('path');
let nextBlock;

const transporter = require('../Config/nodemailerConfig');

const { validationResult } = require("express-validator");

const bcrypt = require('bcrypt'); // for hashing the password
const saltRounds = 10;

const multer = require('multer'); // for uploading the photo

//const nodemailer = require('nodemailer'); // sending mail to any user
//const randomstring = require('randomstring'); // generate random token

const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');  // generating random token
const Mp = Sequelize.Op;

const Org = db.orgs;
const User = db.user;
const Dept = db.dept;
const Role = db.role;
const Project = db.project;
const Task = db.task;
const Priority = db.priority;
const Status = db.status;
const Notes = db.notes;
const Client = db.client;
const ProjectAssign = db.projectAssign
const Category = db.category;
const TskAssign = db.tskAssign

// Organisation api
exports.orgRegistration = async (req, res) => {
    const currentDate = new Date(Date.now()).toISOString().split('T')[0];

    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(200).json({ message: errors.array()[0].msg });
    }

    try {
        const emailExist = await Org.findOne({ where: { orgEmail: req.body.email } });
        if (emailExist) {
            res.status(200).json({ success: 0, message: "Email already exists" });
        } else {
            bcrypt.genSalt(saltRounds, async function (err, salt) {
                if (err) {
                    return res.status(200).json({ success: 0, message: err.message });
                }
                bcrypt.hash(req.body.password, salt, async function (err, hash) {
                    if (err) {
                        return res.status(200).json({ success: 0, message: err.message });
                    }
                    try {
                        const theData = await Org.create({
                            orgName: req.body.name,
                            orgEmail: req.body.email,
                            contact: req.body.contact,
                            address: req.body.address,
                            password: hash
                        });
                        if (theData) {
                            await User.create({
                                name: req.body.name,
                                email: req.body.email,
                                address: req.body.address,
                                contact: req.body.contact,
                                joinDate: currentDate,
                                password: hash,
                                roleId: 1,
                                deptId: 10,
                                orgId: theData.id,
                                isSuperAdmin: 1
                            });
                            theData.password = undefined;
                            res.status(200).json({ dataIs: theData, message: "Organization table data added successfully" });
                        } else {
                            res.status(200).json({ message: "Failed to add Organization" });
                        }
                    } catch (error) {
                        res.status(200).json({ success: 0, message: error.message });
                    }
                });
            });
        }
    } catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message });
    }
}

// Employee register api
// userController.js
exports.registerUserApi = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json({ message: errors.array()[0].msg });
        }

        const emailExist = await User.findOne({ where: { email: req.body.email } });
        if (emailExist) {
            return res.status(200).json({ success: 0, message: "Email Already Exists" });
        }

        bcrypt.genSalt(saltRounds, async function (err, salt) {
            if (err) {
                return res.status(500).json({ success: 0, message: err.message });
            }

            bcrypt.hash(req.body.password, salt, async function (err, hash) {
                if (err) {
                    return res.status(500).json({ success: 0, message: err.message });
                }

                const inputData = await User.create({
                    name: req.body.name,
                    gender: req.body.gender,
                    email: req.body.email,
                    address: req.body.address,
                    contact: req.body.contact,
                    dob: req.body.dob,
                    joinDate: req.body.joinDate,
                    password: hash,
                    roleId: req.body.roleId,
                    deptId: req.body.deptId,
                    orgId: req.body.orgId
                });

                inputData.password = undefined;
                return res.status(200).json({ success: 1, message: "user table data added successfully" });
            });
        });
    } catch (error) {
        console.log(error);
        return res.status(200).json({ success: 0, message: error.message });
    }
}

// User login api 
exports.userLogin = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(200).json({ message: errors.array()[0].msg });
            return;
        }

        const emailExist = await User.findOne({
            where: { email: req.body.email }
        });

        if (!emailExist) {
            res.status(200).json({ message: "User does not exist" });
        } else {
            bcrypt.compare(req.body.password, emailExist.password, (err, result) => {
                if (err) throw err;

                if (result) {
                    emailExist.password = undefined;
                    return res.status(200).json({ success: 1, msg: "Login success", data: emailExist });
                } else {
                    return res.status(200).json({ success: 0, msg: "Invalid credential" });
                }
            });
        }
    } catch (error) {
        console.log(error);
        res.status(200).json({ message: error.message });
    }
}

// Forgot Password - Generate token and send reset link 
exports.forgotPassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json({ message: errors.array()[0].msg });
        }

        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate reset token and expiry
        const resToken = uuidv4();
        const resTokenExpiry = Date.now() + 3600000; // 1 hour

        // Update user with reset token and expiry
        await user.update({ resToken, resTokenExpiry });

        // TODO: Send reset link to user's email (use nodemailer or similar)

        // send mail with defined transport object
        const info = await transporter.sendMail({
            from: 'bhaktiawate0@gmail.com', // sender address
            to: email, // list of receivers
            subject: "Password Reset Link :- ",
            text: `You are receiving this because you have requested the reset of the password for your account.\n\n`, // plain text body

            html: `<b>PASSWORD RESET LINK :- </b>\n\n`

                + `http://${req.headers.host}/resetPassword/${resToken}\n\n`

                + `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        });
        console.log("Email Sent:%s", info.messageId);

        res.status(200).json({ message: 'Reset link sent successfully' });

    } catch (err) {
        console.error(err);
        res.status(200).json({ message: 'Server Error' });
    }
};

// Reset Password - Validate token and update password
exports.resetPassword = async (req, res) => {
    try {
        // Validate the incoming request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json({ message: errors.array()[0].msg });
        }

        const { token, newPassword } = req.body;

        const user = await User.findOne({
            where: {
                resToken: token,
                resTokenExpiry: { [Op.gt]: Date.now() },
            }
        });

        if (!user) {
            return res.status(200).json({ message: 'Invalid or expired token' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password and clear reset token fields
        await user.update({
            password: hashedPassword,
            resToken: null,
            resTokenExpiry: null,
        });
        res.json({ message: 'Password reset successful' });
    } catch (err) {
        console.error(err);
        res.status(200).json({ message: 'Server Error' });
    }
};

// Change password
exports.changePassword = (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json({ message: errors.array()[0].msg });
        }

        User.findOne({
            where: {
                id: req.body.userId
            }
        })
            .then(async (User) => {
                if (User) {
                    const passwordIsValid = bcrypt.compareSync(
                        req.body.oldPassword,
                        User.password
                    );
                    if (!passwordIsValid) {
                        return res.status(200).json({ success: 0, message: "Old Password does not match!" });
                    }

                    const { newPassword, confirmPassword } = req.body;

                    if (newPassword !== confirmPassword) {
                        return res.status(200).json({ success: 0, message: "Confirmation password does not match new password" });
                    }

                    await User.update({
                        password: bcrypt.hashSync(newPassword, 10)
                    }, {
                        where: { id: req.body.userId }
                    });

                    return res.status(200).json({ success: 1, message: "Password Changed Successfully" });
                } else {
                    res.status(200).json({ success: 0, message: "User Not found." });
                }
            })
            .catch(err => {
                res.status(200).json({ message: err.message });
            });
    } catch (err) {
        return next(err);
    }
};

// Profile_Pic Upload by using MULTER 
var storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const directory = `./Public/`//${req.query.userId}
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true })
        }

        cb(null, directory)
    },
    filename: function (req, file, callback) {

        const ext = file.mimetype.split('/')[1];
        callback(null, `User-${Date.now()}.${ext}`);
    }
});

var upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 },
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
            req.fileValidationError = 'Only image files are allowed!';
            return cb(null, false);
        }
        cb(null, true);
    }
}).single("profile");

exports.updateProfilePic = async (req, res) => {
    try {
        upload(req, res, async function (err) {
            if (req.fileValidationError) {
                return res.status(200).json({ success: 0, message: req.fileValidationError });
            }
            else if (req.file) {
                const ext = path.extname(req.file.originalname);
                let profilepath = `Public/${Date.now()}${ext}`;
                const profile = `./Public/`;
                const directory = path.join(path.dirname(require.main.filename), profilepath);
                console.log('directory', directory);
                const user = await User.findOne({
                    where: {
                        id: req.body.userId
                    }
                });
                if (user) {
                    const filePath = ("Public", User.profilePic)

                    // if (fs.existsSync(filePath)) {
                    //   fs.unlinkSync(filePath);
                    // } else {
                    //   fs.mkdirSync(profile, { recursive: true });
                    // }
                    // require("fs").writeFile(directory, parseInt(nextBlock, 10).toString(), function (err) { });
                    // req.file.buffer

                    const result = await User.update({
                        profile: profilepath //Date.now() + ext
                    }, {
                        where: {
                            id: req.body.userId
                        }
                    });
                    if (result) {
                        return res.status(200).json({ success: 1, message: "User Profile Updated successfully!" });
                    }
                    else {
                        return res.status(200).json({ success: 0, message: "User Profile Update Failed." });
                    }
                } else {
                    return res.status(200).json({ success: 0, message: "User Not found." });
                }
            }
            else {
                return res.status(200).json({ success: 0, message: "Error while uploading file." });
            }
        });
    } catch (error) {
        res.status(200).json({ message: error.message });
    }
}

// Department create api
exports.deptApi = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json({ message: errors.array()[0].msg });
        }

        // Proceed to create the department if validation passes
        const data1 = await Dept.create({
            deptName: req.body.deptName
        });

        res.status(200).json({ success: 1, data: data1, message: "Department data added successfully" });
    }
    catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message });
    }
}

// Drop down api of dept 
exports.deptList = async (req, res) => {
    try {
        const showData = await Dept.findAll({
            attributes: ['id', 'deptName']
        })
        res.status(200).json({ success: 1, data: showData });
    }
    catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message });
    }
}

// Role create api 
exports.roleApi = async (req, res) => {
    try {
        // Validate the request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ message: errors.array()[0].msg });
            return;
        }

        // Proceed with role creation
        const data2 = await Role.create({
            roleName: req.body.roleName
        });
        res.status(200).json({ success: 1, data: data2, message: "Role data added successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: 0, message: error.message });
    }
}

// Drop down api of role 
exports.roleList = async (req, res) => {
    try {
        const showData = await Role.findAll({
            attributes: ['id', 'roleName']
        })
        res.status(200).json({ success: 1, data: showData });
    }
    catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message });
    }
}

// Show employee details
exports.showEmpDetails = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(200).json({ message: errors.array()[0].msg });
            return;
        } else {
            const { userId } = req.body;
            const showData = await User.findAll({
                attributes: ['id', 'name', 'email', 'gender', 'dob', 'joinDate', 'deptId', 'roleId'],
                include: [
                    {
                        model: Dept, attributes: ['deptName']
                    },
                    {
                        model: Role, attributes: ['roleName']
                    }
                ],
                where: { id: userId },
                raw: true
            });
            res.status(200).json({ success: 1, data: showData });
        }
    } catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message });
    }
}

// Get user Detail 
exports.getUserDetail = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(200).json({ message: errors.array()[0].msg });
            return;
        } else {
            const { userId } = req.body;
            const showData = await User.findAll({
                attributes: ['name', 'email', 'gender', 'dob', 'joinDate', 'address', 'contact', 'profile'],
                include: [
                    {
                        model: Dept, attributes: ['deptName']
                    },
                    {
                        model: Role, attributes: ['roleName']
                    }
                ],
                where: { id: userId },
                raw: true
            });
            if (showData.length !== 0) {
                res.status(200).json({ success: 1, data: showData });
            } else {
                res.status(200).json({ success: 0, data: showData, message: "User not found" });
            }
        }
    }
    catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message });
    }
}

// Update user api 
exports.updateUser = async (req, res) => {
    try {
        const emailExist = await User.findOne({ where: { email: req.body.email } });
        if (!emailExist) {
            res.status(200).json({ success: 0, message: "Can't Update, email not exist" });
        } else {
            bcrypt.genSalt(saltRounds, async function (err, salt) {
                if (err) {
                    throw err;
                }

                bcrypt.hash(req.body.password, salt, async function (err, hash) {
                    if (err) {
                        throw err;
                    }

                    const updateData = await User.update({
                        address: req.body.address,
                        contact: req.body.contact,
                        profile: req.body.profilepic,
                        password: hash
                    },
                        {
                            where: { id: req.body.id },
                        });

                    updateData.password = undefined;
                    res.status(200).json({ success: 1, dataIs: updateData, message: "updated successfully" });
                });
            });
        }
    } catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, errorMsg: error.message });
    }
}

// Delete user api 
exports.deleteUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(200).json({ message: errors.array()[0].msg });
            return;
        } else {
            const deleteData = await User.destroy({
                where: { id: req.body.id },
            });
            res.status(200).json({ success: 1, data: deleteData, message: "deleted successfully" });
        }
    } catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message });
    }
}

// Org list 
exports.orgList = async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(200).json({ message: errors.array()[0].msg });
            return;
        }

        const dataShow = await Org.findAndCountAll({ where: { orgEmail: req.body.orgEmail } });

        if (dataShow.count > 0) {
            res.status(200).json({ showingDetails: dataShow.rows, message: "data shown successfully" });
        } else {
            res.status(200).json({ message: "organisation mail are invalid" });
        }
    } catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message });
    }
};

// Search user api
exports.searchUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(200).json({ message: errors.array()[0].msg });
            return;
        } else {
            const { email, orgId } = await req.body;
            const showData = await User.findAll({
                where: {
                    orgId: orgId,
                    email: { [Op.iLike]: `%${email}%` }
                }
            })
            if (showData.length != 0) {
                res.status(200).json({ success: 1, showingUser: showData, message: "data search successfully" });
            } else {
                res.status(200).json({ success: 0, showingUser: showData, message: "users not found" });
            }
        }
    }
    catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message });
    }
}

// Notes
exports.createNotes = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json({ message: errors.array()[0].msg });
        }

        const data = await User.findOne({ where: { id: req.body.userId } });
        if (!data) {
            return res.status(200).json({ success: 0, message: "User not exist" });
        }
        else {
            const createnote = await Notes.create({
                notesName: req.body.notesName,
                userId: req.body.userId
            });

            res.status(200).json({ success: 1, data: createnote, message: "Notes created successfully" });
        }
    } catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message });
    }
}

// Edit notes
exports.updateNotes = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(200).json({ message: errors.array()[0].msg });
            return;
        } else {
            const data = await Notes.update(
                {
                    notesName: req.body.notesName
                },
                {
                    where: { id: req.body.id },
                }
            );
            res.status(200).json({ success: 1, data: data, message: "Notes updated successfully" });
        }
    } catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message });
    }
};

// Delete notes
exports.deleteNotes = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(200).json({ success: 0, message: errors.array()[0].msg });
            return;
        } else {
            const data = await Notes.destroy({
                where: { id: req.body.id },
            });
            res.status(200).json({ success: 1, data: data, message: "Notes deleted successfully" });
        }
    } catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message });
    }
}

// Create priority 
exports.tskPriorityApi = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(200).json({ message: errors.array()[0].msg });
            return;
        }

        const data = await Priority.create({
            priorityName: req.body.priorityName
        });

        res.status(200).json({ success: 1, data: data, message: "Task Priorities added successfully" });
    }
    catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message });
    }
}


// Task priority list 
exports.tskPriorityList = async (req, res) => {
    try {
        const showData = await Priority.findAll({
            attributes: ['id', 'priorityName']
        })
        res.status(200).json({ success: 1, data: showData });
    }
    catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message });
    }
}

// Create status 
exports.tskStatusApi = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(200).json({ message: errors.array()[0].msg });
            return;
        } else {
            const data = await Status.create({
                statusName: req.body.statusName
            });
            res.status(200).json({ success: 1, data: data, message: "Status data added successfully" });
        }
    } catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message });
    }
}


// Task status list 
exports.tskStatusList = async (req, res) => {
    try {
        const showData = await Status.findAll({
            attributes: ['id', 'statusName']
        })
        res.status(200).json({ success: 1, data: showData });
    }
    catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message });
    }
}

// Create category 
exports.tskCategoryApi = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json({ success: 0, message: errors.array()[0].msg });
        }

        const data = await Category.create({
            tskCategoryName: req.body.tskCategoryName
        });
        res.status(200).json({ success: 1, data: data, message: "Task Category added successfully" });
    }
    catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message });
    }
}


// Task category list 
exports.tskCategoryList = async (req, res) => {
    try {
        const showData = await Category.findAll({
            attributes: ['id', 'tskCategoryName']
        })
        res.status(200).json({ success: 1, data: showData });
    }
    catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message });
    }
}

// Create Task
exports.createTaskApi = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(200).json({ message: errors.array()[0].msg });
            return;
        }

        const data = await Task.create({
            taskName: req.body.taskName,
            taskDesc: req.body.taskDesc,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            priorityId: req.body.priorityId,
            statusId: req.body.statusId,
            proId: req.body.proId,
            userId: req.body.userId,
            categoryId: req.body.categoryId
        });
        res.status(200).json({ success: 1, message: "Task created successfully", data: data });
    } catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message });
    }
}

exports.tskAssign = async (req, res) => {
    const { proId, userId } = req.body;

    try {
        // Validation check
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json({ message: errors.array()[0].msg });
        }

        // Find the task
        // const task = await Task.findOne({ where: { id: taskId } });

        // if (!task) {
        //     return res.status(200).json({ success: 0, error: 'Task not found' });
        // }

        // Assign the task to users
        for (const uId of userId) {
            const develop = await TskAssign.findOne({
                where: { proId: proId, userId: uId }
            });

            if (!develop) {
                await TskAssign.create({
                    proId: proId,
                    userId: uId
                });
            }
        }

        res.status(200).json({ success: 1, data: develop, message: "Task Assigned successfully" });
    } catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message });
    }
};


// User drop down list according to org 
exports.userDropDownList = async (req, res) => {
    try {
        const data = await User.findAll({
            attributes: ['id', 'name'],
            // where: { orgId: req.body.orgId },
        })
        res.status(200).json({ success: 1, data: data });
    } catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message })
    }
}

// Task assign user list
exports.taskAssignUserList = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(200).json({ message: errors.array()[0].msg });
            return;
        }

        const data = await TskAssign.findAll({
            where: {
                taskId: req.body.taskId
            },
            include: {
                model: User, as: 'tblUsers', attributes: ['id', 'name']
            }
        });

        // Extract user data into a flat array
        const userData = data.map(assign => assign.tblUsers);
        res.status(200).json({ success: 1, data: userData, message: "showing assigned user in task" });
    } catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message });
    }
}

//Create project api
exports.projectApi = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(200).json({ success: 0, message: errors.array()[0].msg });
            return;
        }

        const data = await Project.create({
            proName: req.body.proName,
            proDesc: req.body.proDesc,
            startDate: req.body.startDate,
            deadLine: req.body.deadLine,
            proLead: req.body.proLead,
            deptId: req.body.deptId,
            clientId: req.body.clientId,
            orgId: req.body.orgId
        });
        res.status(200).json({ success: 1, data: data, message: "Project created successfully" });
    } catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message });
    }
}

// Project list 
exports.projectList = async (req, res) => {
    try {
        const showData = await Project.findAll({
            attributes: ['id', 'proName']
        })
        res.status(200).json({ success: 1, data: showData });
    }
    catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message });
    }
}

// Add client Api 
exports.addClientApi = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(200).json({ message: errors.array()[0].msg });
            return;
        } else {
            const data = await Client.create({
                clientName: req.body.clientName
            })
            res.status(200).json({ success: 1, data: data, message: "Client Name created successfully" });
        }
    }
    catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message });
    }
}


// Drop down client api 
exports.clientList = async (req, res) => {
    try {
        const showData = await Client.findAll({
            attributes: ['id', 'clientName']
        })
        res.status(200).json({ success: 1, data: showData });
    }
    catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message });
    }
}

// Project assign 
exports.projectAssign = async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json({ message: errors.array()[0].msg });
        }

        const { userId } = req.body;

        // Find the project
        // const project = await Project.findOne({
        //     where: { id: proId }
        // });

        // if (!project) {
        //     return res.status(200).json({ success: 0, error: 'Project not found' });
        // }

        // Assign the project to users
        for (const uId of userId) {
            const develop = await ProjectAssign.findOne({
                where: {
                    userId: uId
                }
            });

            if (!develop) {
                await ProjectAssign.create({
                    userId: uId
                });
            }
        }

        res.status(200).json({ success: 1, message: "Project Assigned successfully" });
    } catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message });
    }
}

// Project assign user list
exports.proAssignUserList = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(200).json({ message: errors.array()[0].msg });
            return;
        }

        // Fetch project assigned users
        const data = await ProjectAssign.findAll({
            where: {
                proId: req.body.proId
            },
            include: {
                model: User, as: 'tblUsers', attributes: ['id', 'name']
            }
        });

        // Extract user data into a flat array
        const userData = data.map(assign => assign.tblUsers);
        res.status(200).json({ success: 1, data: userData, message: "showing assigned user in project" });
    } catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message });
    }
};