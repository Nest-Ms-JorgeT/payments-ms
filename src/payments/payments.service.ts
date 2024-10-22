import { Injectable } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Response, Request } from 'express';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.stripe.secret);

  async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
    const { currency, items, orderId } = paymentSessionDto;

    const lineItems = items.map((item) => {
      return {
        price_data: {
          currency: currency,
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    const session = await this.stripe.checkout.sessions.create({
      payment_intent_data: {
        metadata: {
          orderId: orderId,
        },
      },

      line_items: lineItems,
      mode: 'payment',
      success_url: 'http://localhost:3000/api/payments/success',
      cancel_url: 'http://localhost:3000/api/payments/cancel',
    });

    return session;
  }

  async stripeWebhookhandler(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];
    //Testing
    // const endpointSecret =
    //   'whsec_473d7650b65eb32235193ed4a4bfcbd795cfce25fec95f5afbcccab9d936eef3';

    //Testing pero online
    const endpointSecret = 'whsec_IPnpWPlQsaDVNd7QBdNyoIhlS39u7LSX';
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req['rawBody'],
        sig,
        endpointSecret,
      );
    } catch (error) {
      res.status(400).send(`Webhook Error: ${error.message}`);
      return;
    }
    switch (event.type) {
      case 'charge.succeeded':
        const chargeSucceeded = event.data.object;
        console.log({metadata: chargeSucceeded.metadata});
        break;

      default:
        console.log(`Event ${event.type} not handleled`);
    }

    return res.status(200).json({ sig });
  }
}
