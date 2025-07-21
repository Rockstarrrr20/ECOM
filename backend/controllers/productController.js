import { v2 as cloudinary} from "cloudinary";
import productModel from "../models/productModel.js"

//function for add product
const addProduct = async (req,res) => {

try {

    const {name,price, description, category, subCategory, sizes, bestseller} = req.body
   
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ success: false, message: "No files uploaded" });
    }
    const image1 = req.files.image1 ? req.files.image1[0] : null;
    const image2 = req.files.image2 ? req.files.image2[0] : null;
    const image3 = req.files.image3 ? req.files.image3[0] : null;
    const image4 = req.files.image4 ? req.files.image4[0] : null;

    const images = [image1,image2,image3,image4].filter((item)=> item !== undefined)

    let imagesUrl = await Promise.all(
        images.map(async (item) => {
            if(!item) return null;
            let result = await cloudinary.uploader.upload(item.path,{resource_type:'image'});
            return result.secure_url
        })
    )

   const productData = {
    name,
    description,
    category,
    price: Number(price),
    subCategory,
    bestseller: bestseller === "true" ? true : false,
    sizes:JSON.parse(sizes),
    image: imagesUrl,
    date:Date.now()
   }
   console.log(productData);
   const product = new productModel(productData);
   await product.save()

    res.json({ success: true, message: "Product added successfully" });

    
} catch (error) {
    console.error("Error in addProduct:", error);
        res.status(500).json({ success: false, message: error.message });
     
}

}

//function for list products 
const listProducts = async (req,res) => {

    try {
        
        const products = await productModel.find({});
        res.json({success:true,products})
    } catch (error) {
        console.error("Error in ListProduct:", error);
        res.status(500).json({ success: false, message: error.message });
 
        
    }
    
}

//function for removing product
const removeProduct = async (req,res) => {

    try {
        await productModel.findByIdAndDelete(req.body.id)
        res.json({success:true,message:"Product Removed"})
        
    } catch (error) {
        console.error("Error in RemoveProduct:", error);
        res.status(500).json({ success: false, message: error.message });        
    }    
}

//function for single product info
const singleProduct = async (req,res) => {

    try {
        const { productId} = req.body
        const product = await productModel.findById(productId)
        res.json({success:true,product})
    } catch (error) {
        console.error("Error in ProductInfo:", error);
        res.status(500).json({ success: false, message: error.message });

     }    
}

export {listProducts,addProduct,removeProduct,singleProduct}