import cloudinary from "../lib/cloudinary.js";
import {redis} from "../lib/redis.js";
import Product from "../models/product.model.js";


export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json({products});
    } catch (error) {
        console.log("Error in getting products", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }

};


export const getFeaturedProducts = async (req, res) => {
    try {
        let featuredProducts = await redis.get("featuredProducts");
        if (featuredProducts) {
            console.log("Featured products fetched from cache");
            return res.json(JSON.parse(featuredProducts));
        }
        // if not in redis, fetch from mongodb
        //.lean() return a plain js object instead of mongoose document
        //good for performance
        featuredProducts = await Product.find({ isFeatured: true }).lean()
        if(!featuredProducts) {
            return res.status(404).json({message:"No featured products found"});
        }
       // store in redis for future quick access
        await redis.set("featuredProducts", JSON.stringify(featuredProducts));
        res.json({featuredProducts});
    } catch (error) {
        console.log("Error in getting featured products", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const {name, description, price, image, category} = req.body;

        let cloudinaryResponse = null
        if(image){
           cloudinaryResponse = await cloudinary.uploader.upload(image, {folder: "products"})
        }
        const product = await Product.create({
            name,
            description,
            price,
            image: cloudinaryResponse?.secure_url? cloudinaryResponse.secure_url : " ",
            category,


        })
        res.status(201).json(product);
    } catch (error) {
        console.log("Error in creating product", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        if (product.image) {
            const publicId = product.image.split("/").pop().split(".")[0]; 
            try {
                await cloudinary.uploader.destroy(`products/${publicId}`)
                console.log("Image deleted from Cloudinary");
            } catch (error) {
                console.log("Error deleting image from Cloudinary:", error);
            }
        }
        await Product.findByIdAndDelete(req.params.id)
        res.json({ message: "Product deleted successfully" });
    } catch (error) {
       console.log("Error in deleting product", error.message);
       res.status(500).json({ message: "Server Error", error: error.message }); 
    }
};

export const getRecommendedProducts = async (req, res) => {
    try {
        const products = await Product.aggregate([
            { 
                $sample: { size: 3 }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    price: 1,
                    image: 1
                }
            }
        
        ]);
        res.json({products});
    } catch (error) {
        console.log("Error in getting recommended products", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const getProductByCategory = async (req, res) => {
    const {category} = req.params;
    try {
        const products = await Product.find({category});
        res.json( {products} );
    } catch (error) {
        console.log("Error in getting products by category", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const toggleFeaturedProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) { // CHANGE: Check if product exists
            product.isFeatured = !product.isFeatured;
            const updatedProduct = await product.save();
            await updateFeaturedProductsCache();
            res.json(updatedProduct);
        } else { // CHANGE: If no product, send 404
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        console.log("Error in toggling featured product", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

async function updateFeaturedProductsCache() {
    try {
        //. lean is used to return plain js object instead of mongoose document for better performance
        const featuredProducts = await Product.find({ isFeatured: true }).lean();
        await redis.set("featuredProducts", JSON.stringify(featuredProducts));
    } catch (error) {
        console.log("Error in updating featured products cache:");
    }
}