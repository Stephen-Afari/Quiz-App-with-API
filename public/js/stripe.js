import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  try {
    const stripe = Stripe(
      'pk_test_51LeApTBsd3532bfCTi1JFDJFXTzubSOJYOM56ZRcnJ4U8d6siSijHJzh9IUvEpjsfhYdO8hc7DG9IsgfByx4hQBU00r0vX8nAD'
    );
    //1) Get checkout session from API-a
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    //console.log(session);
    //2) Create checkout form + charge credit cardg
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
