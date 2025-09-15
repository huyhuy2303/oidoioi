const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// NOTE: We will set env vars BEFORE requiring modules that read them
let setupDB;
let buildApp;
const Product = require('../../models/product');
const Brand = require('../../models/brand');
const Category = require('../../models/category');

describe('GET /api/product/list (store listing)', () => {
  let mongod;
  let app;

  beforeAll(async () => {
    // Set env BEFORE requiring modules that consume them
    process.env.BASE_API_URL = 'api';
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    process.env.MONGO_URI = uri;

    // Now require setupDB and buildApp so they pick up env
    setupDB = require('../../utils/db');
    buildApp = require('../utils/buildApp');
    await setupDB();

    // seed minimal data
    const cat = await Category.create({
      name: 'Shirts',
      description: 'Tops',
      isActive: true
    });
    const brand = await Brand.create({ name: 'RMIT', isActive: true });
    await Product.create({
      sku: 'SKU123',
      name: 'RMIT Tee',
      description: 'Red tee',
      quantity: 5,
      price: 19.99,
      taxable: true,
      isActive: true,
      brand: brand._id,
      category: cat._id,
      imageUrl: '/images/products/p-1.jpg'
    });

    app = buildApp();
  });

  afterAll(async () => {
    await mongoose.connection.close();
    if (mongod) await mongod.stop();
  });

  test('responds with products array', async () => {
    const res = await request(app)
      .get('/api/product/list')
      .query({ sortOrder: '{"created":-1}', rating: 0, min: 1, max: 999999 });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.products.length).toBeGreaterThanOrEqual(1);
    const names = res.body.products.map(p => p.name);
    expect(names).toContain('RMIT Tee');
  });
});
