const { db } = require('../config/firebase');

// @desc    Create a product
// @route   POST /api/products
// @access  Public
const createProduct = async (req, res, next) => {
  try {
    const { name, price, description, category } = req.body;
    const productRef = db.collection('products').doc();
    
    const newProduct = {
      id: productRef.id,
      name,
      price,
      description: description || '',
      category: category || 'general',
      createdAt: new Date().toISOString()
    };

    await productRef.set(newProduct);
    res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getAllProducts = async (req, res, next) => {
  try {
    const productsSnapshot = await db.collection('products').get();
    const products = [];
    productsSnapshot.forEach(doc => {
      products.push(doc.data());
    });
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const productDoc = await db.collection('products').doc(req.params.id).get();
    if (!productDoc.exists) {
      res.status(404);
      throw new Error('Product not found');
    }
    res.status(200).json(productDoc.data());
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Public
const updateProduct = async (req, res, next) => {
  try {
    const productRef = db.collection('products').doc(req.params.id);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      res.status(404);
      throw new Error('Product not found');
    }

    const updatedData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    await productRef.update(updatedData);
    res.status(200).json({ id: req.params.id, ...updatedData });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Public
const deleteProduct = async (req, res, next) => {
  try {
    const productRef = db.collection('products').doc(req.params.id);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      res.status(404);
      throw new Error('Product not found');
    }

    await productRef.delete();
    res.status(200).json({ message: 'Product deleted successfully', id: req.params.id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
