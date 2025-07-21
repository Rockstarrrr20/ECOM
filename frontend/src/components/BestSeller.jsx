import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';

const BestSeller = () => {
    const { products } = useContext(ShopContext);
    const [bestSeller, setBestSeller] = useState([]);

    useEffect(() => {
        if (Array.isArray(products) && products.length > 0) {
            const bestProduct = products.filter((item) => item.bestseller);
            setBestSeller(bestProduct.slice(0, 5));
        }
    }, [products]); // ✅ Runs again when `products` updates

    return (
        <div className='my-10'>
            <div className='text-center text-3xl py-8'>
                <Title text1={'BEST'} text2={'SELLERS'} />
                <p className='w-3/4 m-auto text-x5 sm:text-sm md:text-base text-gray-600'>
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Rerum quia eos nobis harum? Alias voluptas corporis itaque harum adipisci. Doloribus?
                </p>
            </div>

            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6 '>
                {
                    bestSeller.length > 0 ? (
                        bestSeller.map((item) => (
                            <ProductItem key={item._id} id={item._id} image={item.image} name={item.name} price={item.price} />
                        ))
                    ) : (
                        <p className="col-span-5 text-center text-gray-500">No best sellers available.</p>
                    )
                }
            </div>
        </div>
    )
}

export default BestSeller;
