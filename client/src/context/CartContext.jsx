import { createContext, useState, useContext } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        return JSON.parse(storedCart);
      } catch {
        localStorage.removeItem('cart');
      }
    }
    return [];
  });

  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const addToCart = (item, qty = 1, customization = null) => {
    const newCart = [...cart];
    
    // Check if item with exact same customizations already exists
    const existingIndex = newCart.findIndex(cartItem => {
      if (cartItem._id !== item._id) return false;
      
      // Compare customizations
      if (!cartItem.customization && !customization) return true;
      if (!cartItem.customization || !customization) return false;
      
      const sameShell = cartItem.customization.shell === customization.shell;
      const sameAddons = JSON.stringify(cartItem.customization.addons) === JSON.stringify(customization.addons);
      return sameShell && sameAddons;
    });

    // Calculate single item unit price including addons
    let itemUnitPrice = item.price;
    if (customization && customization.addons) {
      customization.addons.forEach(addon => {
        itemUnitPrice += addon.price;
      });
    }

    if (existingIndex > -1) {
      newCart[existingIndex].qty += qty;
      newCart[existingIndex].totalPrice = newCart[existingIndex].qty * newCart[existingIndex].unitPrice;
    } else {
      newCart.push({
        ...item,
        qty,
        customization,
        unitPrice: itemUnitPrice,
        totalPrice: qty * itemUnitPrice
      });
    }
    
    saveCart(newCart);
  };

  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    saveCart(newCart);
  };

  const updateQty = (index, change) => {
    const newCart = [...cart];
    if (!newCart[index]) return;
    
    newCart[index].qty += change;
    if (newCart[index].qty <= 0) {
      removeFromCart(index);
    } else {
      newCart[index].totalPrice = newCart[index].qty * newCart[index].unitPrice;
      saveCart(newCart);
    }
  };

  const clearCart = () => {
    saveCart([]);
  };

  const checkout = async (checkoutDetails) => {
    // Construct database expected cart structure: items array with { foodItemId, name, quantity, price, customization }
    const items = cart.map(item => ({
      foodItemId: item._id,
      name: item.name,
      quantity: item.qty,
      price: item.unitPrice,
      customization: item.customization ? {
        shell: item.customization.shell || '',
        addons: item.customization.addons ? item.customization.addons.map(a => a.name) : []
      } : null
    }));

    const orderData = {
      ...checkoutDetails,
      items,
      totalAmount: cart.reduce((sum, item) => sum + item.totalPrice, 0)
    };

    const response = await fetch('/api/order/place', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    
    const data = await response.json();
    if (data.success) {
      clearCart();
    }
    return data;
  };

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, checkout, subtotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
