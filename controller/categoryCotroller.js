const categorySchema = require('../models/categoryModel')


module.exports = {

    getCategory: async (req, res) => {

        try {

            const categoryData = await categorySchema.find().sort({ date: -1 })
            res.render('admin/category', { category: categoryData, error: req.flash('error') })

        } catch (error) {
            console.log("Error in get category " + error)
        }
    },

    addCategory: async (req, res) => {
        try {
            const categoryDetails = await categorySchema.findOne({
                categoryName: { $regex: new RegExp('^' + req.body.newCategory + '$', 'i') }
            });
            console.log(req.body.newCategory);
            const img = []
            for (let items of req.files) {
                img.push(items.filename)
            }

            if (categoryDetails) {

                req.flash('error', 'Category already exist')
                res.redirect('/category')
            }
            else {
                const catData = new categorySchema({ categoryName: req.body.newCategory, image: img })
                await catData.save()
                res.redirect('/category')
            }

        } catch (error) {
            console.log("Error in adding category " + error);

        }

    },

    getEditCategory: async (req, res) => {
        try {
            const catData = await categorySchema.findOne({ _id: req.params.id })
            if (catData) {

                res.render('admin/editCategory', { catData, error: req.flash('error') })
            }

        } catch (error) {
            console.log("Error in editing category " + error);

        }
    },

    patchEditCategory: async (req, res) => {
        try {

            const catData = await categorySchema.findOne({ _id: req.params.id })
            const newCategoryName = req.body.categoryName
            const regex = new RegExp(newCategoryName, 'i');
            const categoryData = await categorySchema.findOne({ categoryName: regex })
            if (!categoryData) {
                const catName = await categorySchema.updateOne({ _id: req.params.id }, { $set: { categoryName: req.body.categoryName } })

                res.redirect('/category')
            }
            else {
                req.flash("error", "Cannot edit,Category already exist")
                res.redirect('/category')
            }
        } catch (error) {

            console.log("Error in patch edit " + error);
        }
    },
    deleteCategory: async (req, res) => {
        try {
            const catData = await categorySchema.findOne({ _id: req.params.id })


            await categorySchema.updateOne({ _id: req.params.id }, { $set: { isDeleted: true } })

            res.redirect('/category')

        } catch (error) {
            console.log("Error in deleting category " + error);
        }
    }


}