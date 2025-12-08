
// Updated ProductsAPI.tsx - Fixed version with debug logging
import axios from "axios";
import {
    DEFAULT_PAGE,
    DEFAULT_PER_PAGE,
    PRODUCTS_ENDPOINT
} from "../configs/constants";

const SearchProducts = async ({
    searchKey,
    category = '',
    page = DEFAULT_PAGE,
    perPage = DEFAULT_PER_PAGE
}: {
    searchKey: string,
    category?: string,
    page: number,
    perPage: number
}) => {
    try {
        let url = `${PRODUCTS_ENDPOINT}`;
        let isSearchEndpoint = false;
        
        // Determine the endpoint based on parameters
        if (category) {
            // Filter by category - use category endpoint
            url += `/category/${category}`;
            isSearchEndpoint = false;
        } else if (searchKey && searchKey.trim() !== '') {
            // Search by keyword
            url += `/search?q=${encodeURIComponent(searchKey.trim())}`;
            isSearchEndpoint = true;
        } else {
            // Get all products - use the main products endpoint
            url += '?';
            isSearchEndpoint = false;
        }
        
        // Add pagination
        const paginationParams = `limit=${perPage}&skip=${(page - 1) * perPage}`;
        
        // For category endpoint, API might not accept pagination in the same way
        // Let's handle it differently
        if (category) {
            // For category endpoint, we'll fetch all and paginate client-side
            // OR use the correct API structure
            const response = await axios.get(url);
            let products = response.data.products || [];
            const total = products.length;
            
            // Manual pagination for category endpoint
            const startIndex = (page - 1) * perPage;
            const endIndex = startIndex + perPage;
            const paginatedProducts = products.slice(startIndex, endIndex);
            
            return { 
                products: paginatedProducts, 
                perPage, 
                total, 
                page, 
                lastPage: Math.ceil(total / perPage) 
            };
        } else {
            // For search and all products, use API pagination
            url += url.includes('?') ? `&${paginationParams}` : `?${paginationParams}`;
            
            const response = await axios.get(url);
            
            let products, total;
            if (isSearchEndpoint) {
                // Search endpoint returns products directly
                products = response.data.products || [];
                total = response.data.total || 0;
            } else {
                // All products endpoint
                products = response.data.products || [];
                total = response.data.total || products.length;
            }

            return { 
                products, 
                perPage, 
                total, 
                page, 
                lastPage: Math.ceil(total / perPage) 
            };
        }
    } catch (error) {
        console.error('❌ Error fetching products:', error);
        return { 
            products: [], 
            perPage, 
            total: 0, 
            page, 
            lastPage: 0 
        };
    }
}

// Fetch categories with enhanced data
export const GetCategories = async () => {
    try {
        const response = await axios.get(`${PRODUCTS_ENDPOINT}/categories`);
        
        // Check if response is valid
        if (!response.data || !Array.isArray(response.data)) {
            console.warn('Invalid categories response, using mock data');
            return getMockCategories();
        }
        
        const enhancedCategories = response.data.map((category: string, index: number) => {
            const categoryData = categoryIcons.find(c => 
                c.name.toLowerCase() === category.toLowerCase()
            ) || {
                icon: categoryIcons[index % categoryIcons.length].icon,
                color: categoryIcons[index % categoryIcons.length].color
            };
            
            // Determine if category is popular or new
            const isPopular = ['smartphones', 'laptops', 'fragrances', 'skincare']
                .includes(category.toLowerCase());
            const isNew = ['automotive', 'motorcycle', 'lighting']
                .includes(category.toLowerCase());
            
            return {
                id: index + 1,
                name: category,
                slug: category.toLowerCase().replace(/ /g, '-'),
                displayName: formatCategoryName(category),
                isPopular,
                isNew,
                ...categoryData
            };
        });
        
        return enhancedCategories;
    } catch (error) {
        console.error('❌ Error fetching categories:', error);
        return getMockCategories();
    }
};

// Update formatCategoryName to handle edge cases
const formatCategoryName = (category: string) => {
    // First replace hyphens with spaces
    const spaced = category.replace(/-/g, ' ');
    
    return spaced
        .split(' ')
        .map(word => {
            // Special handling for common terms
            const lowerWord = word.toLowerCase();
            if (lowerWord === 'womens') return "Women's";
            if (lowerWord === 'mens') return "Men's";
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');
};

// Category icons and colors mapping - updated with your theme
const categoryIcons = [
    { name: 'smartphones', icon: '📱', color: '#F29F58' },
    { name: 'laptops', icon: '💻', color: '#AB4459' },
    { name: 'fragrances', icon: '🌸', color: '#441752' },
    { name: 'skincare', icon: '🧴', color: '#1B1833' },
    { name: 'groceries', icon: '🛒', color: '#F29F58' },
    { name: 'home-decoration', icon: '🏠', color: '#AB4459' },
    { name: 'furniture', icon: '🛋️', color: '#441752' },
    { name: 'tops', icon: '👕', color: '#1B1833' },
    { name: 'womens-dresses', icon: '👗', color: '#F29F58' },
    { name: 'womens-shoes', icon: '👠', color: '#AB4459' },
    { name: 'mens-shirts', icon: '👔', color: '#441752' },
    { name: 'mens-shoes', icon: '👞', color: '#1B1833' },
    { name: 'mens-watches', icon: '⌚', color: '#F29F58' },
    { name: 'womens-watches', icon: '⌚', color: '#AB4459' },
    { name: 'womens-bags', icon: '👜', color: '#441752' },
    { name: 'womens-jewellery', icon: '💎', color: '#1B1833' },
    { name: 'sunglasses', icon: '🕶️', color: '#F29F58' },
    { name: 'automotive', icon: '🚗', color: '#AB4459' },
    { name: 'motorcycle', icon: '🏍️', color: '#441752' },
    { name: 'lighting', icon: '💡', color: '#1B1833' }
];

// Mock categories with enhanced data
const getMockCategories = () => {
    return categoryIcons.map((cat, index) => ({
        id: index + 1,
        name: cat.name,
        slug: cat.name.toLowerCase(),
        displayName: formatCategoryName(cat.name),
        isPopular: ['smartphones', 'laptops', 'fragrances', 'skincare']
            .includes(cat.name.toLowerCase()),
        isNew: ['automotive', 'motorcycle', 'lighting']
            .includes(cat.name.toLowerCase()),
        icon: cat.icon,
        color: cat.color
    }));
};

// Product details function with debug logging
export const GetProductDetails = async (productId: number) => {
    console.log(`🔄 GetProductDetails: Fetching product ${productId} from ${PRODUCTS_ENDPOINT}/${productId}`);
    
    try {
        const response = await axios.get(`${PRODUCTS_ENDPOINT}/${productId}`);
        console.log(`✅ GetProductDetails: Successfully fetched product ${productId}`);
        return response.data;
    } catch (error) {
        console.error(`❌ GetProductDetails: Error fetching product details for ID ${productId}:`, error);
        
        // Enhanced mock product data
        const mockProduct = {
            id: productId,
            title: `Premium Product #${productId}`,
            description: "Experience unparalleled luxury and sophistication with this exclusive item. Crafted with meticulous attention to detail using only the finest materials available.",
            price: 299.99,
            discountPercentage: 15,
            rating: 4.7,
            stock: 50,
            category: "Luxury",
            tags: ["premium", "exclusive", "limited-edition", "handcrafted"],
            thumbnail: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=400&fit=crop",
            images: [
                "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=400&fit=crop",
                "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&h=400&fit=crop",
                "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600&h=400&fit=crop"
            ],
            brand: "Luxury Elite",
            sku: `LUX-${productId.toString().padStart(6, '0')}`,
            weight: "1.2 kg",
            dimensions: "30 × 20 × 15 cm",
            warranty: "Lifetime Warranty",
            reviews: [
                {
                    id: 1,
                    user: "Alexandra R.",
                    rating: 5,
                    comment: "Absolutely stunning! The quality is beyond expectations.",
                    date: "2024-01-15",
                    avatar: "https://randomuser.me/api/portraits/women/1.jpg"
                },
                {
                    id: 2,
                    user: "Marcus T.",
                    rating: 4,
                    comment: "Beautiful craftsmanship. Worth every penny.",
                    date: "2024-01-10",
                    avatar: "https://randomuser.me/api/portraits/men/2.jpg"
                },
                {
                    id: 3,
                    user: "Sophia L.",
                    rating: 5,
                    comment: "This exceeded all my expectations. Truly luxurious!",
                    date: "2024-01-05",
                    avatar: "https://randomuser.me/api/portraits/women/3.jpg"
                }
            ],
            meta: {
                materials: ["Premium Leather", "Stainless Steel", "Italian Craftsmanship"],
                origin: "Made in Italy",
                shipping: "Worldwide Express"
            }
        };
        
        console.log(`🔄 GetProductDetails: Returning mock product for ID ${productId}`);
        return mockProduct;
    }
};

export { SearchProducts };
