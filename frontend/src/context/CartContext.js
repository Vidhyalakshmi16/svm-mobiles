// src/context/CartContext.js
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();

  const isLoggedIn = Boolean(user?._id);
  const userKey = isLoggedIn ? user._id : "guest";
  const STORAGE_KEY = `svm_cart_${userKey}`;

  const [cartItems, setCartItems] = useState([]);

  // Track previous login state
  const prevUserRef = useRef(null);

  /* ----------------------------------
     HANDLE LOGIN / LOGOUT TRANSITION
  ----------------------------------- */
  useEffect(() => {
    // Guest → Logged-in
    if (!prevUserRef.current && isLoggedIn) {
      // ❌ Clear guest cart completely
      localStorage.removeItem("svm_cart_guest");
      setCartItems([]);
    }

    prevUserRef.current = user?._id || null;
  }, [isLoggedIn, user]);

  /* ----------------------------------
     LOAD CART FOR CURRENT USER
  ----------------------------------- */
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setCartItems(JSON.parse(stored));
      } catch {
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
  }, [STORAGE_KEY]);

  /* ----------------------------------
     SAVE CART (USER ONLY)
  ----------------------------------- */
  useEffect(() => {
    // ❌ Do NOT persist guest cart long-term
    if (!isLoggedIn) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems, STORAGE_KEY, isLoggedIn]);

  /* ----------------------------------
     CART ACTIONS
  ----------------------------------- */
  const addToCart = (product, quantity = 1) => {
    setCartItems((prev) => {
      const idx = prev.findIndex((i) => i._id === product._id);

      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          quantity: updated[idx].quantity + quantity,
        };
        return updated;
      }

      return [
        ...prev,
        {
          _id: product._id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          finalPrice: product.finalPrice ?? product.price,
          discount: product.discount ?? 0,
          image: product.images?.[0] || "",
          quantity,
          stock: product.stock ?? 0,
        },
      ];
    });
  };

  const updateQuantity = (id, qty) => {
    if (qty < 1) return;
    setCartItems((prev) =>
      prev.map((i) => (i._id === id ? { ...i, quantity: qty } : i))
    );
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((i) => i._id !== id));
  };

  const clearCart = () => setCartItems([]);

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cartItems.reduce(
    (s, i) => s + i.quantity * (i.finalPrice ?? i.price),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
