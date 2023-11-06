const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const deliveryRatesModel = require('../models/order/deliveryRates.model');

const serviceAccount = require('../config/firebase.credentials.json');

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

//----------order-----------------------------------------------------------------

async function getOrderDetails(documentId) {
    const Pickup = [];
    const Drop = [];
    const orderReference = db.collection('drafts').doc(documentId)
    const PickupReference = db.collection('drafts').doc(documentId).collection('pickups');
    const DropReference = db.collection('drafts').doc(documentId).collection('drops');

    const orderDetail = await orderReference.get();
    const PickupPoints = await PickupReference.get();
    const DropPoints = await DropReference.get();

    PickupPoints.forEach(pickupDoc => {
        Pickup.push(pickupDoc.data());
    })

    
    DropPoints.forEach(dropDoc => {
        Drop.push(dropDoc.data());
    })

    if (Pickup.length == 0 || Drop.length == 0) {
        return {
            status: false,
            Pickup: Pickup,
            Drop: Drop,
            other: orderDetail.data()
        }
    } else {
        return {
            status: true,
            Pickup: Pickup,
            Drop: Drop,
            other: orderDetail.data()
        }
    }
}

async function updateOrderStatus(documentId, doc) {
    try {
        const orderReference = db.collection('drafts').doc(documentId);
        const res = await orderReference.update(doc);
        return res;
    } catch (error) {
        return false;
    }
}

async function setPartnerDetails(documentId, document) {
    try {
        const orderReference = db.collection('drafts');
        const res = await orderReference.doc(documentId).collection('partnerDetails').doc('details').set(document);
        return res;
    } catch (error) {
        return false;
    }
}

async function getUserNotificationId(documentId) {
    const PickupReference = db.collection('drafts').doc(documentId).collection('pickups');
    const PickupPoints = await PickupReference.get();
    let userId = []
    await PickupPoints.forEach(pickupDoc => {
        let pickupData = pickupDoc.data();
        userId.push(pickupData.uid);
    })

    return userId;
}

async function getOriginDestination(documentId) {
    let Pickup = "";
    let Drop = "";
    let DropIndex = 0;

    const PickupReference = db.collection('drafts').doc(documentId).collection('pickups');
    const DropReference = db.collection('drafts').doc(documentId).collection('drops');

    const PickupPoints = await PickupReference.get();
    const DropPoints = await DropReference.get();

    PickupPoints.forEach(pickupDoc => {
        let pickupData = pickupDoc.data();
        Pickup = Pickup + pickupData.latitude + "%2C" + pickupData.longitude
        // Pickup.push(pickupDoc.data());
    })

    DropPoints.forEach(dropDoc => {
        let dropData = dropDoc.data();
        if (DropIndex == 0) {
            Drop = Drop + dropData.latitude + "%2C" + dropData.longitude
        } else {
            Drop = Drop + "%7C" + dropData.latitude + "%2C" + dropData.longitude
        }
        DropIndex = DropIndex + 1
    })

    if (Pickup == "" || Drop == "") {
        return {
            status: false,
            Pickup: Pickup,
            Drop: Drop
        }
    } else {
        return {
            status: true,
            Pickup: Pickup,
            Drop: Drop
        }
    }

}


//----------rate------------------------------------------------------------------

async function getRateData(cityId, userType, category, subCategory, documentId, userId) {
    try {
        const userRef = db.collection('businesses').doc(userId);
        const userData = await userRef.get();
        const userDetails = userData.data();
        if (userDetails.rateType == "default") {
            const rateDetails = await deliveryRatesModel.findOne({ city_id: cityId, category: category, subCategory: subCategory, user_type: userType }, {})
            if (rateDetails) {
                return {
                    basePay: rateDetails.basePay,
                    minDistance: rateDetails.minDistance,
                    minDistanceRate: rateDetails.minDistanceRate,
                    extraDistanceRate: rateDetails.extraDistanceRate,
                    commissionPercentage: rateDetails.commissionPercentage,
                    discountType: userDetails.discountType,
                    discount: userDetails.discount
                }
            } else {
                return null;
            }
        } else {
            return {
                basePay: userDetails.basePay,
                minDistance: userDetails.minDistance,
                minDistanceRate: userDetails.minDistanceRate,
                extraDistanceRate: userDetails.extraDistanceRate,
                commissionPercentage: userDetails.commissionPercentage,
                discountType: userDetails.discountType,
                discount: userDetails.discount
            }
        }
    } catch (error) {
        return null;
    }
}


//----------config----------------------------------------------------------------

async function getConfiguration(type) {
    const configrRef = db.collection('config').doc(type);
    const configData = await configrRef.get();
    const configDetails = configData.data();
    return configDetails;
}

module.exports = {
    getOrderDetails,
    updateOrderStatus,
    setPartnerDetails,
    getUserNotificationId,
    getOriginDestination,

    getRateData,

    getConfiguration
}