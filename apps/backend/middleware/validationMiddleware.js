const validateProduct = (req, res, next) => {
  const { name, price, description } = req.body;

  if (!name || !price) {
    res.status(400);
    throw new Error('Name and Price are required fields');
  }

  next();
};

module.exports = { validateProduct };
