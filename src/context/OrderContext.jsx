import { createContext, useContext, useReducer, useCallback } from 'react';

const OrderContext = createContext();

const orderReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_ORDER': {
            const nextToken = state.nextToken;
            const order = {
                id: Date.now().toString(),
                token: nextToken,
                items: action.payload.items,
                totalPrice: action.payload.totalPrice,
                status: 'received',
                timestamp: new Date().toISOString(),
                estimatedTime: Math.max(5, action.payload.items.length * 3 + Math.floor(Math.random() * 5)),
                scheduleInfo: action.payload.scheduleInfo || null,
            };
            return { ...state, orders: [order, ...state.orders], nextToken: nextToken + 1 };
        }
        case 'UPDATE_STATUS':
            return {
                ...state,
                orders: state.orders.map((order) =>
                    order.id === action.payload.id
                        ? { ...order, status: action.payload.status }
                        : order
                ),
            };
        case 'REMOVE_ORDER':
            return {
                ...state,
                orders: state.orders.filter((order) => order.id !== action.payload),
            };
        default:
            return state;
    }
};

export function OrderProvider({ children }) {
    const [state, dispatch] = useReducer(orderReducer, null, () => {
        const startToken = Math.floor(Math.random() * 90) + 10;
        return {
            orders: [
                {
                    id: 'fake-4',
                    token: startToken + 3,
                    items: [
                        { id: 'b1', name: 'Masala/Ginger Tea', emoji: '🍵', quantity: 15, price: 20 },
                        { id: 'sn1', name: 'Spring Roll', emoji: '🥟', quantity: 5, price: 80 },
                        { id: 's2', name: 'Paneer Sandwich', emoji: '🥪', quantity: 8, price: 70 }
                    ],
                    totalPrice: 1260,
                    status: 'received',
                    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
                    estimatedTime: 30,
                    scheduleInfo: {
                        date: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().split('T')[0],
                        timeSlot: '2:00 PM – 3:00 PM',
                        name: 'Rahul Sharma',
                        phone: '9876543210',
                        isPartyOrder: true,
                    },
                },
                {
                    id: 'fake-3',
                    token: startToken + 2,
                    items: [
                        { id: '4', name: 'Bun Maska', emoji: '🍞', quantity: 1, price: 30 }
                    ],
                    totalPrice: 30,
                    status: 'received',
                    timestamp: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
                    estimatedTime: 5,
                    scheduleInfo: null,
                },
                {
                    id: 'fake-2',
                    token: startToken + 1,
                    items: [
                        { id: '2', name: 'Ginger Chai', emoji: '🫖', quantity: 1, price: 25 }
                    ],
                    totalPrice: 25,
                    status: 'preparing',
                    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
                    estimatedTime: 5,
                    scheduleInfo: null,
                },
                {
                    id: 'fake-1',
                    token: startToken,
                    items: [
                        { id: '1', name: 'Masala Chai', emoji: '☕', quantity: 2, price: 20 },
                        { id: '3', name: 'Samosa', emoji: '🥟', quantity: 1, price: 15 }
                    ],
                    totalPrice: 55,
                    status: 'serving',
                    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
                    estimatedTime: 5,
                    scheduleInfo: null,
                }
            ],
            nextToken: startToken + 4
        };
    });

    const addOrder = useCallback((items, totalPrice, scheduleInfo = null) => {
        dispatch({ type: 'ADD_ORDER', payload: { items, totalPrice, scheduleInfo } });
        return state.orders.length; // returns index
    }, [state.orders.length]);

    const updateOrderStatus = useCallback((id, status) => {
        dispatch({ type: 'UPDATE_STATUS', payload: { id, status } });
    }, []);

    const removeOrder = useCallback((id) => {
        dispatch({ type: 'REMOVE_ORDER', payload: id });
    }, []);

    const getLatestOrder = useCallback(() => {
        return state.orders[0] || null;
    }, [state.orders]);

    return (
        <OrderContext.Provider
            value={{
                orders: state.orders,
                addOrder,
                updateOrderStatus,
                removeOrder,
                getLatestOrder,
            }}
        >
            {children}
        </OrderContext.Provider>
    );
}

export function useOrders() {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error('useOrders must be used within an OrderProvider');
    }
    return context;
}
