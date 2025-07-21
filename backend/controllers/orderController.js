import dotenv from 'dotenv';
dotenv.config(); 
import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import Stripe from 'stripe';
import razorpay from 'razorpay';


//global variables
const currency = 'inr'
const deliveryCharge = 10

//gateway initialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const razorpayInstance = new razorpay({
    key_id : process.env.RAZORPAY_KEY_ID,
    key_secret : process.env.RAZORPAY_KEY_SECRET
})

//placing order using COD Method
const placeOrder = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;
        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "COD",
            payment: false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData);
        await newOrder.save()

        await userModel.findByIdAndUpdate(userId, { cartData: {} })

        res.json({ success: true, message: "order placed" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })

    }

}

//placing order using Stripe Method
const placeOrderStripe = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;
        const { origin } = req.headers

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "Stripe",
            payment: true,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData);
        await newOrder.save()

        const line_items = items.map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }))

        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: 'Delivery Chargers'
                },
                unit_amount: deliveryCharge * 100
            },
            quantity:1

        })

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode:'payment',
            customer_email: (await userModel.findById(userId)).email // ✅ Ensure email is included

        })
        res.json({success:true,session_url:session.url})


    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })

    }

}
//verify stripe
const verifyStripe = async (req,res)=>{
    const {orderId,success,userId}= req.body;
    
    try {
        if (success === 'true') {
            const order = await orderModel.findById(orderId);
            if (!order) {
                return res.status(404).json({ success: false, message: "Order not found" });
            }
            order.payment = true;
            await order.save();
            if (userId) {
                await userModel.findByIdAndUpdate(userId, { cartData: {} });
            }
                        res.json({success:true});
            
        }else{
            await orderModel.findByIdAndDelete(orderId)
            res.json({success:false})
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })

        
    }

}

//placing order using Razorpay Method
const placeOrderRazorpay = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;
        const { origin } = req.headers

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "Razorpay",
            payment: true,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData);
        await newOrder.save()

        const options = {
            amount: amount*100,
            currency:currency.toUpperCase(),
            receipt: newOrder._id.toString()
        }
        const order = await razorpayInstance.orders.create(options);
        if (!order) {
            return res.json({ success: false, message: "Failed to create Razorpay order" });
        }
        res.json({ success: true, order });
        
    } catch (error) {

         console.log(error);
        res.json({ success: false, message: error.message })

    }
}

const verifyRazorpay = async (req, res) => {
    try {
        const { userId, razorpay_order_id, razorpay_payment_id } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id) {
            return res.json({ success: false, message: "Invalid Razorpay Order ID or Payment ID" });
        }

        // Fetch order details from Razorpay
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

        if (!orderInfo) {
            return res.json({ success: false, message: "Order not found in Razorpay" });
        }

        // Fetch payment details to confirm successful payment
        const paymentInfo = await razorpayInstance.payments.fetch(razorpay_payment_id);

        if (paymentInfo.status === "captured") {
            await orderModel.findByIdAndUpdate(orderInfo.receipt, { payment: true });
            await userModel.findByIdAndUpdate(userId, { cartData: {} });

            return res.json({ success: true, message: "Payment Successful" });
        } else {
            return res.json({ success: false, message: "Payment not completed" });
        }
    } catch (error) {
        console.error("Error in verifyRazorpay:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


//all orders for admin panel
const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({})
        res.json({ success: true, orders })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })

    }

}

//user order data for frontend
const userOrders = async (req, res) => {

    try {
        const { userId } = req.body;
        const orders = await orderModel.find({ userId })
        res.json({ success: true, orders })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })

    }

}

//update order status from admin panel
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body
        await orderModel.findByIdAndUpdate(orderId, { status })
        res.json({ success: true, message: 'Status Updated' })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }

}

export {  verifyRazorpay, razorpayInstance,verifyStripe,placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus }