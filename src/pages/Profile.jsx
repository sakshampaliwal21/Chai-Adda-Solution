import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import StudentDashboard from './StudentDashboard';
import './Profile.css';

export default function Profile() {
    const { user, isAuthenticated, logout, removeFavorite, getRecommendations } = useAuth();
    const { setCart, addItem } = useCart();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('history');

    if (!isAuthenticated || !user) {
        navigate('/auth');
        return null;
    }

    const handleReorder = (items) => {
        setCart(items);
        addToast('Cart updated for quick reorder!', 'success');
        navigate('/cart');
    };

    const handleAddRecommendation = (item) => {
        addItem(item);
        addToast(`${item.name} added to cart`, 'success');
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const recommendations = getRecommendations();
    const history = user.orderHistory || [];
    const favorites = user.favorites || [];
    const favoriteItems = user.favoriteItems || [];

    return (
        <div className="profile-page page-enter">
            <div className="container">
                <motion.div
                    className="profile-header glass-strong"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="profile-user-info">
                        <div className="profile-avatar">{user.avatar}</div>
                        <div>
                            <h1>{user.name}</h1>
                            <p>{user.email}</p>
                        </div>
                    </div>
                    <button className="btn btn-ghost btn-sm cursor-target" onClick={handleLogout}>
                        Logout
                    </button>
                </motion.div>

                <motion.div
                    className="profile-tabs"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <button
                        className={`profile-tab cursor-target ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        <span>📜 History</span>
                    </button>
                    <button
                        className={`profile-tab cursor-target ${activeTab === 'favorites' ? 'active' : ''}`}
                        onClick={() => setActiveTab('favorites')}
                    >
                        <span>⭐ Favorites</span>
                    </button>
                    <button
                        className={`profile-tab cursor-target ${activeTab === 'recommended' ? 'active' : ''}`}
                        onClick={() => setActiveTab('recommended')}
                    >
                        <span>✨ Recommended</span>
                    </button>
                    <button
                        className={`profile-tab cursor-target ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        <span>📊 Dashboard</span>
                    </button>
                </motion.div>

                <AnimatePresence mode="wait">
                    {activeTab === 'history' && (
                        <motion.div
                            key="history"
                            className="profile-content"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h2>Past Orders</h2>
                            {history.length === 0 ? (
                                <div className="empty-state">
                                    <span className="empty-icon">📜</span>
                                    <p>You haven't placed any orders yet.</p>
                                </div>
                            ) : (
                                <div className="history-list">
                                    {history.map((order, index) => (
                                        <div key={order.historyId || index} className="history-card glass">
                                            <div className="history-header">
                                                <span className="history-date">
                                                    {new Date(order.orderDate || order.timestamp).toLocaleDateString(undefined, {
                                                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </span>
                                                <span className="history-total">₹{order.totalPrice}</span>
                                            </div>
                                            <div className="history-items">
                                                {order.items.map((item) => (
                                                    <span key={item.id} className="history-item">
                                                        {item.quantity}x {item.emoji} {item.name}
                                                    </span>
                                                ))}
                                            </div>
                                            <button
                                                className="btn btn-primary btn-sm mt-3 cursor-target"
                                                onClick={() => handleReorder(order.items)}
                                            >
                                                🔄 Reorder Again
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'favorites' && (
                        <motion.div
                            key="favorites"
                            className="profile-content"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h2>Your Saved Combos</h2>
                            {favorites.length === 0 && favoriteItems.length === 0 ? (
                                <div className="empty-state">
                                    <span className="empty-icon">⭐</span>
                                    <p>No favorites yet. Save your cart or star items to reorder quickly!</p>
                                </div>
                            ) : (
                                <>
                                    {favorites.length > 0 && (
                                        <div className="favorites-grid">
                                            {favorites.map((fav) => (
                                                <div key={fav.id} className="favorite-card glass">
                                                    <div className="favorite-header">
                                                        <h3>{fav.name}</h3>
                                                        <button
                                                            className="btn btn-ghost btn-sm cursor-target"
                                                            onClick={() => {
                                                                removeFavorite(fav.id);
                                                                addToast('Favorite combo removed', 'info');
                                                            }}
                                                            title="Remove favorite"
                                                        >
                                                            ❌
                                                        </button>
                                                    </div>
                                                    <div className="favorite-items">
                                                        {fav.items.map((item) => (
                                                            <span key={item.id} className="history-item">
                                                                {item.quantity}x {item.emoji} {item.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <button
                                                        className="btn btn-primary mt-3 cursor-target w-full"
                                                        onClick={() => handleReorder(fav.items)}
                                                    >
                                                        Reorder
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {favoriteItems.length > 0 && (
                                        <>
                                            <h2 style={{ marginTop: favorites.length > 0 ? '3rem' : '0' }}>Your Favorite Items</h2>
                                            <div className="recommendations-grid">
                                                {favoriteItems.map((item) => (
                                                    <div key={item.id} className="recommendation-card glass cursor-target" onClick={() => handleAddRecommendation(item)}>
                                                        <span className="rec-emoji">{item.emoji}</span>
                                                        <h4>{item.name}</h4>
                                                        <span className="rec-price">₹{item.price}</span>
                                                        <button className="btn btn-sm btn-secondary mt-2">Add to Cart +</button>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'recommended' && (
                        <motion.div
                            key="recommended"
                            className="profile-content"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h2>Recommended For You</h2>
                            {recommendations.length === 0 ? (
                                <div className="empty-state">
                                    <span className="empty-icon">✨</span>
                                    <p>Place some orders to get personalized recommendations!</p>
                                </div>
                            ) : (
                                <div className="recommendations-grid">
                                    {recommendations.map((item) => (
                                        <div key={item.id} className="recommendation-card glass cursor-target" onClick={() => handleAddRecommendation(item)}>
                                            <span className="rec-emoji">{item.emoji}</span>
                                            <h4>{item.name}</h4>
                                            <span className="rec-price">₹{item.price}</span>
                                            <button className="btn btn-sm btn-secondary mt-2">Add +</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'dashboard' && (
                        <motion.div
                            key="dashboard"
                            className="profile-content"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h2>Your Analytics</h2>
                            <StudentDashboard />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
