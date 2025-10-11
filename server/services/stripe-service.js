const Stripe = require('stripe');
const config = require('../config');
const logger = require('../utils/logger');

// Initialize Stripe with secret key
const stripe = Stripe(config.STRIPE_SECRET_KEY);

class StripeService {
    constructor() {
        this.stripe = stripe;
    }

    // Create a Stripe customer
    async createCustomer(userEmail, userId) {
        try {
            const customer = await this.stripe.customers.create({
                email: userEmail,
                metadata: {
                    userId: userId
                }
            });
            
            logger.info('Stripe customer created', { customerId: customer.id, userId });
            return customer;
        } catch (error) {
            logger.error('Create Stripe customer error:', error);
            throw new Error('Failed to create Stripe customer');
        }
    }

    // Create a subscription
    async createSubscription(customerId, priceId, paymentMethodId) {
        try {
            const subscription = await this.stripe.subscriptions.create({
                customer: customerId,
                items: [{ price: priceId }],
                payment_behavior: 'default_incomplete',
                payment_settings: { save_default_payment_method: 'on_subscription' },
                expand: ['latest_invoice.payment_intent'],
            });
            
            logger.info('Stripe subscription created', { subscriptionId: subscription.id, customerId });
            return subscription;
        } catch (error) {
            logger.error('Create Stripe subscription error:', error);
            throw new Error('Failed to create Stripe subscription');
        }
    }

    // Cancel a subscription
    async cancelSubscription(subscriptionId) {
        try {
            const subscription = await this.stripe.subscriptions.update(subscriptionId, {
                cancel_at_period_end: true
            });
            
            logger.info('Stripe subscription canceled', { subscriptionId });
            return subscription;
        } catch (error) {
            logger.error('Cancel Stripe subscription error:', error);
            throw new Error('Failed to cancel Stripe subscription');
        }
    }

    // Update a subscription (change plan)
    async updateSubscription(subscriptionId, newPriceId) {
        try {
            const subscription = await this.stripe.subscriptions.update(subscriptionId, {
                items: [{ id: subscription.items[0].id, price: newPriceId }],
                proration_behavior: 'create_prorations'
            });
            
            logger.info('Stripe subscription updated', { subscriptionId, newPriceId });
            return subscription;
        } catch (error) {
            logger.error('Update Stripe subscription error:', error);
            throw new Error('Failed to update Stripe subscription');
        }
    }

    // Create a payment intent for one-time payments
    async createPaymentIntent(amount, currency, customerId, description) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Convert to cents
                currency: currency.toLowerCase(),
                customer: customerId,
                payment_method_types: ['card'],
                description: description,
                metadata: {
                    integration_check: 'accept_a_payment'
                }
            });
            
            logger.info('Payment intent created', { paymentIntentId: paymentIntent.id, amount });
            return paymentIntent;
        } catch (error) {
            logger.error('Create payment intent error:', error);
            throw new Error('Failed to create payment intent');
        }
    }

    // Create a setup intent for saving payment methods
    async createSetupIntent(customerId) {
        try {
            const setupIntent = await this.stripe.setupIntents.create({
                customer: customerId,
                payment_method_types: ['card']
            });
            
            logger.info('Setup intent created', { setupIntentId: setupIntent.id, customerId });
            return setupIntent;
        } catch (error) {
            logger.error('Create setup intent error:', error);
            throw new Error('Failed to create setup intent');
        }
    }

    // Retrieve a subscription
    async getSubscription(subscriptionId) {
        try {
            const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
            return subscription;
        } catch (error) {
            logger.error('Get Stripe subscription error:', error);
            throw new Error('Failed to get Stripe subscription');
        }
    }

    // Retrieve a customer
    async getCustomer(customerId) {
        try {
            const customer = await this.stripe.customers.retrieve(customerId);
            return customer;
        } catch (error) {
            logger.error('Get Stripe customer error:', error);
            throw new Error('Failed to get Stripe customer');
        }
    }

    // List subscriptions for a customer
    async listCustomerSubscriptions(customerId) {
        try {
            const subscriptions = await this.stripe.subscriptions.list({
                customer: customerId,
                status: 'all',
                limit: 100
            });
            return subscriptions;
        } catch (error) {
            logger.error('List customer subscriptions error:', error);
            throw new Error('Failed to list customer subscriptions');
        }
    }

    // Verify webhook signature
    verifyWebhookSignature(payload, signature) {
        try {
            const event = this.stripe.webhooks.constructEvent(
                payload,
                signature,
                config.STRIPE_WEBHOOK_SECRET
            );
            return event;
        } catch (err) {
            logger.error('Webhook signature verification failed:', err);
            throw new Error('Invalid webhook signature');
        }
    }

    // Handle invoice payment succeeded
    async handleInvoicePaymentSucceeded(invoice) {
        try {
            // Update our database with successful payment
            // This would typically be done in a separate service
            logger.info('Invoice payment succeeded', { invoiceId: invoice.id, customerId: invoice.customer });
            
            // You might want to:
            // 1. Update subscription status in your database
            // 2. Send confirmation email to customer
            // 3. Update user's access to premium features
            
        } catch (error) {
            logger.error('Handle invoice payment succeeded error:', error);
            throw new Error('Failed to handle invoice payment succeeded');
        }
    }

    // Handle invoice payment failed
    async handleInvoicePaymentFailed(invoice) {
        try {
            // Update our database with failed payment
            logger.info('Invoice payment failed', { invoiceId: invoice.id, customerId: invoice.customer });
            
            // You might want to:
            // 1. Update subscription status to 'past_due'
            // 2. Send email to customer about payment failure
            // 3. Disable premium features if necessary
            
        } catch (error) {
            logger.error('Handle invoice payment failed error:', error);
            throw new Error('Failed to handle invoice payment failed');
        }
    }

    // Handle subscription deleted
    async handleSubscriptionDeleted(subscription) {
        try {
            // Update our database when subscription is deleted
            logger.info('Subscription deleted', { subscriptionId: subscription.id, customerId: subscription.customer });
            
            // You might want to:
            // 1. Update subscription status in your database
            // 2. Revoke premium access
            // 3. Send cancellation confirmation
            
        } catch (error) {
            logger.error('Handle subscription deleted error:', error);
            throw new Error('Failed to handle subscription deleted');
        }
    }

    // Handle subscription updated
    async handleSubscriptionUpdated(subscription) {
        try {
            // Update our database when subscription is updated
            logger.info('Subscription updated', { subscriptionId: subscription.id, customerId: subscription.customer });
            
            // You might want to:
            // 1. Update subscription details in your database
            // 2. Adjust user access based on new plan
            
        } catch (error) {
            logger.error('Handle subscription updated error:', error);
            throw new Error('Failed to handle subscription updated');
        }
    }

    // Create a price for a subscription tier
    async createPrice(tierId, unitAmount, currency, recurring) {
        try {
            const price = await this.stripe.prices.create({
                unit_amount: Math.round(unitAmount * 100), // Convert to cents
                currency: currency.toLowerCase(),
                recurring: recurring,
                product_data: {
                    name: `Subscription Tier ${tierId}`,
                    metadata: {
                        tierId: tierId
                    }
                }
            });
            
            logger.info('Price created', { priceId: price.id, tierId });
            return price;
        } catch (error) {
            logger.error('Create price error:', error);
            throw new Error('Failed to create price');
        }
    }

    // Create a product for subscription tiers
    async createProduct(name, description) {
        try {
            const product = await this.stripe.products.create({
                name: name,
                description: description,
                metadata: {
                    type: 'subscription_tier'
                }
            });
            
            logger.info('Product created', { productId: product.id });
            return product;
        } catch (error) {
            logger.error('Create product error:', error);
            throw new Error('Failed to create product');
        }
    }

    // Get payment method details
    async getPaymentMethod(paymentMethodId) {
        try {
            const paymentMethod = await this.stripe.paymentMethods.retrieve(paymentMethodId);
            return paymentMethod;
        } catch (error) {
            logger.error('Get payment method error:', error);
            throw new Error('Failed to get payment method');
        }
    }

    // Attach payment method to customer
    async attachPaymentMethod(paymentMethodId, customerId) {
        try {
            const paymentMethod = await this.stripe.paymentMethods.attach(paymentMethodId, {
                customer: customerId
            });
            
            logger.info('Payment method attached', { paymentMethodId, customerId });
            return paymentMethod;
        } catch (error) {
            logger.error('Attach payment method error:', error);
            throw new Error('Failed to attach payment method');
        }
    }

    // Detach payment method
    async detachPaymentMethod(paymentMethodId) {
        try {
            const paymentMethod = await this.stripe.paymentMethods.detach(paymentMethodId);
            
            logger.info('Payment method detached', { paymentMethodId });
            return paymentMethod;
        } catch (error) {
            logger.error('Detach payment method error:', error);
            throw new Error('Failed to detach payment method');
        }
    }

    // List payment methods for a customer
    async listCustomerPaymentMethods(customerId) {
        try {
            const paymentMethods = await this.stripe.paymentMethods.list({
                customer: customerId,
                type: 'card'
            });
            
            return paymentMethods;
        } catch (error) {
            logger.error('List customer payment methods error:', error);
            throw new Error('Failed to list customer payment methods');
        }
    }

    // Create a refund
    async createRefund(paymentIntentId, amount, reason) {
        try {
            const refund = await this.stripe.refunds.create({
                payment_intent: paymentIntentId,
                amount: amount ? Math.round(amount * 100) : undefined, // Convert to cents
                reason: reason || 'requested_by_customer'
            });
            
            logger.info('Refund created', { refundId: refund.id, paymentIntentId });
            return refund;
        } catch (error) {
            logger.error('Create refund error:', error);
            throw new Error('Failed to create refund');
        }
    }
}

module.exports = new StripeService();