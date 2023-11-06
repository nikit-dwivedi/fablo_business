const { success, unknownError, serverValidation, badRequest } = require('../../helpers/response.helper');
const { validationResult } = require('express-validator');
const { createMultiPickupDelivery, getAgentDetails, createTransaction } = require("../../services/tookan.service");
const { getOrderDetails, updateOrderStatus, setPartnerDetails, getUserNotificationId, getConfiguration } = require("../../services/firebase.service");
const { sendNotification } = require("../../services/oneSignal.service");

async function getMessageAndHeading(status) {
    let message = "";
    let heading = "";
    if (status == "pending") {
        heading = "Be patient your order is still pending!";
        message = "We are working on processing your order, please be patient while we accept it.";
    } else if (status == "accepted") {
        heading = "Order accepted.";
        message = "Your order has been accepted. We are excited to deliver your package.";
    } else if (status == "partnerAssigned") {
        heading = "Partner has been assigned.";
        message = "We have assigned an appropriate delivery partner for your order, be patient while we make this delivery done.";
    } else if (status == "wayToPickup") {
        heading = "Delivery partner, on his way to you!";
        message = "Delivery Partner is reaching the pickup location very soon. Are you ready with the package?";
    } else if (status == "reachedPickupAddress") {
        heading = "Reached the pickup address!";
        message = "Delivery partner has reached your pickup location, please drop hand him over the package for the delivery.";
    } else if (status == "pickedUp") {
        heading = "The package has been picked up!";
        message = "Your package has been picked up and the delivery partner is leaving for the drop location.";
    } else if (status == "pickupFailed") {
        heading = "Pick-up failed!";
        message = "This makes us sad, but the pickup failed. You can try placing the order once again.";
    } else if (status == "wayToDrop") {
        heading = "On the way to drop your package!";
        message = "Our delivery partner is on his way to drop your package, please be a little patient with us.";
    } else if (status == "reachedDropAddress") {
        heading = "Reached the drop location!";
        message = "Our delivery partner just reached the drop location. We are excited to complete this delivery.";
    } else if (status == "dropped") {
        heading = "We have dropped the package.";
        message = "Many congratulations to you as we have delivered the package In time and with safety.";
    } else if (status == "dropFailed") {
        heading = "Drop failed";
        message = "We are sad to tell you that the drop was unsuccessful.";
    } else if (status == "cancelByUser") {
        heading = "Order canceled by you!"
        message = "We are upset because we can not understand why did you cancel the order.";
    } else if (status == "cancelByAdmin") {
        heading = "Order canceled by the Admin!"
        message = "There was some technical issue, hence the order got canceled from the admin side. Please try after a while.";
    } else if (status == "cancelByPartner") {
        heading = "Order canceled by delivery partner!"
        message = "Due to some reason, our delivery partner canceled the order. Try to place another order in a while.";
    } else {
        heading = "Delivery was unsuccessful!"
        message = "Unfortunately, the delivery was unsuccessful and this makes us feel very sad.";
    }
    return { heading, message };
}

async function calculateDeliveryCharge(amount) {
    const Configuration = await getConfiguration('delivery');
    const percentage = Configuration.partnerChargePercentage;
    const charge = (amount / 100) * percentage;
    return charge.toFixed(2);
}

module.exports = {

    createTask: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log(errors);
                serverValidation(res, { errorName: "serverValidation", errors: errors.array() })
            } else {
                const draftData = await getOrderDetails(req.body.documentId);
                if (draftData.status == true) {
                    const Configuration = await getConfiguration('delivery');
                    const deliveryData = {
                        "api_key": "53626886f54308434f4b796f4f4e7c471ae7ccf822dc793e5b1d03c9",
                        "timezone": -330,
                        "has_pickup": 1,
                        "has_delivery": 1,
                        "layout_type": 0,
                        "geofence": 0,
                        "auto_assignment": Configuration.orderAssignType,
                        "tags": "",
                        "pickups": draftData.Pickup,
                        "deliveries": draftData.Drop
                    };
                    const deliveryResponse = await createMultiPickupDelivery(deliveryData);
                    if (deliveryResponse.status == 200) {
                        success(res, "Task Created Successfully", deliveryResponse.body);
                    } else {
                        console.log("deliveryResponse ==>", deliveryResponse);
                        badRequest(res, deliveryResponse.message);
                    }
                } else {
                    console.log("draftData ==>", draftData);
                    badRequest(res, "Invalid Details ! Please try Again");
                }
            }
        } catch (error) {
            console.log(error);
            unknownError(res, error);
        }
    },

    updateTaskStatus: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                serverValidation(res, { errorName: "serverValidation", errors: errors.array() })
            } else {
                if (req.params.status == "partnerAssigned") {
                    const agentData = {
                        "api_key": "53626886f54308434f4b796f4f4e7c471ae7ccf822dc793e5b1d03c9",
                        "fleet_id": req.body.fleet_id
                    };
                    const AgentDetails = await getAgentDetails(agentData);
                    await setPartnerDetails(req.body.order_id, AgentDetails)
                } else if (req.params.status == "dropped") {
                    const orderDetails = await getOrderDetails(req.body.order_id);
                    const charge = await calculateDeliveryCharge(Number(orderDetails.other.payableAmount));
                    const transactionData = {
                        api_key: "53626886f54308434f4b796f4f4e7c471ae7ccf822dc793e5b1d03c9",
                        fleet_id: req.body.fleet_id,
                        amount: charge,
                        reference_id: req.body.order_id,
                        transaction_type: 2,
                        wallet_type: 1,
                    }
                    await createTransaction(transactionData);
                }
                const messageDetails = await getMessageAndHeading(req.params.status)
                const userIDArray = await getUserNotificationId(req.body.order_id);
                // await sendNotification(userIDArray, messageDetails);
                const updateStatus = await updateOrderStatus(req.body.order_id, { status: req.params.status });
                if (updateStatus) {
                    success(res, 'Updated Successfully')
                } else {
                    badRequest(res, 'Order not Found')
                }
            }
        } catch (error) {
            console.log(error);
            unknownError(res, error)
        }
    }

};  
