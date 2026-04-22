import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import ToastContainer from './components/ToastContainer';
import TargetCursor from './components/TargetCursor';
import Waves from './components/Waves';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Payment from './pages/Payment';
import Token from './pages/Token';
import Admin from './pages/Admin';
import PartyOrder from './pages/PartyOrder';


function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/token" element={<Token />} />
        <Route path="/party-order" element={<PartyOrder />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <CartProvider>
        <OrderProvider>
          <ToastProvider>
            {/* Custom Cursor */}
            <TargetCursor
              spinDuration={2}
              hideDefaultCursor
              parallaxOn
              hoverDuration={0.2}
            />

            {/* Global Waves Background */}
            <div className="waves-bg">
              <Waves
                lineColor="#a66131"
                backgroundColor="transparent"
                waveSpeedX={0.0125}
                waveSpeedY={0.01}
                waveAmpX={40}
                waveAmpY={20}
                friction={0.9}
                tension={0.01}
                maxCursorMove={120}
                xGap={12}
                yGap={36}
              />
            </div>

            <Navbar />
            <ToastContainer />
            <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
              <AppRoutes />
            </main>
          </ToastProvider>
        </OrderProvider>
      </CartProvider>
    </Router>
  );
}

export default App;
