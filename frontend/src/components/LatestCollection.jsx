import React,{ useContext, useEffect, useState} from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';

const LatestCollection = () => {
    const {products} = useContext(ShopContext);
    const[latestProducts,setLatestProducts]=useState([]);

    useEffect(()=>{
        setLatestProducts(products.slice(0,10))

    },[products])

    // console.log(products);
  return (
    <div className='my-10'>
        <div className='text-center py-8 text-3xl'>
             <Title text1={'LATEST'} text2={'Collection'}/>
             <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base'>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Non ex iusto cumque accusantium ipsum ducimus sunt temporibus excepturi commodi repellat.
             </p>
    </div>
          
         {/* rendering products */}
         <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
    {Array.isArray(latestProducts) && latestProducts.length > 0 ? (
        latestProducts.map((item, index) => (
            <ProductItem key={index} id={item._id} image={item.image} name={item.name} price={item.price} />
        ))
    ) : (
        <p className="text-center col-span-full">No latest products available.</p>
    )}
</div>

    </div>
  )
}

export default LatestCollection
