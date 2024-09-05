// uploadMiddleware.js
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Import CSV file
// Check if the uploads directory exists, if not, create it
const uploadDir = path.join(__dirname, '../uploads/');  // const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {  // Check if the uploads directory exists
    fs.mkdirSync(uploadDir);  // Create the uploads directory if it doesn't exist
}

// Configure Multer storage
const storage = multer.diskStorage({  // diskStorage: configures how and where the uploaded files will be stored on the disk
    destination: (req, file, cb) => {
        cb(null, uploadDir);  // Specify the directory where the uploaded files will be stored
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);   // Generate a unique filename using the current timestamp and the original file name
    }
});

// Create Multer instance with the storage configuration
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Accept CSV files only
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only CSV files are allowed.'));
        }
    }
});

module.exports = upload;