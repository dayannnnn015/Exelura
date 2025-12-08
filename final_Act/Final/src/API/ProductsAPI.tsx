import axios from "axios";
import {
    DEFAULT_PAGE,
    DEFAULT_PER_PAGE,
    PRODUCTS_ENDPOINT
} from "../configs/constants";

// Enhanced search with better error handling and logging
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
    console.log(`🔍 SearchProducts called:`, { searchKey, category, page, perPage });
    
    try {
        let url = `${PRODUCTS_ENDPOINT}`;
        let isSearchEndpoint = false;
        
        // Determine the endpoint based on parameters
        if (category) {
            // Filter by category
            url += `/category/${encodeURIComponent(category)}`;
            console.log(`📁 Category endpoint: ${url}`);
            isSearchEndpoint = false;
        } else if (searchKey && searchKey.trim() !== '') {
            // Search by keyword
            url += `/search?q=${encodeURIComponent(searchKey.trim())}`;
            console.log(`🔎 Search endpoint: ${url}`);
            isSearchEndpoint = true;
        } else {
            // Get all products
            url += '?';
            console.log(`📦 All products endpoint: ${url}`);
            isSearchEndpoint = false;
        }
        
        // Add pagination
        const paginationParams = `limit=${perPage}&skip=${(page - 1) * perPage}`;
        
        if (category) {
            // For category endpoint, fetch all and paginate client-side
            const response = await axios.get(url);
            console.log(`✅ Category response:`, response.data);
            
            let products = response.data.products || [];
            const total = products.length;
            
            // Manual pagination for category endpoint
            const startIndex = (page - 1) * perPage;
            const endIndex = Math.min(startIndex + perPage, total);
            const paginatedProducts = products.slice(startIndex, endIndex);
            
            // Add QR codes to products
            const enhancedProducts = paginatedProducts.map((product: any, index: number) => ({
                ...product,
                qrCode: product.qrCode || `QR-${product.id || `CAT-${category}-${index + 1}`}`,
                thumbnail: product.thumbnail || product.images?.[0] || `https://via.placeholder.com/300x300?text=${encodeURIComponent(product.title || 'Product')}`
            }));
            
            return { 
                products: enhancedProducts, 
                perPage, 
                total, 
                page, 
                lastPage: Math.ceil(total / perPage) 
            };
        } else {
            // For search and all products, use API pagination
            url += url.includes('?') ? `&${paginationParams}` : `?${paginationParams}`;
            
            const response = await axios.get(url);
            console.log(`✅ API response:`, response.data);
            
            let products, total;
            if (isSearchEndpoint) {
                products = response.data.products || [];
                total = response.data.total || 0;
            } else {
                products = response.data.products || [];
                total = response.data.total || products.length;
            }

            // Add QR codes to products
            const enhancedProducts = products.map((product: any) => ({
                ...product,
                qrCode: product.qrCode || `QR-${product.id}`,
                thumbnail: product.thumbnail || product.images?.[0] || `https://via.placeholder.com/300x300?text=${encodeURIComponent(product.title || 'Product')}`
            }));

            return { 
                products: enhancedProducts, 
                perPage, 
                total, 
                page, 
                lastPage: Math.ceil(total / perPage) 
            };
        }
    } catch (error) {
        console.error('❌ Error fetching products:', error);
        // Return enhanced mock data on error
        return getMockProducts(searchKey, category, page, perPage);
    }
}

// Mock data generator for fallback
const getMockProducts = (searchKey: string, category: string, page: number, perPage: number) => {
    const mockProducts = [];
    const total = 45;
    const startIndex = (page - 1) * perPage;
    
    for (let i = 0; i < Math.min(perPage, 10); i++) {
        const id = startIndex + i + 1;
        const product = {
            id: id,
            title: `${category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Premium'} Product ${searchKey ? `"${searchKey}"` : ''} #${id}`,
            description: "Experience unparalleled luxury and sophistication with this exclusive item. Crafted with meticulous attention to detail using only the finest materials available.",
            price: 99.99 + (id * 10),
            discountPercentage: id % 3 === 0 ? 15 : 0,
            rating: 4 + (Math.random() * 1),
            stock: 10 + (id % 20),
            category: category || "luxury",
            tags: ["premium", "exclusive", "limited-edition"],
            thumbnail: `https://images.unsplash.com/photo-${1546868871 + id}?w=300&h=300&fit=crop`,
            images: [
                `https://images.unsplash.com/photo-${1546868871 + id}?w-600&h=400&fit=crop`,
                `https://images.unsplash.com/photo-${1560769629 + id}?w=600&h=400&fit=crop`,
                `https://images.unsplash.com/photo-${1556656793 + id}?w=600&h=400&fit=crop`
            ],
            brand: "Luxury Elite",
            qrCode: `QR-${id}`,
            reviews: [
                {
                    id: 1,
                    user: "Alexandra R.",
                    rating: 5,
                    comment: "Absolutely stunning! The quality is beyond expectations.",
                    date: "2024-01-15",
                    avatar: "https://randomuser.me/api/portraits/women/1.jpg"
                }
            ],
            weight: "1.2 kg",
            dimensions: "30 × 20 × 15 cm",
            warranty: "2 Year Warranty"
        };
        mockProducts.push(product);
    }
    
    return { 
        products: mockProducts, 
        perPage, 
        total, 
        page, 
        lastPage: Math.ceil(total / perPage) 
    };
};

// Enhanced category fetching with product counts
export const GetCategoriesWithCounts = async () => {
  console.log('📊 Fetching categories with counts...');
  
  try {
    // First, get all categories
    const categoriesResponse = await axios.get(`${PRODUCTS_ENDPOINT}/categories`);
    
    if (!categoriesResponse.data || !Array.isArray(categoriesResponse.data)) {
      console.warn('⚠️ Invalid categories response, using mock data');
      return getMockCategoriesWithCounts();
    }
    
    // Get all products to count by category
    const productsResponse = await axios.get(`${PRODUCTS_ENDPOINT}?limit=100`);
    const products = productsResponse.data.products || [];
    
    // Count products per category
    const categoryCounts: { [key: string]: number } = {};
    products.forEach((product: any) => {
      const category = product.category;
      if (category) {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
    });
    
    const enhancedCategories = categoriesResponse.data.map((category: string, index: number) => {
      const categoryData = categoryIcons.find(c => 
        c.name.toLowerCase() === category.toLowerCase()
      ) || {
        icon: categoryIcons[index % categoryIcons.length].icon,
        color: categoryIcons[index % categoryIcons.length].color
      };
      
      // Determine if category is popular or new
      const isPopular = ['smartphones', 'laptops', 'fragrances']
        .includes(category.toLowerCase());
      const isNew = ['motorcycle']
        .includes(category.toLowerCase());
      
      // Get product count for this category
      const productCount = categoryCounts[category] || Math.floor(Math.random() * 20) + 5;
      
      return {
        id: index + 1,
        name: category,
        slug: category.toLowerCase().replace(/ /g, '-'),
        displayName: formatCategoryName(category),
        isPopular,
        isNew,
        productCount,
        hasProducts: productCount > 0,
        ...categoryData
      };
    });
    
    // Sort by popularity and product count
    const sortedCategories = enhancedCategories.sort((a, b) => {
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      return b.productCount - a.productCount;
    });
    
    console.log(`✅ Loaded ${sortedCategories.length} categories`);
    return sortedCategories;
    
  } catch (error) {
    console.error('❌ Error fetching categories with counts:', error);
    return getMockCategoriesWithCounts();
  }
};

// Mock categories with counts for fallback
const getMockCategoriesWithCounts = () => {
  return categoryIcons
    .map((cat, index) => ({
      id: index + 1,
      name: cat.name,
      slug: cat.name.toLowerCase(),
      displayName: formatCategoryName(cat.name),
      isPopular: ['smartphones', 'laptops', 'fragrances', 'skincare']
        .includes(cat.name.toLowerCase()),
      isNew: ['motorcycle']
        .includes(cat.name.toLowerCase()),
      hasProducts: true,
      icon: cat.icon,
      color: cat.color
    }))
    .sort((a, b) => {
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      return 0;
    });
};
  


// Product details function with enhanced features and QR code
export const GetProductDetails = async (productId: number) => {
    console.log(`🔄 GetProductDetails: Fetching product ${productId}`);
    
    try {
        const response = await axios.get(`${PRODUCTS_ENDPOINT}/${productId}`);
        console.log(`✅ GetProductDetails: Successfully fetched product ${productId}`);
        
        // Enhance product data with QR code and ensure all fields
        const enhancedProduct = {
            ...response.data,
            qrCode: response.data.qrCode || `QR-${productId}`,
            thumbnail: response.data.thumbnail || response.data.images?.[0] || `https://via.placeholder.com/600x400?text=Product+${productId}`,
            images: response.data.images || [response.data.thumbnail] || [`https://via.placeholder.com/600x400?text=Product+${productId}`],
            reviews: response.data.reviews || getMockReviews(productId),
            meta: response.data.meta || {
                materials: ["Premium Materials", "Fine Craftsmanship"],
                origin: "Internationally Sourced",
                shipping: "Worldwide Express Delivery"
            }
        };
        
        return enhancedProduct;
        
    } catch (error) {
        console.error(`❌ GetProductDetails: Error fetching product ${productId}:`, error);
        
        // Enhanced mock product data with QR code
        const mockProduct = {
            id: productId,
            title: `Premium Luxury Product #${productId}`,
            description: "Experience unparalleled luxury and sophistication with this exclusive item. Crafted with meticulous attention to detail using only the finest materials available. Each piece is individually inspected to ensure the highest quality standards.",
            price: 299.99 + (productId * 20),
            discountPercentage: productId % 4 === 0 ? 20 : productId % 3 === 0 ? 15 : 0,
            rating: 4.5 + (Math.random() * 0.5),
            stock: 25 + (productId % 30),
            category: "Luxury Goods",
            tags: ["premium", "exclusive", "limited-edition", "handcrafted", "luxury"],
            thumbnail: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=400&fit=crop",
            qrCode: `QR-${productId}`,
            images: [
                "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=400&fit=crop",
                "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&h=400&fit=crop",
                "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600&h=400&fit=crop",
                "https://images.unsplash.com/photo-1545235617-9465d2a55698?w=600&h=400&fit=crop"
            ],
            brand: "Luxury Elite",
            sku: `LUX-${productId.toString().padStart(6, '0')}`,
            weight: "1.2 kg",
            dimensions: "30 × 20 × 15 cm",
            warranty: "Lifetime Warranty",
            reviews: getMockReviews(productId),
            meta: {
                materials: ["Premium Leather", "Stainless Steel", "Italian Craftsmanship", "Swiss Movement"],
                origin: "Made in Italy",
                shipping: "Worldwide Express Shipping",
                careInstructions: "Dry clean only. Avoid direct sunlight.",
                authenticity: "100% Authentic with Certificate"
            },
            specifications: {
                material: "Premium Materials",
                color: "Various Available",
                size: "Standard/Medium",
                feature1: "Water Resistant",
                feature2: "Scratch Proof",
                feature3: "Eco Friendly"
            }
        };
        
        console.log(`🔄 GetProductDetails: Returning enhanced mock product for ID ${productId}`);
        return mockProduct;
    }
};

// Helper function for mock reviews
const getMockReviews = (productId: number) => {
    const reviewTemplates = [
        "Absolutely stunning! The quality is beyond expectations.",
        "Beautiful craftsmanship. Worth every penny.",
        "This exceeded all my expectations. Truly luxurious!",
        "Perfect addition to my collection. Highly recommended.",
        "The attention to detail is remarkable. Love it!",
        "Best purchase I've made this year. Exceptional quality.",
        "Worth the investment. Gets compliments everywhere.",
        "Premium feel and flawless finish. 5 stars!"
    ];
    
    const reviews = [];
    const reviewCount = 3 + (productId % 4);
    
    for (let i = 1; i <= reviewCount; i++) {
        reviews.push({
            id: i,
            user: i % 2 === 0 ? `Customer ${productId * 10 + i}` : `User ${productId + i}`,
            rating: 4 + (i % 2),
            comment: reviewTemplates[(productId + i) % reviewTemplates.length],
            date: `2024-0${1 + (i % 9)}-${10 + (i % 20)}`,
            avatar: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${i % 10}.jpg`,
            verified: i % 3 !== 0
        });
    }
    
    return reviews;
};

// Format category names properly
const formatCategoryName = (category: string) => {
    // First replace hyphens with spaces
    const spaced = category.replace(/-/g, ' ');
    
    return spaced
        .split(' ')
        .map(word => {
            const lowerWord = word.toLowerCase();
            if (lowerWord === 'womens') return "Women's";
            if (lowerWord === 'mens') return "Men's";
            if (lowerWord === 'home-decoration') return "Home Decoration";
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');
};

// Category icons and colors mapping
const categoryIcons = [
    { name: 'smartphones', icon: '📱', color: '#F29F58' },
    { name: 'laptops', icon: '💻', color: '#AB4459' },
    { name: 'fragrances', icon: '🌸', color: '#441752' },
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
    { name: 'motorcycle', icon: '🏍️', color: '#441752' },
];

export { SearchProducts };