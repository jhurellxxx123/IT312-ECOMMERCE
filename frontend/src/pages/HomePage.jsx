import CategoryItems from "../components/CategoryItems";
import { useProductStore } from "../stores/useProductStore";
import FeaturedProducts from "../components/FeaturedProducts";
import { useEffect } from "react";


const categories = [
	{ href: "/beauty", name: "Beauty", imageUrl: "/beauty.jpg" },
	{ href: "/gadgets", name: "Gadgets", imageUrl: "/electronicgadgets.jpg" },
	{ href: "/clothes", name: "Clothes", imageUrl: "/fashion.jpg" },
	{ href: "/home&living", name: "Home & Living", imageUrl: "/home.jpg" },
	{ href: "/shoes", name: "Shoes", imageUrl: "/shoes.jpg" },
	{ href: "/watches", name: "Watches", imageUrl: "/watches.jpg" },
	{ href: "/bags", name: "Bags", imageUrl: "/bags.jpg" },
];
const HomePage = () => {

	const { fetchFeaturedProducts, products, isLoading } = useProductStore();

	useEffect(() => {
		fetchFeaturedProducts();
	}, [fetchFeaturedProducts]);


  return (
    <div className= 'relative min-h-screen text-white overflow-hidden'>
        <div className ='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
        <h1 className= 'text-center text-5xl sm:text-6xl font-bold text-blue-400 mb-4'>
          View Categories
        </h1>
        <p className= 'text-center text-xl text-gray-300 mb-12'>
          Explore a wide range of product categories to find exactly what you need.
        </p>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
					{categories.map((category) => (
						<CategoryItems category={category} key={category.name} />
					))}
				</div>

        {!isLoading && products.length > 0 && <FeaturedProducts featuredProducts={products} />}

        </div>
    </div>
  )
}

export default HomePage