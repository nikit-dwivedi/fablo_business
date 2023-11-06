const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RatesSchema = new Schema({
    category: { type: String, required: [true, 'Category of Rate is Required'], enum: ['parcel'] },
    subCategory: { type: String, required: [true, 'Sub-Category of Rate is Required'], enum: ['normal', 'express'] },
    city_id: { type: String, required: [true, 'City ID is Required'] },
    city_name: { type: String, required: [true, 'City Name is Required'] },
    basePay: { type: Number, required: [true, 'Base Pay is Required'] },
    minDistance: { type: Number, required: [true, 'Minimum Distance is Required'] },
    minDistanceRate: { type: Number, required: [true, 'Minimum Distance Rate is Required'] },
    extraDistanceRate: { type: Number, required: [true, 'Extra Distance Rate is Required'] },
    commissionPercentage: { type: Number, required: [true, 'Commission Percentage is Required'] },
    bagRate: { type: Number, required: [true, 'Bag Rate is Required'] },
    user_type: { type: String, required: [true, 'User Type is Required'], enum: ['user', 'merchant'] },
    status: { type: Number, default: 1 }
});

const DeliveryRates = mongoose.model('DeliveryRates', RatesSchema);

module.exports = DeliveryRates;