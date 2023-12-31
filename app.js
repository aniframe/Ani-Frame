process.noDeprecation = true;

const express = require('express');
const mongoose = require('./src/config/mongoDB');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();

app.use(bodyParser.json());
app.use(cors());
const publicFolderPath = path.join(__dirname, 'src', 'public');
app.use(express.static(publicFolderPath));
// Custom middleware to log API requests
app.use((req, res, next) => {
    console.log(`API Request: ${req.method} ${req.originalUrl}`);
    next();
});

const basic_routes = require('./src/routes/basic_routes');
const admin_basic_routes = require('./src/routes/admin_basic_routes');
const category_routes = require('./src/routes/category_routes');
const product_routes = require('./src/routes/product_routes');
const cart_routes = require('./src/routes/cart_routes');
const address_routes = require('./src/routes/address_routes');
const order_routes = require('./src/routes/order_routes');

app.use('/basic', basic_routes);
app.use('/admin', admin_basic_routes);
app.use('/category', category_routes);
app.use('/product', product_routes);
app.use('/cart', cart_routes);
app.use('/address', address_routes);
app.use('/order', order_routes);

app.listen(process.env.PORT, () => {
    console.log('server is listening on port 3000');
});