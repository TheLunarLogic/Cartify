// Array to store order details
let orders = [];

// Function to add a new order
export const addOrder = (orderDetails) => {
  const order = {
    id: Date.now(), // Unique order ID
    date: new Date().toISOString(),
    items: orderDetails.items,
    totalAmount: orderDetails.totalAmount,
    status: 'Pending'
  };
  orders.push(order);
  return order;
};

// Function to get all orders
export const getOrders = () => {
  return orders;
};

// Function to get order by ID
export const getOrderById = (orderId) => {
  return orders.find(order => order.id === orderId);
};

// Function to update order status
export const updateOrderStatus = (orderId, newStatus) => {
  const order = orders.find(order => order.id === orderId);
  if (order) {
    order.status = newStatus;
    return order;
  }
  return null;
};

// Function to clear all orders
export const clearOrders = () => {
  orders = [];
}; 