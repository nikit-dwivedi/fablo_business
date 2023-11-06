const { success, unknownError, serverValidation, badRequest } = require('../../helpers/response.helper');
const { validationResult } = require('express-validator');
const { getOriginDestination, getRateData } = require("../../services/firebase.service");
const { getDistance } = require("../../services/restApi.service");
const deliveryRatesModel = require("../../models/order/deliveryRates.model");


async function calculateRate(distanceData, rateDetails) {

    //rate details
    const minDistance = rateDetails.minDistance;
    const minDistanceRate = rateDetails.minDistanceRate;
    const extraDistanceRate = rateDetails.extraDistanceRate;
    const commissionPercentage = rateDetails.commissionPercentage;
    const discountType = rateDetails.discountType;
    const discountMeta = rateDetails.discount;

    //distance data
    const distance = distanceData.distance.value / 1000;
    const duration = distanceData.duration.text;

    // data to set 
    let basePay = 0;
    let totalAmount = 0;
    let distancePay = 0;
    let discount = 0;
    let commissionAmount = 0;
    let payableAmount = 0;

    //  set Basepay
    basePay = rateDetails.basePay;

    //  set distancePay 
    if (parseFloat(distance) <= minDistance) {
        distancePay = distance * minDistanceRate;
    } else {
        const minDistancePrice = minDistance * minDistanceRate;
        const extraDistance = distance - minDistance;
        const extraDistancePrice = extraDistance * extraDistanceRate;
        distancePay = minDistancePrice + extraDistancePrice;
    }

    //  set commission
    commissionAmount = ((basePay + distancePay) / 100) * commissionPercentage;

    //  set total Amount
    totalAmount = basePay + distancePay + commissionAmount;

    //  set discount
    if (discountType == "fixed") {
        discount = discountMeta;
    } else if (discountType == "float") {
        discount = (totalAmount / 100) * discountMeta;
    }

    //  set payable amount 
    payableAmount = totalAmount - discount;

    return {
        "distance": distance.toFixed(2),
        "duration": duration,
        "basePay": basePay.toFixed(2),
        "totalAmount": totalAmount.toFixed(2),
        "distancePay": distancePay.toFixed(2),
        "discount": discount.toFixed(2),
        "commissionAmount": commissionAmount.toFixed(2),
        "payableAmount": payableAmount.toFixed(2)
    }

    // const distanceInKm = data.distance.value / 1000;
    // const Time = data.duration.text;

    // const BasePay = rateDetails.basePay;
    // const LowDistance = rateDetails.minDistance;
    // const LowDistanceRate = rateDetails.minDistanceRate;
    // const HighDistanceRate = rateDetails.extraDistanceRate;
    // const Commission = rateDetails.commissionPercentage;

    // const DistnaceToTravel = parseFloat(distanceInKm);

    // let Amount = 0;
    // if (DistnaceToTravel <= LowDistance) {
    //     Amount = Amount + (DistnaceToTravel * LowDistanceRate);
    // } else {
    //     const LowDistanceAmount = LowDistance * LowDistanceRate;
    //     const ExtraDistance = DistnaceToTravel - LowDistance;
    //     const ExtraDistanceAmount = ExtraDistance * HighDistanceRate;
    //     Amount = Amount + LowDistanceAmount + ExtraDistanceAmount;
    // }

    // const distanceCharge = Amount.toFixed(2);
    // Amount = Amount + BasePay;
    // const payableAmount = Amount.toFixed(2)
    // const CommissionAmount = (Amount / 100) * Commission;
    // Amount = (Amount + CommissionAmount).toFixed(2);
}

module.exports = {
     
    calculateRate: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                serverValidation(res, { errorName: "serverValidation", errors: errors.array() })
            } else {
                const { cityId, userType, category, subCategory, documentId, userId } = req.body;
                const rateDetails = await getRateData(cityId, userType, category, subCategory, documentId, userId);
                if (rateDetails) {
                    const originDestination = await getOriginDestination(documentId);
                    if (originDestination.status == true) {
                        const query = "?origins=" + originDestination.Pickup + "&destinations=" + originDestination.Drop;
                        const data = await getDistance(query);
                        const responseData = await calculateRate(data, rateDetails);
                        success(res, 'Rate Details', responseData);
                    } else {
                        badRequest(res, 'Invalid Details ! Please try Again');
                    }
                } else {
                    badRequest(res, 'Rate Card Not Found');
                }
            }
        } catch (error) {
            unknownError(res, error);
        }
    },

    checkRate: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                serverValidation(res, { errorName: "serverValidation", errors: errors.array() })
            } else {
                const { cityId, userType, category, subCategory, userId, pikcupLatitude, pickupLongitude, dropLatitude, dropLongitude } = req.body;
                const rateDetails = await getRateData(cityId, userType, category, subCategory, "documentId", userId);
                if (rateDetails) {
                    const query = "?origins=" + pikcupLatitude + "%2C" + pickupLongitude + "&destinations=" + + dropLatitude + "%2C" + dropLongitude;
                    const data = await getDistance(query);
                    const responseData = await calculateRate(data, rateDetails);
                    success(res, 'Rate Details', responseData);
                } else {
                    badRequest(res, 'Rate Card Not Found');
                }
                // const { cityId, userType, category, subCategory, pikcupLatitude, pickupLongitude, dropLatitude, dropLongitude } = req.body;
                // // const { cityId, userType, category, subCategory, pikcupLatitude, pickupLongitude, dropLatitude, dropLongitude , userId} = req.body;
                // const rateDetails = await deliveryRatesModel.findOne({ city_id: cityId, category: category, subCategory: subCategory, user_type: userType }, {})
                // if (rateDetails) {
                //     const query = "?origins=" + pikcupLatitude + "%2C" + pickupLongitude + "&destinations=" + + dropLatitude + "%2C" + dropLongitude;
                //     const data = await getDistance(query);

                //     const distanceInKm = data.distance.value / 1000;
                //     const Time = data.duration.text;

                //     const BasePay = rateDetails.basePay;
                //     const LowDistance = rateDetails.minDistance;
                //     const LowDistanceRate = rateDetails.minDistanceRate;
                //     const HighDistanceRate = rateDetails.extraDistanceRate;
                //     const Commission = rateDetails.commissionPercentage;

                //     const DistnaceToTravel = parseFloat(distanceInKm);

                //     let Amount = BasePay;
                //     if (DistnaceToTravel <= LowDistance) {

                //         Amount = Amount + (DistnaceToTravel * LowDistanceRate);
                //     } else {
                //         const LowDistanceAmount = LowDistance * LowDistanceRate;
                //         const ExtraDistance = DistnaceToTravel - LowDistance;
                //         const ExtraDistanceAmount = ExtraDistance * HighDistanceRate;

                //         Amount = Amount + LowDistanceAmount + ExtraDistanceAmount;
                //     }

                //     const CommissionAmount = (Amount / 100) * Commission;
                //     Amount = (Amount + CommissionAmount).toFixed(2);
                //     success(res, 'Rate Details', { distanceInKm, Amount, Time });

                // } else {
                //     badRequest(res, 'Rate Details Not Found');
                // }
            }
        } catch (error) {
            unknownError(res, error);
        }
    }

};