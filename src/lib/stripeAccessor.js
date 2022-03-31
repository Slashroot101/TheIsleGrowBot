const {stripeSecret} = require('../config');
const stripe = require('stripe')(stripeSecret);

exports.createOrUpdateCustomer = async (stripeId, email, metadata) => {
  let customer;
  
  if (!stripeId) {
    customer = await stripe.customers.create({
      email, metadata
    });
  } else {
    customer = await stripe.customers.update(stripeId, {email});
  }

  return customer;
};

exports.createPaymentLink = async (quantity) => {
  const fossilProductId = await this.getFossilPrice();
  console.log(fossilProductId.id)
  const link = await stripe.paymentLinks.create({
    line_items: [{
      price: fossilProductId.id,
      quantity,
    }],  
  });

  return link;
};


exports.createWebhooks = async (webhook) => {
  const webhooks = await stripe.webhookEndpoints.list();
  let webhookFound = false;
  for(var endpoint of webhooks.data){
    if(webhookFound === false && endpoint.url === webhook){ webhookFound = true; continue; };

    if(webhookFound === true && endpoint.url === webhook){

      await stripe.webhookEndpoints.del(endpoint.id);
    }
  }
  if(!webhookFound){
    await stripe.webhookEndpoints.create({url: webhook, enabled_events: ['checkout.session.completed']});
  }
};

exports.getFossilPrice = async () => {
  const prices = await stripe.prices.list({});
  return prices.data.filter( x => x.metadata.type === 'FossilDonation')[0];
}

exports.getFossilProduct = async () => {
  const products = await stripe.products.list();
  return products.data.filter( x => x.name === 'Fossil Donation')[0];
}

