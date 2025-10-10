const multer = require("multer");
const {CloudinaryStorage} = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const path = require("path");

// Configuration de stockage pour Multer avec Cloudinary
const storage = new CloudinaryStorage({
    cloudinary,
    params: (req, file) => {
        const folderPath = "alerts";
        const fileExtension = path.extname(file.originalname).substring(1);
        const publicId = `${file.fieldname}-${Date.now()}`;

        return {
            folder: folderPath,
            public_id: publicId,
            format: fileExtension,
            resource_type: "auto",
            upload_preset: "alertes",
        };
    },
});

const upload = multer({storage});

module.exports = upload;