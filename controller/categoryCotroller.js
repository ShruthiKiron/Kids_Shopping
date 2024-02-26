const categorySchema = require('../models/categoryModel')


module.exports = {

    getCategory : async (req,res) => {
        try {
            const categoryData = await categorySchema.find()
            res.render('admin/category',{category : categoryData})
            
        } catch (error) {
            console.log("Error in get category "+error)
            
        }
     },

     addCategory : async (req,res) => {
        try {
            const categoryDetails = await categorySchema.findOne({categoryName : req.body.newCategory})
            console.log(req.body.newCategory);
            if(categoryDetails){
                
                res.send("Category already exist")
            }
            else{
                const catData =  new categorySchema({categoryName : req.body.newCategory})
                await catData.save()
                res.redirect('/category')
            }
            
        } catch (error) {
            console.log("Error i addin category "+error);
            
        }

     },

     getEditCategory : async (req,res) => {
        try {
            const catData = await categorySchema.findOne({_id : req.params.id})
            if(catData){
                
                res.render('admin/editCategory',{ catData })
            }
            
        } catch (error) {
            console.log("Error in editing category "+error);
            
        }
     },

     patchEditCategory : async (req,res) => { 
        try {
            
            const catData = await categorySchema.findOne({_id : req.params.id})
            const catName = await categorySchema.updateOne({_id : req.params.id},{$set : {categoryName : req.body.categoryName}})
            
            res.redirect('/category')
        } catch (error) {
            
            console.log("Error in patch edit "+ error);
        }
     },
     deleteCategory : async (req,res) => {
        try {
            const catData = await categorySchema.findOne({_id : req.params.id})

            //  console.log("is Deleted "+catData.isDeleted)
            // catData.isDeleted = true
            await categorySchema.updateOne({_id : req.params.id},{$set : {isDeleted : true}})

        //   await categorySchema.findByIdAndDelete({_id : req.params.id})
            res.redirect('/category')
            
        } catch (error) {
            console.log("Error in deleting category "+error);
        }
     }


}