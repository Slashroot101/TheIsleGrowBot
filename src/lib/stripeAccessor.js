const {stripeSecret} = require('../config');
const stripe = require('stripe')(stripeSecret);

exports.createOrUpdateCustomer = async (stripeId, email, metadata, name) => {
  const customer = await stripe.customers.create({
    email, metadata, name
  });

  return customer;
};

