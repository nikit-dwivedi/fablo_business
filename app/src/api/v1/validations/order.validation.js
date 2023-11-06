const { body, param } = require('express-validator')

const MyTypes = {
  user: "USER",
  merchant: "MERCHANT"
}

exports.validateTask = (method) => {
  switch (method) {
    case 'createTask': {
      return [
        body('documentId', 'Document Id is Required').not().isEmpty().trim().escape()
      ]
    }
    case 'updateTask': {
      return [
        body('order_id', 'Order ID is Required').not().isEmpty().trim().escape(),
        param('status', 'Status is Required').not().isEmpty().trim().escape()
      ]
    }
  }
}

exports.validateRate = (method) => {
  switch (method) {
    case 'calculateRate': {
      return [
        body('userId', 'User Id is Required').not().isEmpty().trim().escape(),
        body('documentId', 'Document Id is Required').not().isEmpty().trim().escape(),
        body('userType', 'User Type is Required').isIn(['user', 'merchant']),
        body('cityId', 'City ID is Required').not().isEmpty().trim().escape(),
        body('category', 'Category is Required').isIn(['parcel', 'food']),
        body('subCategory', 'Sub Category is Required').isIn(['normal', 'express'])
      ]
    }
    case 'checkRate': {
      return [
        body('userId', 'User Id is Required').not().isEmpty().trim().escape(),
        body('pikcupLatitude', 'Pickup latitude is Required').exists(),
        body('pickupLongitude', 'Pickup longitude is Required').exists(),
        body('dropLatitude', 'Drop latitude is Required').exists(),
        body('dropLongitude', 'Drop longitude is Required').exists(),
        body('userType', 'User Type is Required').isIn(['user', 'merchant']),
        body('cityId', 'City ID is Required').not().isEmpty().trim().escape(),
        body('category', 'Category is Required').isIn(['parcel', 'food']),
        body('subCategory', 'Sub Category is Required').isIn(['normal', 'express'])
      ]
    }
  }
}