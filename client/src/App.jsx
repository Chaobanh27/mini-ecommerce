import { useState, useEffect } from 'react';
import CheckoutPage from './pages/Checkout';

export default function App() {
  const [cart, setCart] = useState({ items: [] });
  useEffect(() => {
  setCart({ items: [ { productId: '64f000000000000000000001', quantity: 1 } ] });
  }, [])
  return (
    <div style={{ padding: 20 }}>
    <h1>MERN E‑commerce (demo)</h1>
    <CheckoutPage cart={cart} userId={'demo-user-1'} />
    </div>
  )
}