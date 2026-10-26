const express = require('express');
const Joi = require('joi');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');

const productRouter = express.Router();

let items = [];
let lastId = 1;

const categories = ['electronics', 'clothing', 'food', 'other'];

const fullSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  price: Joi.number().greater(0).required(),
  category: Joi.string().valid(...categories).required(),
  stock: Joi.number().integer().min(0).default(0),
  description: Joi.string().max(500)
});

const patchSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  price: Joi.number().greater(0),
  category: Joi.string().valid(...categories),
  stock: Joi.number().integer().min(0),
  description: Joi.string().max(500)
}).min(1);

productRouter.get('/', (req, res) => {
  let result = items;
  if (req.query.category) {
    result = result.filter((p) => p.category === req.query.category);
  }
  if (req.query.minPrice) {
    result = result.filter((p) => p.price >= Number(req.query.minPrice));
  }
  if (req.query.maxPrice) {
    result = result.filter((p) => p.price <= Number(req.query.maxPrice));
  }
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const start = (page - 1) * limit;
  res.json({
    data: result.slice(start, start + limit),
    total: result.length,
    page: page,
    limit: limit
  });
});

productRouter.get('/:id', (req, res) => {
  const item = items.find((p) => p.id === Number(req.params.id));
  if (!item) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(item);
});

productRouter.post('/', validate(fullSchema), (req, res) => {
  const item = {
    id: lastId++,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  items.push(item);
  res.status(201).json(item);
});

productRouter.put('/:id', validate(fullSchema), (req, res) => {
  const index = items.findIndex((p) => p.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  const old = items[index];
  items[index] = {
    id: old.id,
    ...req.body,
    imageUrl: old.imageUrl,
    createdAt: old.createdAt
  };
  res.json(items[index]);
});

productRouter.patch('/:id', validate(patchSchema), (req, res) => {
  const item = items.find((p) => p.id === Number(req.params.id));
  if (!item) {
    return res.status(404).json({ error: 'Product not found' });
  }
  Object.assign(item, req.body);
  res.json(item);
});

productRouter.delete('/:id', (req, res) => {
  const index = items.findIndex((p) => p.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  items.splice(index, 1);
  res.status(204).send();
});

productRouter.post('/:id/image', upload.single('image'), (req, res) => {
  const item = items.find((p) => p.id === Number(req.params.id));
  if (!item) {
    return res.status(404).json({ error: 'Product not found' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'File is required' });
  }
  item.imageUrl = '/uploads/products/' + req.file.filename;
  res.json(item);
});

module.exports = productRouter;
