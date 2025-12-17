import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  // ✅ Use ONLY logged-in user's id
  const userKey = user?._id;

  // Load wishlist when user logs in
  useEffect(() => {
    if (!userKey) {
      setWishlist([]); // 🔥 clear wishlist for non-login users
      return;
    }

    const stored = localStorage.getItem(`svm_wishlist_${userKey}`);
    if (stored) {
      try {
        setWishlist(JSON.parse(stored));
      } catch {
        setWishlist([]);
      }
    } else {
      setWishlist([]);
    }
  }, [userKey]);

  // Save wishlist only if logged in
  useEffect(() => {
    if (!userKey) return;

    localStorage.setItem(
      `svm_wishlist_${userKey}`,
      JSON.stringify(wishlist)
    );
  }, [wishlist, userKey]);

  const isInWishlist = (productId) =>
    wishlist.some((item) => item._id === productId);

  const addToWishlist = (product) => {
    if (!userKey) {
      alert("Please login to add items to wishlist");
      return;
    }

    setWishlist((prev) => {
      if (prev.some((p) => p._id === product._id)) return prev;
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId) => {
    if (!userKey) return;
    setWishlist((prev) => prev.filter((p) => p._id !== productId));
  };

  const toggleWishlist = (product) => {
    if (!userKey) {
      alert("Please login to manage wishlist");
      return;
    }

    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
