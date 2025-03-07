const db = require('../Config/dbConfig');
const { Sequelize } = require('sequelize');
const { QueryTypes } = require('sequelize');

const fs = require('fs');
const path = require('path');

const transporter = require('../Config/nodemailerConfig');

const { validationResult, body } = require("express-validator");

const bcrypt = require('bcrypt'); // for hashing the password
const saltRounds = 10;

const moment = require('moment');
const multer = require('multer'); // for uploading files

const csv = require('csv-parser');
// const upload = require('./upload'); // import multer configuration
// const upload = multer({ dest: 'uploads/' }); // Files will be stored in 'uploads/' directory

//const nodemailer = require('nodemailer'); // sending mail to any user
//const randomstring = require('randomstring'); // generate random token

const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');  // generating random token
const Mp = Sequelize.Op;

const ExcelJS = require('exceljs');

const PDFDocument = require('pdfkit');

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
const ProjectAssign = db.projectAssign;
const OrgUsers = db.orgUser;
const TaskCategory = db.taskCategory;
const TaskAssign = db.taskAssign;

// Organisation api
exports.orgRegistration = async (req, res) => {
    const currentDate = new Date(Date.now()).toISOString().split('T')[0];
    const emailExist = await Org.findOne({ where: { orgEmail: req.body.email } })
    try {
        if (emailExist) {
            res.status(200).json({ success: 0, message: "email Already Exists" });
        } else {
            bcrypt.genSalt(saltRounds, async function (err, salt) {
                bcrypt.hash(req.body.password, salt, async function (err, hash) {
                    const theData = await Org.create({
                        orgName: req.body.name,
                        orgEmail: req.body.email,
                        contact: req.body.contact,
                        address: req.body.address,
                        password: hash
                    })
                        .then(async (theData) => {
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
                                    isSuperAdmin: 1
                                })
                                    .then(async (theData2) => {
                                        if (theData2) {
                                            await OrgUsers.create({
                                                orgId: theData.id,
                                                userId: theData2.id
                                            })
                                        }
                                    })
                                theData.password = undefined;
                                res.status(200).json({ dataIs: theData, message: "Organization table data added successfully" });
                            } else {
                                res.status(200).json({ dataIs: theData, message: "Failed to add Organization" });

                            }
                        })
                })
            })
        }
    }
    catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message });
    }
}

// Employee register api
exports.registerUserApi = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(200).json({ message: errors.array()[0].msg });
            return;
        } else {
            const emailExist = await User.findOne({ where: { email: req.body.email } })
            if (emailExist) {
                res.status(200).json({ success: 0, message: "Email Already Exists" });
            } else {
                bcrypt.genSalt(saltRounds, async function (err, salt) {
                    bcrypt.hash(req.body.password, salt, async function (err, hash) {
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
                        })
                            .then(async (theData) => {
                                if (theData) {
                                    await OrgUsers.create({
                                        orgId: req.body.orgId,
                                        userId: theData.id
                                    })
                                    theData.password = undefined;
                                    res.status(200).json({ success: 1, message: "user table data added successfully", data: theData });
                                }
                            })
                    })
                })
            }
        }
    } catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message });
    }
}

// User login api 
exports.userLogin = async (req, res) => {
    try {
        const emailExist = await OrgUsers.findOne({
            attributes: [
                [Sequelize.col('"tblUser"."name"'), "name"],
                [Sequelize.col('"tblUser"."email"'), "email"],
                [Sequelize.col('"tblUser"."gender"'), "gender"],
                [Sequelize.col('"tblUser"."dob"'), "dob"],
                [Sequelize.col('"tblUser"."joinDate"'), "joinDate"],
                [Sequelize.col('"tblUser"."address"'), "address"],
                [Sequelize.col('"tblUser"."contact"'), "contact"],
                [Sequelize.col('"tblUser"."profile"'), "profile"],
                [Sequelize.col('"tblUser"."password"'), "password"],
                [Sequelize.col('"tblUser"."roleId"'), "roleId"],
                "orgId",
                "userId"
            ],
            include: [
                {
                    model: User,
                    as: "tblUser",
                    where: { email: req.body.email },
                    attributes: []
                }
            ],
            raw: true
        })

        if (!emailExist) {
            res.status(200).json({ success: 0, message: "user does not exist" })
        } else {
            bcrypt.compare(req.body.password, emailExist.password, (err, result) => {
                if (result) {
                    emailExist.password = undefined;
                    return res.status(200).json({
                        success: 1, msg: "Login success", data: emailExist
                    })
                } else {
                    return res.status(200).json({ success: 0, msg: "Invalid credential" })
                }
            })
        }
    } catch (error) {
        console.log(error);
        res.status(200).json({ message: error.message })
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
exports.changePassword = (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(200).json({ message: errors.array()[0].msg });
            return;
        }
        else {
            User.findOne({
                where: {
                    id: req.body.userId
                }
            })
                .then(async User => {
                    // console.log(req.body.UserId);
                    if (User) {
                        var passwordIsValid = bcrypt.compareSync(
                            req.body.oldPassword,
                            User.password
                        );
                        if (!passwordIsValid) {
                            return res.status(200).json({ "success": 0, message: "Old Password does not match!" });
                        }
                        else {
                            var pass1 = req.body.newPassword
                            var pass2 = req.body.confirmPassword

                            if (pass1 != pass2) {
                                return res.status(200).json({ "success": 0, message: "Confirmation password does not match new password" });
                            }
                            else if (pass1 == pass2) {
                                await User.update({
                                    password: bcrypt.hashSync(pass2, 10)
                                },
                                    { where: { id: req.body.userId } })

                                return res.status(200).json({ "success": 1, message: "Password Changed Successfully" });
                            }
                            else {
                                return res.status(200).json({ "success": 0, message: "New password does not match" });
                            }
                        }
                    }
                    else {
                        res.status(200).json({ "success": 0, message: "User Not found." });
                    }
                })
                .catch(err => {
                    res.status(200).json({ message: err.message });
                });
        }
    }
    catch (err) {
        return next(err);
    }
};

// Profile_Pic Upload by using MULTER 
// var storage = multer.diskStorage({
//     destination: async function (req, file, cb) {
//         const directory = `./Public/`//${req.query.userId}
//         if (!fs.existsSync(directory)) {
//             fs.mkdirSync(directory, { recursive: true })
//         }

//         cb(null, directory)
//     },
//     filename: function (req, file, callback) {

//         const ext = file.mimetype.split('/')[1];
//         callback(null, `User-${Date.now()}.${ext}`);
//     }
// });

// var upload = multer({
//     storage: storage,
//     limits: { fileSize: 10000000 },
//     fileFilter: function (req, file, cb) {
//         if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
//             req.fileValidationError = 'Only image files are allowed!';
//             return cb(null, false);
//         }
//         cb(null, true);
//     }
// }).single("profile");

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
        });

        res.status(200).json({ success: 1, data: showData });
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
    const emailExist = await User.findOne({ where: { email: req.body.email } })
    try {
        if (!emailExist) {
            res.status(200).json({ success: 0, message: "Can't Update, email not exist" });
        } else {
            bcrypt.genSalt(saltRounds, async function (err, salt) {
                bcrypt.hash(req.body.password, salt, async function (err, hash) {
                    const updateData = await User.update({
                        name: req.body.name,
                        roleId: req.body.roleId,
                        deptId: req.body.deptId,
                        dob: req.body.dob,
                        gender: req.body.gender,
                        address: req.body.address,
                        contact: req.body.contact,
                    },
                        {
                            where: { id: req.body.id },
                        })
                    updateData.password = undefined;

                    res.status(200).json({ success: 1, dataIs: updateData, message: "updated succesfully" });
                })
            })
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
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(200).json({ message: errors.array()[0].msg });
            return;
        } else {
            const { email, orgId } = await req.body;
            const showData = await User.findAll({
                where: {
                    orgId: orgId,

                    // email: The email field is searched using a case-insensitive LIKE operation (Op.iLike)
                    // The Op.iLike operator is specific to PostgreSQL and performs a case-insensitive match

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

        const data = await TaskCategory.create({
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
        const showData = await TaskCategory.findAll({
            attributes: ['id', 'tskCategoryName']
        })

        res.status(200).json({ success: 1, data: showData });
    }
    catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message });
    }
}

// Create Task and assign
exports.createTaskApi = async (req, res) => {
    try {
        const data = await Task.create({
            taskName: req.body.taskName,
            taskDesc: req.body.taskDesc,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            proId: req.body.proId,
            statusId: req.body.statusId,
            priorityId: req.body.priorityId,
            categoryId: req.body.categoryId
        })

            // task assign to user
            // const proId = req.body.proId;
            // const statusId = 1;
            // for (const uId of req.body.userId) {
            //     const develop = await TaskAssign.findOne({
            //         where:
            //         {
            //             proId: proId,
            //             userId: uId
            //         }
            //     });
            //     if (!develop) {
            //         await TaskAssign.create({
            //             taskId: data.id,
            //             proId: proId,
            //             statusId: statusId,
            //             userId: uId
            //         });
            //     }
            // }
            // res.status(200).json({ success: 1, message: "task created & assigned successfully" });

            .then(async (theData) => {
                // const statusId = 1;
                if (theData) {
                    for (const uId of req.body.userId) {
                        await TaskAssign.create({
                            taskId: theData.id,
                            proId: req.body.proId,
                            userId: uId,
                            statusId: req.body.statusId,
                        }).then(async () => {
                            const userdetails = await User.findOne({
                                where: { id: uId }
                            })
                            // theData.dataValues.userName = userdetails.name
                            // console.log(theData);
                        })
                    }

                    res.status(200).json({ success: 1, data: theData, message: "Task created successfully" });
                }
            })

    } catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message })
    }
}

exports.getTask = async (req, res) => {
    try {
        const showData = await TaskAssign.findAll({
            attributes: ['userId',
                [Sequelize.col('"tblUser"."name"'), "name"],
                [Sequelize.col('"tblTask"."id"'), "id"],
                [Sequelize.col('"tblTask"."taskName"'), "taskName"],
                [Sequelize.col('"tblStatus"."statusName"'), "statusName"],
                [Sequelize.col('"tblTask"."priorityId"'), "priorityId"],
                [Sequelize.col('"tblTask"."endDate"'), "endDate"],
            ],
            include: [
                {
                    model: User,
                    as: "tblUser",
                    attributes: []
                },
                {
                    model: Task,
                    as: "tblTask",
                    attributes: []
                },
                {
                    model: Status,
                    as: "tblStatus",
                    attributes: []
                },
            ],
            // where: { userId: req.body.userId },
        });

        res.status(200).json({ success: 1, data: showData });
    } catch (error) {
        console.log(error);
        res.status(200).json({ message: error.message });
    }
}

// Task list 
exports.getTaskApi = async (req, res) => {
    try {
        const showData = await TaskAssign.findAll({
            attributes: ['userId',
                [Sequelize.col('"tblStatus"."statusName"'), "statusName"],
                [Sequelize.col('"tblUser"."name"'), "name"],
                [Sequelize.col('"tblTask"."id"'), "taskId"],
                [Sequelize.col('"tblTask"."taskName"'), "taskName"],
                [Sequelize.col('"tblTask"."startDate"'), "startDate"],
                [Sequelize.col('"tblTask"."endDate"'), "endDate"],
            ],
            include: [
                {
                    model: Status,
                    as: "tblStatus",
                    attributes: []
                },
                {
                    model: User,
                    as: "tblUser",
                    attributes: []
                },
                {
                    model: Task,
                    as: "tblTask",
                    attributes: []
                }
            ],
            where: ({
                userId: req.body.userId
            }),
            raw: true
        }).then(async (Tasks) => {
            if (Tasks) {
                const presentDate = moment(new Date());
                const momentDate = presentDate.format('YYYY-MM-DD');

                let overdue = 0 // no
                for (const task of Tasks) {
                    // console.log(task.endDate);
                    if (task.statusName == 1 && task.endDate >= momentDate) {
                        overdue = 0 // no
                    } else if (task.statusName == 1) {
                        overdue = 1 //yes
                    }
                    task.overDue = overdue
                }
            }

            res.status(200).json({ success: 1, data: Tasks });
        })
    } catch (error) {
        console.log(error);
        res.status(200).json({ message: error.message });
    }
}

// User drop down list according to org 
exports.userDropDownList = async (req, res) => {
    try {
        const data = await User.findAll({
            attributes: ['id', 'name'],
            where: { orgId: req.body.orgId },
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
        const data = await TaskAssign.findAll({
            attributes: ['userId',
                [Sequelize.col('"tblUser"."name"'), "name"],
                // [Sequelize.col('"tblUser"."id"'), "id"],
            ],
            include: [
                {
                    model: User,
                    as: "tblUser",
                    attributes: []
                },
            ],
            where: { taskId: req.body.taskId }
        });

        // Extract user data into a flat array
        //const userData = data.map(assign => assign.tblUsers);

        res.status(200).json({ success: 1, data: data, message: "showing assigned user in task" });
    } catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message });
    }
}

//Create project and assign api :-
exports.projectApi = async (req, res) => {
    try {
        const data = await Project.create({
            proName: req.body.proName,
            proDesc: req.body.proDesc,
            startDate: req.body.startDate,
            deadLine: req.body.deadLine,
            proLead: req.body.proLead,
            deptId: req.body.deptId,
            clientId: req.body.clientId,
            orgId: req.body.orgId,
            categoryId: req.body.categoryId,
            statusId: 1
        })

            // project assign to user
            // const orgId = req.body.orgId;
            // const clientId = req.body.clientId;
            // const statusId = 1;
            // for (const uId of req.body.userId) {
            //     const develop = await ProjectAssign.findOne({
            //         where:
            //         {
            //             userId: uId
            //         }
            //     });
            //     if (!develop) {
            //         await ProjectAssign.create({
            //             proId: data.id,
            //             orgId: orgId,
            //             clientId: clientId,
            //             userId: uId,
            //             statusId: statusId
            //         });
            //     }
            // }
            //res.status(200).json({ success: 1, data: data, message: "Project created & assigned successfully" });

            .then(async (theData) => {
                const orgId = req.body.orgId;
                const clientId = req.body.clientId;
                const statusId = 1;
                if (theData) {
                    for (const uId of req.body.userId) {
                        await ProjectAssign.create({
                            proId: theData.id,
                            orgId: orgId,
                            clientId: clientId,
                            userId: uId,
                            statusId: statusId
                        }).then(async () => {
                            const userdetails = await ProjectAssign.findOne({
                                where: { id: uId }
                            })
                            // theData.dataValues.userName = userdetails.name
                            // console.log(theData);
                        })
                    }

                    res.status(200).json({ success: 1, data: theData, message: "Project created successfully" });
                }
            })
    }
    catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message })
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

exports.proAssignUserList = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(200).json({ message: errors.array()[0].msg });
            return;
        }
        const data = await ProjectAssign.findAll({
            attributes: [
                [Sequelize.col('"tbl_user"."id"'), "id"],
                [Sequelize.col('"tbl_user"."name"'), "name"],
            ],
            where: {
                proId: req.body.proId
            },
            include:
            {
                model: User, as: 'tblUsers', attributes: []
            }
        });
        // Extract user data into a flat array
        // const userData = data.map(assign => assign.tblUsers);

        res.status(200).json({ success: 1, data: userData, message: "showing assigned user in project" })
    } catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message })
    }
}

// Project List 
exports.getProject = async (req, res) => {
    try {
        const showData = await ProjectAssign.findAll({
            attributes: ['userId',
                [Sequelize.col('"tblClient"."clientName"'), "clientName"],
                [Sequelize.col('"tblUser"."name"'), "name"],
                [Sequelize.col('"tblProject"."id"'), "id"],
                [Sequelize.col('"tblProject"."proName"'), "proName"],
                [Sequelize.col('"tblProject"."startDate"'), "startDate"],
                [Sequelize.col('"tblProject"."deadLine"'), "deadLine"],
            ],
            include: [
                {
                    model: Client,
                    as: "tblClient",
                    attributes: []
                },
                {
                    model: User,
                    as: "tblUser",
                    attributes: []
                },
                {
                    model: Project,
                    as: "tblProject",
                    attributes: []
                }
            ],
            where: ({ orgId: req.body.orgId })
        })

        res.status(200).json({ success: 1, data: showData });
    } catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message });
    }
}

// Delete project :-
exports.deleteProject = async (req, res) => {
    try {
        const deletePro = await Project.destroy(
            {
                where: { id: req.body.id },
            });

        res.status(200).json({ success: 1, data: deletePro, message: "Project deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message });
    }
}

// Update project :-
exports.updateProject = async (req, res) => {
    try {
        const data = await Project.update({
            proName: req.body.proName,
            proDesc: req.body.proDesc,
            startDate: req.body.startDate,
            deadLine: req.body.deadLine,
            deptId: req.body.deptId,
            proLead: req.body.proLead,
            clientId: req.body.proLead
        },
            {
                where: { id: req.body.id },
            })

        res.status(200).json({ success: 1, data: data, message: "Project updated successfully" });
    } catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message });
    }
}

// Dashboard project api
exports.dashProApi = async (req, res) => {
    try {
        const data = await Project.findAndCountAll
    } catch (error) {
        console.log(error);

        res.status(200).json({ success: 0, messag: error.message });
    }
}

// Pie chart of task 
exports.pieTask = async (req, res) => {
    try {
        const data = await TaskAssign.findAll({
            attributes: [
                [Sequelize.col('statusId'), 'statusId'],
                [Sequelize.col('"tblStatus"."statusName"'), "statusName"],
                [Sequelize.fn('COUNT', Sequelize.col('taskId')), 'taskCount']
            ],
            include: [
                {
                    model: Status,
                    as: "tblStatus",
                    attributes: []
                },
            ],
            where: { userId: req.body.userId },
            group: ['statusId', 'tblStatus.statusName'],
        })

        res.status(200).json({ success: 1, data: data });
    } catch (error) {
        console.log(error);
        res.status(200).json({ success: 0, message: error.message })
    }
}

exports.userProfile = async (req, res) => {
    try {
        const userId = req.body.userId; // Assuming user ID is stored in req.user after authentication
        const user = await User.findByPk(userId, {
            attributes: ['profile', 'name', 'deptId', 'roleId', 'id']
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.taskTimer = async (req, res) => {
    try {
        let updateData = null;
        let totalHoursLogged = null;

        // Fetch the task first to ensure it exists
        const task = await Task.findOne({ where: { id: req.body.id } });

        if (!task) {
            return res.status(404).json({
                success: 0,
                message: "Task not found"
            });
        }

        // Check if startTime is provided
        if (req.body.startTime) {
            updateData = await Task.update(
                { startTime: req.body.startTime },
                { where: { id: req.body.id } }
            );
        }

        // Check if pauseTime is provided
        else if (req.body.pauseTime) {

            // Calculate the total hours logged based on startTime and pauseTime
            if (task.startTime && req.body.pauseTime) {
                var startTime = new Date(task.startTime);
                var pauseTime = new Date(req.body.pauseTime);
                var difference = pauseTime.getTime() - startTime.getTime(); // This will give difference in milliseconds
                totalHoursLogged = Math.round(difference / 60000);

                // additionalLoggedTime = Math.round(difference / 60000); // convert to minutes

                // // Accumulate the logged time
                // var newTotalHoursLogged = task.totalHoursLogged + additionalLoggedTime;

                // Update total hours logged in the database
                updateData = await Task.update(
                    { totalHoursLogged: totalHoursLogged, pauseTime: req.body.pauseTime, isPause: 1 },  // The isPause flag is set to 1 to indicate that the task is paused
                    { where: { id: req.body.id } }
                );
            }
        }

        // Check if endTime is provided
        else if (req.body.endTime) {

            // Calculate the total hours logged based on startTime and endTime
            if (task.startTime && req.body.endTime) {
                var startTime = new Date(task.startTime);
                var endTime = new Date(req.body.endTime);
                var difference = endTime.getTime() - startTime.getTime(); // This will give difference in milliseconds
                totalHoursLogged = Math.round(difference / 60000);

                // additionalLoggedTime = Math.round(difference / 60000); // convert to minutes

                // // Accumulate the logged time
                // var newTotalHoursLogged = task.totalHoursLogged + additionalLoggedTime;

                // Update total hours logged in the database
                await Task.update(
                    { totalHoursLogged: totalHoursLogged, endTime: req.body.endTime, isCompleted: 1, },  // The isCompleted flag is set to 1 to indicate that the task is completed
                    { where: { id: req.body.id } }
                );
            }
        }

        res.status(200).json({
            success: 1,
            dataIs: {
                updateData,
                totalHoursLogged  // totalHoursLogged: task.totalHoursLogged + additionalLoggedTime // returning the updated total
            },
            message: "Updated successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: 0, errorMsg: error.message });
    }
};

// Create excel file
exports.excelSheet = async (req, res) => {
    try {
        // Fetch data from the database
        const tasks = await Task.findAll();

        // Create a new workbook and add a worksheet
        const workbook = new ExcelJS.Workbook();  // initializes a new Excel workbook
        const worksheet = workbook.addWorksheet('Tasks');  // creates a new worksheet within the workbook named "Tasks"

        // Add column headers
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Task Name', key: 'taskName', width: 30 },
            { header: 'Task Description', key: 'taskDesc', width: 40 },
            // Add other columns as needed
        ];

        // Add rows to the worksheet
        tasks.forEach(task => {
            worksheet.addRow({
                id: task.id,
                taskName: task.taskName,
                taskDesc: task.taskDesc,
                // Add other columns as needed
            });
        });

        // Set the response header for file download
        res.setHeader('Content-Disposition', 'attachment; filename=tasks.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        // Write to the response stream
        await workbook.xlsx.write(res);  // writes the Excel file directly to the response stream

        res.end();  //  completes the response to finalize the file transfer
    } catch (error) {
        console.error('Error generating Excel file:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Update Token 
exports.editToken = async (req, res) => {
    try {
        const id = req.body.id;
        const resToken = req.body.resToken;

        User.findOne({
            where: {
                id: id
            }
        })
            .then(async user => {
                if (user) {
                    await User.update({
                        resToken: resToken
                    }, { where: { id: id } }
                    )
                        .then(token => {
                            res.status(200).json({ success: 1, message: "Token updated successfully!" });
                        })
                        .catch(err => {
                            res.status(200).json({ success: 0, message: err.message });
                        });
                }
                else {

                    res.status(200).json({ success: 0, message: "User not found." });
                }
            })
            .catch(err => {
                res.status(200).json({ success: 0, message: err.message });
            });
    }
    catch (err) {
        console.error(err);
    }
};

// Function to handle CSV import
exports.importCsv = async (req, res) => {
    const results = [];  // Initialization of results array to store the rows of data read from the CSV file
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const fileStream = fs.createReadStream(req.file.path);  // Creates a readable stream from the uploaded CSV file
        fileStream.pipe(csv())  // The file stream is piped through the csv() function, which parses the CSV data row by row
            .on('data', (data) => results.push(data))
            .on('end', async () => {  // This event is triggered when the entire CSV file has been read and parsed
                try {
                    await Dept.bulkCreate(results);  // `bulkCreate` inserts all rows of data stored in the results array
                    fs.unlinkSync(req.file.path);  // Deletes the file after processing
                    res.status(200).json({ message: 'CSV data imported successfully!' });
                } catch (error) {
                    console.error('Error inserting data into the database:', error);

                    res.status(500).json({ message: 'Failed to import CSV data into the database' });
                }
            });
    } catch (error) {
        console.error('Error reading the CSV file:', error);
        res.status(500).json({ message: 'Failed to process the CSV file' });
    }
};

// exports.addFavProject = async (req, res) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(422).json({ success: 0, message: errors.array()[0].msg });
//       }

//       const { project_id, user_id, is_fav } = req.body;

//       if (is_fav == 1) {
//         await FavProject.create({
//           project_id: project_id,
//           user_id: user_id,
//           is_fav: 1
//         }).then(async result => {
//           return res.status(200).json({ success: 1, message: 'Project marked as favorite successfully' });
//         })
//       }
//       else {
//         await FavProject.findOneAndRemove({
//           project_id: project_id,
//           user_id: user_id
//         }).then(async result => {
//           return res.status(200).json({ success: 1, message: 'Removed favorite successfully' });
//         })
//       }
//     } catch (error) {
//       console.error('Error', error);
//       return res.status(500).json({ success: 0, message: 'Server error' });
//     }
//   }

//   //Update  Company Details
// exports.editCompany = async (req, res) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         res.status(200).json({ message: errors.array()[0].msg });
//         return;
//       }
//       else {
//         var company_id = req.body.company_id

//         Company.findOne({
//           where: {
//             id: company_id
//           }
//         })
//           .then(async company => {
//             if (company) {
//               await Company.update({

//                 company_name: req.body.company_name,
//                 owner_name: req.body.owner_name,
//                 email: req.body.email,
//                 country_code: req.body.country_code,
//                 mobile_no: req.body.mobile_no,
//                 country: req.body.country,
//                 state: req.body.state,
//                 city: req.body.city,
//                 address: req.body.address,
//                 pincode: req.body.pincode,
//                 isActive: 1,
//                 // plan_type: req.body.plan_type,
//                 // subscription_dt: req.body.subscription_dt,
//                 // renewal_dt: req.body.renewal_dt
//               },
//                 {
//                   where: { id: company_id }
//                 })
//                 .then(companies => {
//                   res.status(200).json({ success: 1, message: "Company details updated successfully!" });
//                 })
//                 .catch(err => {
//                   res.status(200).json({ success: 0, message: err.message });
//                 });
//             }
//             else {
//               res.status(200).json({ success: 0, message: "Company Not found." });
//             }

//           })
//           .catch(err => {
//             res.status(200).json({ success: 0, message: "Company Not found." });
//           });
//       }
//     }
//     catch (err) {
//       console.error(err);
//     }
//   };

// Edit user 
exports.editUser = (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(200).json({ message: errors.array()[0].msg });
            return;
        }
        else {
            User.findOne({
                where: {
                    id: req.body.id
                }
            })
                .then(async user => {
                    if (user) {
                        await User.update({
                            name: req.body.name,
                            email: req.body.email,
                            contact: req.body.contact,
                            address: req.body.address,
                            roleId: req.body.roleId,
                        },
                            { where: { id: req.body.id } })
                            .then(user => {
                                TaskAssign.update({
                                    roleId: req.body.roleId,
                                }, {
                                    where: { userId: req.body.userId }
                                })
                                    .then(assignUser => {
                                        res.status(200).json({ success: 1, message: "User updated successfully!" });
                                    })
                                    .catch(err => {
                                        res.status(200).json({ message: err.message });
                                    });
                            })
                            .catch(err => {
                                res.status(200).json({ message: err.message });
                            });
                    }
                    else {
                        res.status(200).json({ success: 0, message: "User Not found." });
                    }
                })
                .catch(err => {

                    res.status(200).json({ success: 0, message: "User Not found." });
                });
        }
    }
    catch (err) {
        res.status(200).json(err);
    }
};

exports.deleteUserApi = async (req, res, next) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }
        const user = await User.findOne({
            where: {
                id: req.body.id
            }
        });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        // Delete task assignments related to the user
        await TaskAssign.destroy({
            where: { userId: req.body.id }
        });
        // Optionally, you could delete the user itself after task deletion
        await user.destroy();

        return res.status(200).json({ message: "User and related task assignments deleted successfully." });
    } catch (err) {
        // Catch any unexpected errors and pass to error handling middleware
        return next(err);
    }
};

exports.getCurrentUser = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg }); // 400 for client-side error
        }

        // Secure query to prevent SQL injection
        const result = await db.sequelize.query(  //  const result = await db.sequelize.query(`SELECT * FROM "tblUsers" WHERE id = ${req.body.id}`, { type: QueryTypes.SELECT });
            `SELECT name, email, contact, address
         FROM "tblUsers" 
        WHERE id = :id`,  // Use :id as placeholder
            {
                replacements: { id: req.body.userId },  // Match the key with the placeholder
                type: QueryTypes.SELECT
            }
        );

        if (result.length !== 0) {
            res.status(200).json({ success: 1, data: result[0] }); // Assuming only one user will be returned
        } else {

            res.status(404).json({ success: 0, message: "User not found." });
        }
    } catch (err) {
        console.error(err); // Log error details for debugging
        res.status(500).json({ success: 0, message: "Server error", error: err.message });
    }
};

// Function to generate PDF
exports.createPdf = (req, res) => {
    // Create a new PDF document
    const doc = new PDFDocument();

    // Set up file path and name
    const fileName = 'generated.pdf';
    const filePath = path.join(__dirname, fileName);

    // Pipe the PDF into a writable stream
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // Add content to the PDF
    doc.fontSize(25).text('Hello, this is a generated PDF file!', 100, 100);

    // Add more content if needed
    doc.text('You can add more text, images, tables, etc.', 100, 150);

    // Add image
    doc.image('path_to_image.jpg', { fit: [250, 300], align: 'center', valign: 'center' });

    // Finalize the PDF and end the stream
    doc.end();

    // Send the file after it's written
    writeStream.on('finish', () => {
        res.download(filePath, (err) => {
            if (err) {
                res.status(500).send('Error in downloading the file');
            } else {
                // Delete the file after download to free up space
                fs.unlinkSync(filePath);
            }
        });
    });
};