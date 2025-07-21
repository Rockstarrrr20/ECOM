import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';

const Orders = () => {
  const { backendURL, token, currency } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);

  // Fetch Orders from Backend
  const loadOrderData = async () => {
    try {
      if (!token) return;

      const response = await axios.post(`${backendURL}/api/order/userorders`, {}, { headers: { token } });

      if (response.data.success) {
        let allOrdersItem = [];

        response.data.orders.forEach((order) => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach((item) => {
              allOrdersItem.push({
                ...item,
                status: order.status,
                payment: order.payment,
                paymentMethod: order.paymentMethod,
                date: order.date,
                amount: order.amount, 
              });
            });
          }
        });

        setOrderData(allOrdersItem.reverse());
      }
    } catch (error) {
      console.error('Fetch orders failed:', error);
      setOrderData([]);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  return (
    <div className='border-t pt-16'>
      <div className='text-2xl'>
        <Title text1={'MY'} text2={'ORDERS'} />
      </div>
      <div>
        {orderData.length > 0 ? (
          orderData.map((order, index) => (
            <div key={index} className='py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
              <div className='flex items-start gap-6 text-sm'>
                {/* ✅ Fix: Ensure `order.image` exists before accessing index 0 */}
                <img 
                  className='w-16 sm:w-20' 
                  src={Array.isArray(order.image) && order.image.length > 0 ? order.image[0] : 'placeholder.jpg'} 
                  alt={order?.name || 'Product'} 
                />
                <div>
                  <p className='sm:text-base font-medium'>{order?.name || 'Unknown Product'}</p>
                  <div className='flex items-center gap-3 mt-2 text-base text-gray-700'>
                    <p >{currency}{order?.amount || 'N/A'}</p>
                    <p>Quantity: {order.quantity}</p>
                    <p>Size: {order.size}</p>
                  </div>
                  <p className='mt-1'>Date: <span className='text-gray-400'>{new Date(order.date).toLocaleDateString() }</span></p>
                  <p className='mt-1'>Payment: <span className='text-gray-400'>{order.paymentMethod}</span></p>

                </div>
              </div>
              <div className='md:w-1/2 flex justify-between'>
                <div className='flex items-center gap-2'>
                  <p className='min-w-2 h-2 rounded-full bg-green-500'></p>
                  <p className='text-sm md:text-base'>{order.status}</p>
                </div>
                <button onClick={loadOrderData} className='border px-4 py-2 text-sm font-medium rounded-sm cursor-pointer'>Track Order</button>
              </div>
            </div>
          ))
        ) : (
          <p className='text-gray-500 text-center py-4'>No orders found.</p>
        )}
      </div>
    </div>
  );
};

export default Orders;
