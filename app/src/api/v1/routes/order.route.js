const express = require('express');
const router = express.Router();
const { validateTask  , validateRate} = require("../validations/order.validation")

// const {validateTransfer , validateBeneficiary} = require('../validations/payment.validation');

//----------task------------------------------------------------------------------
const taskController = require('../controllers/order/task.controller');
router.post('/task/create', validateTask('createTask'), taskController.createTask)
router.post('/task/update/:status', validateTask('updateTask'), taskController.updateTaskStatus)

//----------rate------------------------------------------------------------------
const rateController = require("../controllers/order/rate.controller");
router.post('/rate/calculate' , validateRate('calculateRate') , rateController.calculateRate)
router.post('/rate/check' , validateRate('checkRate') , rateController.checkRate)


   

module.exports = router;