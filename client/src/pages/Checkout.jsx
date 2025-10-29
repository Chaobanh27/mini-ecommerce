import { API } from '../api';

export default function Checkout({ cart, userId }) {

    const handleCheckout = async () => {
        const res = await fetch(API('/checkout'), {
            method: 'POST',
            headers: { 'Content-Type':'application/json' },
            body: JSON.stringify({ userId, items: cart.items, shipping: 0 })
        });
        const data = await res.json();
        if (data.sessionId) {
        // redirect to stripe checkout
            const stripePublic = import.meta.env.VITE_STRIPE_PUBLISHABLE;
            const stripeJs = await loadStripeJs();
            const stripe = window.Stripe(stripePublic);
            stripe.redirectToCheckout({ sessionId: data.sessionId });
        } else {
            alert('Checkout error: ' + (data.message || 'unknown'));
        }
    }
    return (
    <div>
        <h2>Checkout</h2>
        <button onClick={handleCheckout}>Thanh toán (Stripe Checkout)</button>
    </div>
    )
}

async function loadStripeJs() {
    if (window.Stripe) return;
    const s = document.createElement('script');
    s.src = 'https://js.stripe.com/v3/';
    document.head.appendChild(s);
    return new Promise(res => s.onload = res);
}