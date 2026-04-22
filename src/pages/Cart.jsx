import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import './Cart.css';

export default function Cart() {
    const { items, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
    const { addToast } = useToast();

    const handleRemove = (item) => {
        removeItem(item.id);
        addToast(`${item.name} removed from cart`, 'info');
    };

    return (
        <div className="cart-page page-enter">
            <div className="container">
                <motion.div
                    className="cart-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1>🛒 Your Cart</h1>
                    {items.length > 0 && (
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => { clearCart(); addToast('Cart cleared', 'info'); }}
                        >
                            Clear All
                        </button>
                    )}
                </motion.div>

                {items.length === 0 ? (
                    <motion.div
                        className="cart-empty"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <span className="empty-emoji">🛒</span>
                        <h2>Your cart is empty</h2>
                        <p>Add some delicious items from our menu!</p>
                        <Link to="/menu" className="btn btn-primary cursor-target">
                            Browse Menu →
                        </Link>
                    </motion.div>
                ) : (
                    <div className="cart-layout">
                        <div className="cart-items">
                            <AnimatePresence>
                                {items.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        className="cart-item glass"
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20, height: 0, padding: 0, margin: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="cart-item-emoji">{item.emoji}</div>
                                        <div className="cart-item-info">
                                            <h3>{item.name}</h3>
                                            <span className="cart-item-price">₹{item.price} each</span>
                                        </div>
                                        <div className="cart-item-controls">
                                            <button
                                                className="qty-btn"
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            >
                                                −
                                            </button>
                                            <motion.span
                                                className="qty-display"
                                                key={item.quantity}
                                                initial={{ scale: 1.3 }}
                                                animate={{ scale: 1 }}
                                            >
                                                {item.quantity}
                                            </motion.span>
                                            <button
                                                className="qty-btn"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="cart-item-total">
                                            ₹{item.price * item.quantity}
                                        </div>
                                        <button
                                            className="cart-item-remove"
                                            onClick={() => handleRemove(item)}
                                            aria-label="Remove item"
                                        >
                                            ✕
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <motion.div
                            className="cart-summary glass-strong"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h2>Order Summary</h2>
                            <div className="summary-details">
                                <div className="summary-row">
                                    <span>Items</span>
                                    <span>{totalItems}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>₹{totalPrice}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Tax</span>
                                    <span>₹0</span>
                                </div>
                                <div className="summary-divider"></div>
                                <div className="summary-row summary-total">
                                    <span>Total</span>
                                    <span>₹{totalPrice}</span>
                                </div>
                            </div>
                            <p className="summary-note">All prices include MRP as displayed</p>
                            <Link to="/payment" className="btn btn-primary btn-lg summary-btn cursor-target">
                                Proceed to Payment →
                            </Link>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}
