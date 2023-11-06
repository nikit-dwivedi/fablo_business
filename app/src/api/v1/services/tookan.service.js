const axios = require('axios');


async function createMultiPickupDelivery(deliveryData) {
    try {
        console.log("request body ==>", deliveryData);
        const resp = await axios.post('https://api.tookanapp.com/v2/create_multiple_tasks', deliveryData, { headers: { 'Content-Type': 'application/json' } });
        return resp.data;
    } catch (error) {
        console.log("tookan error ==>", error.message);
        return {
            status: false
        }
    }

}

async function getAgentDetails(agentData) {
    try {
        const resp = await axios.post('https://api.tookanapp.com/v2/view_fleet_profile', agentData, { headers: { 'Content-Type': 'application/json' } });
        if (resp) {
            return {
                name: resp.data.data.fleet_details[0].first_name + " " + resp.data.data.fleet_details[0].last_name,
                phone: resp.data.data.fleet_details[0].phone,
                image: resp.data.data.fleet_details[0].fleet_image,
                thumbImage: resp.data.data.fleet_details[0].fleet_thumb_image
            }
        } else {
            return {}
        }

    } catch (error) {
        return {}
    }
}

async function createTransaction(transactionData) {
    try {
        const resp = await axios.post('https://api.tookanapp.com/v2/fleet/wallet/create_transaction', transactionData, { headers: { 'Content-Type': 'application/json' } });

        if (resp) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}

module.exports = {
    createMultiPickupDelivery,
    getAgentDetails,
    createTransaction
}

