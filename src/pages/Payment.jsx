import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useToast } from '../context/ToastContext';
import './Payment.css';

export default function Payment() {
    const { items, totalPrice, clearCart, scheduleInfo } = useCart();
    const { addOrder } = useOrders();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [stage, setStage] = useState('qr'); // qr, processing, success
    const [progress, setProgress] = useState(0);
    const savedPriceRef = useRef(totalPrice);
    const savedItemsRef = useRef(items);

    // Keep refs updated while cart still has items
    useEffect(() => {
        if (items.length > 0) {
            savedPriceRef.current = totalPrice;
            savedItemsRef.current = items;
        }
    }, [items, totalPrice]);

    useEffect(() => {
        if (items.length === 0 && stage === 'qr') {
            navigate('/menu');
        }
    }, [items, stage, navigate]);

    useEffect(() => {
        if (stage === 'processing') {
            const interval = setInterval(() => {
                setProgress((p) => {
                    if (p >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return p + 2;
                });
            }, 60);
            return () => clearInterval(interval);
        }
    }, [stage]);

    useEffect(() => {
        if (progress >= 100 && stage === 'processing') {
            setTimeout(() => {
                setStage('success');
                addOrder(items, totalPrice, scheduleInfo);
                clearCart();
                addToast(scheduleInfo?.isPartyOrder ? 'Party order scheduled! 🎉' : 'Payment successful! 🎉', 'success');
            }, 400);
        }
    }, [progress, stage]);

    const handleConfirmPayment = () => {
        setStage('processing');
    };

    const handleViewToken = () => {
        navigate('/token');
    };

    if (items.length === 0 && stage === 'qr') {
        return null;
    }

    const qrData = JSON.stringify({
        merchant: 'Chai Adda',
        amount: totalPrice,
        items: items.length,
        timestamp: Date.now(),
    });

    return (
        <div className="payment-page page-enter">
            <div className="container">
                <motion.div
                    className="payment-wrapper"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <AnimatePresence mode="wait">
                        {stage === 'qr' && (
                            <motion.div
                                key="qr"
                                className="payment-card glass-strong"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <div className="payment-header">
                                    <span className="payment-icon">💳</span>
                                    <h1>Complete Payment</h1>
                                    <p>Scan the QR code to pay</p>
                                </div>

                                <div className="qr-section">
                                    <div className="qr-container">
                                        <QRCodeSVG
                                            value={qrData}
                                            size={200}
                                            bgColor="#241E1A"
                                            fgColor="#F5F0EB"
                                            level="H"
                                            includeMargin
                                        />
                                    </div>
                                    <div className="qr-amount">
                                        <span className="amount-label">Amount to Pay</span>
                                        <span className="amount-value">₹{totalPrice}</span>
                                    </div>
                                </div>

                                <div className="payment-items-summary">
                                    <h3>Order Summary ({items.length} items)</h3>
                                    {scheduleInfo?.isPartyOrder && (
                                        <div className="payment-schedule-info">
                                            <span className="schedule-badge">🎉 Party Order</span>
                                            <span className="schedule-detail">📅 {scheduleInfo.date} · {scheduleInfo.timeSlot}</span>
                                            <span className="schedule-detail">👤 {scheduleInfo.name} · {scheduleInfo.phone}</span>
                                        </div>
                                    )}
                                    <div className="payment-items-list">
                                        {items.map((item) => (
                                            <div key={item.id} className="payment-item-row">
                                                <span>{item.emoji} {item.name}</span>
                                                <span>×{item.quantity} — ₹{item.price * item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button className="btn btn-primary btn-lg payment-confirm-btn cursor-target" onClick={handleConfirmPayment}>
                                    Confirm Payment ✓
                                </button>
                                <p className="payment-note">This is a simulated payment system</p>
                            </motion.div>
                        )}

                        {stage === 'processing' && (
                            <motion.div
                                key="processing"
                                className="payment-card glass-strong processing-card"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <div className="processing-content">
                                    <div className="processing-spinner">
                                        <div className="spinner"></div>
                                    </div>
                                    <h2>Processing Payment...</h2>
                                    <p className="processing-msg">Awaiting Payment Confirmation...</p>
                                    <div className="progress-bar-container">
                                        <motion.div
                                            className="progress-bar-fill"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <span className="progress-text">{progress}%</span>
                                </div>
                            </motion.div>
                        )}

                        {stage === 'success' && (
                            <motion.div
                                key="success"
                                className="payment-card glass-strong success-card"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                            >
                                <div className="success-content">
                                    <motion.div
                                        className="success-check"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                    >
                                        ✅
                                    </motion.div>
                                    <h2>Payment Successful!</h2>
                                    <p>Your order has been placed successfully</p>
                                    <div className="success-amount">₹{savedPriceRef.current} paid</div>
                                    <button className="btn btn-primary btn-lg cursor-target" onClick={handleViewToken}>
                                        View Your Token 🎟️
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
