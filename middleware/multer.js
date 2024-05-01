const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        return cb(null, path.join(__dirname, '../public/images/productImages'))

    },
    filename: (req, file, cb) => {
        const newName = Date.now() + '-' + file.originalname
        return cb(null, newName)

    }
})

module.exports = multer({ storage: storage })