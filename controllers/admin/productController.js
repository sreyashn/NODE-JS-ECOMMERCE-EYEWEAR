const Product = require("../../model/productModel");
const path=require('path')
const sharp=require('sharp')
const Category = require("../../model/categoryModel");
const User=require("../../model/userModel");
const { log } = require("console");

const loadProducts = async (req, res) => {
    try {
      const products = await Product.find();
      const categories = await Category.find();
      res.render("admin/products", { products, categories });
    } catch (error) {
      console.log(error.message);
    }
  };

  const addProductForm = async (req, res) => {
    try {
      const userData = await User.findById({ _id: req.session.admin_id });
      let categories = await Category.find({});
      res.render("admin/addProduct", { admin: userData,category:categories });
    } catch (error) {
      console.log(error.message);
    }
  };

  
const addProduct = async (req, res) => {
  try {
    const imageData = [];
    const imageFiles = req.files;

    for (const file of imageFiles) {
      console.log(file, "File received");

      const randomInteger = Math.floor(Math.random() * 20000001);
      const imageDirectory = path.join('public', 'admin-assets', 'imgs', 'product');
      const imgFileName = "cropped" + randomInteger + ".jpg";
      const imagePath = path.join(imageDirectory, imgFileName);

      
      const croppedImage = await sharp(file.path)
        .resize(580, 320, {
          fit: "cover",
        })
        .toFile(imagePath);

      if (croppedImage) {
        imageData.push(imgFileName);
      }
    }

    const { name, category, price, stock, description } = req.body;
    const sizedata = req.body.sizes;
    
    const addProducts = new Product({
      name,
      category,
      price,
      stock,
      description,
      sizes: sizedata,
      image: imageData,
    });
console.log("Product:",addProducts);
    await addProducts.save();
    res.redirect("/admin/products");
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Error while adding product");
  }
};


const loadEditproduct = async (req, res) => {
  try {
    const id = req.query.id;
    const product = await Product.findOne({ _id: id });
    let categories = await Category.find({});
    if (product) {
      res.render("admin/editProduct", { categories, product });
    } else {
      res.redirect("/admin/products");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const editProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.body.product_id  });
    let images=[],deleteData=[]

    const {
      name,
      category,
      price,
      description,
      stock
    } = req.body;

    const sizedata = req.body.sizes;
    if (req.body.deletecheckbox) {
   
      deleteData.push(req.body.deletecheckbox); 
     
     
      
      deleteData = deleteData.flat().map(x=>Number(x))
      
      images = product.image.filter((img, idx) => !deleteData.includes(idx));
    }else{
      images = product.image.map((img)=>{return img});
    }
    if(req.files.length!=0){
      for (const file of req.files) {
        console.log(file, "File received");
  
         const randomInteger = Math.floor(Math.random() * 20000001);
         const imageDirectory = path.join('public', 'admin-assets', 'imgs', 'product');
         const imgFileName = randomInteger + ".jpg";
        const imagePath = path.join(imageDirectory, imgFileName);
  
        console.log(imagePath, "Image path");
 
  
  try {
    const croppedImage = await sharp(file.path)
      .resize(580, 320, { fit: "cover" })
      .toFile(imagePath);
  
    if (croppedImage) {
      images.push(imgFileName);
    }
  } catch (err) {
    console.error("Error during image processing:", err);
  }
  
      }
  
    }

 
    await Product.findByIdAndUpdate(
      { _id: req.body.product_id },
      {
        $set: {
          name,
          category,
          price,
          description,
          stock,
          image:images,
        },
      }
    );
    res.redirect("/admin/products");
  } catch (error) {
    console.log(error.message);
  }
};


const deleteProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const productData = await Product.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          is_listed: false,
        },
      }
    );
    res.redirect("/admin/products");
  } catch (error) {
    console.log(error.message);
  }
};


module.exports = {
    loadProducts,
    addProductForm,
    addProduct,
    loadEditproduct,
    editProduct,
    deleteProduct 
};