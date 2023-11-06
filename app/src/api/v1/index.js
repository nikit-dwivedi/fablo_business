const express = require('express');
const router = express.Router();

require("../v1/config/mongodb")

const orderRoute = require('../v1/routes/order.route');
router.use('/order', orderRoute);

module.exports = router;