import { createContext, useContext, useReducer, useCallback } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existingIndex = state.items.findIndex(
                (item) => item.id === action.payload.id
            );
            if (existingIndex >= 0) {
                const newItems = [...state.items];
                newItems[existingIndex] = {
                    ...newItems[existingIndex],
                    quantity: newItems[existingIndex].quantity + 1,
                };
                return { ...state, items: newItems };
            }
            return {
                ...state,
                items: [...state.items, { ...action.payload, quantity: 1 }],
            };
        }
        case 'REMOVE_ITEM':
            return {
                ...state,
                items: state.items.filter((item) => item.id !== action.payload),
            };
        case 'UPDATE_QUANTITY': {
            if (action.payload.quantity <= 0) {
                return {
                    ...state,
                    items: state.items.filter((item) => item.id !== action.payload.id),
                };
            }
            return {
                ...state,
                items: state.items.map((item) =>
                    item.id === action.payload.id
                        ? { ...item, quantity: action.payload.quantity }
                        : item
                ),
            };
        }
        case 'CLEAR_CART':
            return { ...state, items: [], scheduleInfo: null };
        case 'SET_SCHEDULE_INFO':
            return { ...state, scheduleInfo: action.payload };
        case 'CLEAR_SCHEDULE_INFO':
            return { ...state, scheduleInfo: null };
        default:
            return state;
    }
};

export function CartProvider({ children }) {
    const [state, dispatch] = useReducer(cartReducer, { items: [], scheduleInfo: null });

    const addItem = useCallback((item) => {
        dispatch({ type: 'ADD_ITEM', payload: item });
    }, []);

    const removeItem = useCallback((id) => {
        dispatch({ type: 'REMOVE_ITEM', payload: id });
    }, []);

    const updateQuantity = useCallback((id, quantity) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    }, []);

    const clearCart = useCallback(() => {
        dispatch({ type: 'CLEAR_CART' });
    }, []);

    const setScheduleInfo = useCallback((info) => {
        dispatch({ type: 'SET_SCHEDULE_INFO', payload: info });
    }, []);

    const clearScheduleInfo = useCallback(() => {
        dispatch({ type: 'CLEAR_SCHEDULE_INFO' });
    }, []);

    const totalPrice = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const totalItems = state.items.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    return (
        <CartContext.Provider
            value={{
                items: state.items,
                scheduleInfo: state.scheduleInfo,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                setScheduleInfo,
                clearScheduleInfo,
                totalPrice,
                totalItems,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
