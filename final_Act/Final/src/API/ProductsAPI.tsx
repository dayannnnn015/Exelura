import axios from "axios";
import {
    DEFAULT_PAGE,
    DEFAULT_PER_PAGE,
    PRODUCTS_ENDPOINT
} from "../configs/constants";
import { useUserStore } from "../store/userStore";

// Search products - ALL products belong to seller 2
export const SearchProducts = async ({
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
            url = `${PRODUCTS_ENDPOINT}/category/${encodeURIComponent(category)}`;
            console.log(`📁 Category endpoint: ${url}`);
            isSearchEndpoint = false;
        } else if (searchKey && searchKey.trim() !== '') {
            url = `${PRODUCTS_ENDPOINT}/search?q=${encodeURIComponent(searchKey.trim())}`;
            console.log(`🔎 Search endpoint: ${url}`);
            isSearchEndpoint = true;
        } else {
            url = `${PRODUCTS_ENDPOINT}?`;
            console.log(`📦 All products endpoint: ${url}`);
            isSearchEndpoint = false;
        }
        
        // Add pagination
        const paginationParams = `limit=${perPage}&skip=${(page - 1) * perPage}`;
        
        if (category) {
            // For category endpoint
            const response = await axios.get(url);
            console.log(`✅ Category response:`, response.data);
            
            let products = response.data.products || [];
            const total = response.data.total || products.length;
            
            // Manual pagination
            const startIndex = (page - 1) * perPage;
            const endIndex = Math.min(startIndex + perPage, total);
            const paginatedProducts = products.slice(startIndex, endIndex);
            
            // Enhance products with seller info (ALL belong to seller 2)
            const enhancedProducts = paginatedProducts.map((product: any, index: number) => ({
                ...product,
                qrCode: `QR-${product.id || `CAT-${category}-${index + 1}`}`,
                thumbnail: product.thumbnail || product.images?.[0] || `https://via.placeholder.com/300x300?text=${encodeURIComponent(product.title || 'Product')}`,
                sellerId: 2, // ALL products belong to seller 2
                sellerInfo: {
                    id: 2,
                    name: "Luxury Elite Store",
                    rating: 4.8,
                    totalProducts: 42,
                    joined: "2023-01-15",
                    verified: true,
                    responseRate: 98,
                    shippingTime: "1-2 days"
                }
            }));
            
            return { 
                products: enhancedProducts, 
                perPage, 
                total, 
                page, 
                lastPage: Math.ceil(total / perPage) 
            };
        } else {
            // For search and all products
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

            // Enhance products with seller info (ALL belong to seller 2)
            const enhancedProducts = products.map((product: any) => ({
                ...product,
                qrCode: `QR-${product.id}`,
                thumbnail: product.thumbnail || product.images?.[0] || `https://via.placeholder.com/300x300?text=${encodeURIComponent(product.title || 'Product')}`,
                sellerId: 2, // ALL products belong to seller 2
                sellerInfo: {
                    id: 2,
                    name: "Luxury Elite Store",
                    rating: 4.8,
                    totalProducts: 42,
                    joined: "2023-01-15",
                    verified: true,
                    responseRate: 98,
                    shippingTime: "1-2 days"
                }
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
        // Return mock data with seller 2
        return getMockProducts(searchKey, category, page, perPage);
    }
}

// Get seller products (ALL products belong to seller 2)
export const GetSellerProducts = async (sellerId?: number) => {
    console.log(`🛍️ GetSellerProducts called for seller:`, sellerId || 2);
    
    try {
        const sellerIdToUse = 2; // Always seller 2
        
        // Get all products from API
        const response = await axios.get(`${PRODUCTS_ENDPOINT}?limit=50`);
        let products = response.data.products || [];
        
        // Assign ALL products to seller 2
        const sellerProducts = products.map((product: any) => ({
            ...product,
            sellerId: 2, // ALL products belong to seller 2
            status: 'active',
            sold: Math.floor(Math.random() * 50) + 10,
            stock: product.stock || Math.floor(Math.random() * 100) + 20,
            createdAt: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
            updatedAt: new Date().toISOString(),
            thumbnail: product.thumbnail || product.images?.[0] || `https://via.placeholder.com/300x300?text=Product+${product.id}`,
            category: product.category || 'uncategorized',
            price: product.price || 99.99
        }));
        
        console.log(`✅ Found ${sellerProducts.length} products for seller 2`);
        return sellerProducts;
        
    } catch (error) {
        console.error('❌ Error fetching seller products:', error);
        // Return mock products all assigned to seller 2
        return getMockProductsForSeller2();
    }
}

// Get seller product details
export const GetSellerProductDetails = async (productId: number, sellerId?: number) => {
    console.log(`🛍️ GetSellerProductDetails: ${productId} for seller 2`);
    
    try {
        const response = await axios.get(`${PRODUCTS_ENDPOINT}/${productId}`);
        
        // Enhance with seller-specific data (seller 2)
        const sellerProduct = {
            ...response.data,
            sellerId: 2, // Always seller 2
            sellerInfo: {
                id: 2,
                name: "Luxury Elite Store",
                rating: 4.8,
                verified: true
            },
            stock: response.data.stock || 50,
            sold: Math.floor(Math.random() * 100) + 20,
            status: 'active',
            views: Math.floor(Math.random() * 500) + 100,
            revenue: (response.data.price || 0) * (Math.floor(Math.random() * 50) + 10),
            createdAt: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
            updatedAt: new Date().toISOString(),
            canEdit: true,
            canDelete: true,
            isFeatured: productId % 5 === 0,
            tags: response.data.tags || ['premium', 'featured', 'bestseller']
        };
        
        return sellerProduct;
        
    } catch (error) {
        console.error('❌ Error fetching seller product details:', error);
        return getMockSellerProductDetails(productId);
    }
}

// Update seller product stock
export const UpdateSellerProductStock = async (productId: number, newStock: number, sellerId?: number) => {
    console.log(`📦 UpdateSellerProductStock: ${productId} to ${newStock} for seller 2`);
    
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update in store
        const { updateSellerProduct } = useUserStore.getState();
        updateSellerProduct(productId, { 
            stock: newStock,
            status: newStock === 0 ? 'out_of_stock' : 'active'
        });
        
        return {
            success: true,
            message: `Stock updated to ${newStock}`,
            productId,
            newStock,
            sellerId: 2
        };
        
    } catch (error) {
        console.error('❌ Error updating stock:', error);
        return {
            success: false,
            message: 'Failed to update stock',
            productId,
            newStock,
            sellerId: 2
        };
    }
}

// Add new product (for seller 2)
export const AddSellerProduct = async (productData: any, sellerId?: number) => {
    console.log(`➕ AddSellerProduct for seller 2:`, productData);
    
    try {
        // Generate a unique ID
        const newProductId = Date.now();
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Create the new product
        const newProduct = {
            id: newProductId,
            title: productData.title || 'New Product',
            description: productData.description || 'Premium product description',
            price: productData.price || 0,
            category: productData.category || 'uncategorized',
            stock: productData.stock || 0,
            sold: 0,
            rating: 0,
            images: productData.images || [
                'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=400&fit=crop'
            ],
            status: 'active',
            sellerId: 2, // Always seller 2
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sellerInfo: {
                id: 2,
                name: "Luxury Elite Store",
                rating: 4.8,
                verified: true
            }
        };
        
        // Add to store
        const { addSellerProduct } = useUserStore.getState();
        addSellerProduct(newProduct);
        
        return {
            success: true,
            message: 'Product added successfully',
            product: newProduct,
            productId: newProductId
        };
        
    } catch (error) {
        console.error('❌ Error adding product:', error);
        return {
            success: false,
            message: 'Failed to add product',
            productData
        };
    }
}

// Delete seller product
export const DeleteSellerProduct = async (productId: number, sellerId?: number) => {
    console.log(`🗑️ DeleteSellerProduct: ${productId} for seller 2`);
    
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Delete from store
        const { deleteSellerProduct } = useUserStore.getState();
        deleteSellerProduct(productId);
        
        return {
            success: true,
            message: 'Product deleted successfully',
            productId,
            sellerId: 2
        };
        
    } catch (error) {
        console.error('❌ Error deleting product:', error);
        return {
            success: false,
            message: 'Failed to delete product',
            productId,
            sellerId: 2
        };
    }
}

// Get seller statistics for seller 2
export const GetSellerStats = async (sellerId?: number) => {
    console.log(`📊 GetSellerStats for seller 2`);
    
    try {
        // Get seller products
        const sellerProducts = await GetSellerProducts(2);
        
        // Calculate statistics
        const totalProducts = sellerProducts.length;
        const totalRevenue = sellerProducts.reduce((sum: number, product: any) => 
            sum + (product.price * (product.sold || 0)), 0);
        const totalOrders = Math.floor(totalRevenue / 100);
        
        // Get low stock products
        const lowStockProducts = sellerProducts.filter((product: any) => 
            product.stock < 10 && product.stock > 0);
        
        // Get out of stock products
        const outOfStockProducts = sellerProducts.filter((product: any) => 
            product.stock === 0);
        
        // Calculate popular categories
        const categoryCounts: { [key: string]: number } = {};
        sellerProducts.forEach((product: any) => {
            const category = product.category || 'uncategorized';
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });
        
        const popularCategories = Object.entries(categoryCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        
        return {
            sellerId: 2,
            totalRevenue: Math.round(totalRevenue),
            totalOrders,
            totalProducts,
            totalCustomers: Math.floor(totalOrders * 0.7),
            monthlyGrowth: 12.5,
            lowStockProducts: lowStockProducts.length,
            outOfStockProducts: outOfStockProducts.length,
            popularCategories,
            lastUpdated: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('❌ Error fetching seller stats:', error);
        return getMockSellerStats();
    }
}

// Mock data generator for fallback (ALL products belong to seller 2)
const getMockProducts = (searchKey: string, category: string, page: number, perPage: number) => {
    const mockProducts = [];
    const total = 45;
    const startIndex = (page - 1) * perPage;
    
    for (let i = 0; i < Math.min(perPage, 10); i++) {
        const id = startIndex + i + 1;
        
        const product = {
            id: id,
            title: `${category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Premium'} Product ${searchKey ? `"${searchKey}"` : ''} #${id}`,
            description: "Experience unparalleled luxury and sophistication with this exclusive item.",
            price: 99.99 + (id * 10),
            discountPercentage: id % 3 === 0 ? 15 : 0,
            rating: 4 + (Math.random() * 1),
            stock: 10 + (id % 20),
            category: category || "luxury",
            tags: ["premium", "exclusive", "limited-edition"],
            thumbnail: `https://images.unsplash.com/photo-${1546868871 + id}?w=300&h=300&fit=crop`,
            images: [
                `https://images.unsplash.com/photo-${1546868871 + id}?w-600&h=400&fit=crop`,
                `https://images.unsplash.com/photo-${1560769629 + id}?w=600&h=400&fit=crop`
            ],
            brand: "Luxury Elite",
            qrCode: `QR-${id}`,
            sellerId: 2, // Always seller 2
            sellerInfo: {
                id: 2,
                name: "Luxury Elite Store",
                rating: 4.8,
                totalProducts: 42,
                joined: "2023-01-15",
                verified: true,
                responseRate: 98,
                shippingTime: "1-2 days"
            },
            reviews: [
                {
                    id: 1,
                    user: "Alexandra R.",
                    rating: 5,
                    comment: "Absolutely stunning! The quality is beyond expectations.",
                    date: "2024-01-15",
                    avatar: "https://randomuser.me/api/portraits/women/1.jpg"
                }
            ]
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

// Mock products for seller 2
const getMockProductsForSeller2 = () => {
    const products = [];
    const productCount = 12;
    
    for (let i = 1; i <= productCount; i++) {
        const id = i;
        products.push({
            id: id,
            title: `Product ${i}`,
            description: `Premium product from our store`,
            price: 49.99 + (i * 25),
            stock: Math.floor(Math.random() * 50) + 10,
            sold: Math.floor(Math.random() * 100) + 20,
            category: ['smartphones', 'laptops', 'fragrances', 'beauty'][i % 4],
            status: 'active',
            rating: 4 + (Math.random() * 1),
            images: [`https://images.unsplash.com/photo-${1546868871 + id}?w=300&h=300&fit=crop`],
            thumbnail: `https://images.unsplash.com/photo-${1546868871 + id}?w=300&h=300&fit=crop`,
            sellerId: 2, // Always seller 2
            createdAt: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
            updatedAt: new Date().toISOString()
        });
    }
    
    return products;
};

// Mock seller product details
const getMockSellerProductDetails = (productId: number) => {
    return {
        id: productId,
        title: `Seller Exclusive Product #${productId}`,
        description: "Premium seller-exclusive product with enhanced features.",
        price: 199.99 + (productId * 10),
        stock: 25 + (productId % 30),
        sold: Math.floor(Math.random() * 100) + 30,
        category: "luxury",
        status: 'active',
        rating: 4.5 + (Math.random() * 0.5),
        images: [
            "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&h=400&fit=crop"
        ],
        thumbnail: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=400&fit=crop",
        sellerId: 2,
        sellerInfo: {
            id: 2,
            name: "Luxury Elite Store",
            rating: 4.8,
            verified: true
        },
        views: 350 + (productId * 10),
        revenue: (199.99 + (productId * 10)) * (Math.floor(Math.random() * 50) + 30),
        createdAt: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
        updatedAt: new Date().toISOString(),
        canEdit: true,
        canDelete: true,
        isFeatured: productId % 3 === 0,
        tags: ['premium', 'seller-exclusive', 'featured']
    };
};

// Mock seller stats for seller 2
const getMockSellerStats = () => {
    return {
        sellerId: 2,
        totalRevenue: 24580,
        totalOrders: 156,
        totalProducts: 42,
        totalCustomers: 1245,
        monthlyGrowth: 12.5,
        lowStockProducts: 3,
        outOfStockProducts: 2,
        popularCategories: [
            { name: 'smartphones', count: 120 },
            { name: 'laptops', count: 85 },
            { name: 'fragrances', count: 65 },
            { name: 'beauty', count: 45 },
            { name: 'womens-watches', count: 32 }
        ],
        lastUpdated: new Date().toISOString()
    };
};

// Product details function
export const GetProductDetails = async (productId: number) => {
    console.log(`🔄 GetProductDetails: Fetching product ${productId}`);
    
    try {
        const response = await axios.get(`${PRODUCTS_ENDPOINT}/${productId}`);
        console.log(`✅ GetProductDetails: Successfully fetched product ${productId}`);
        
        // Enhance product data
        const enhancedProduct = {
            ...response.data,
            qrCode: `QR-${productId}`,
            thumbnail: response.data.thumbnail || response.data.images?.[0] || `https://via.placeholder.com/600x400?text=Product+${productId}`,
            images: response.data.images || [response.data.thumbnail] || [`https://via.placeholder.com/600x400?text=Product+${productId}`],
            sellerId: 2, // Always seller 2
            sellerInfo: {
                id: 2,
                name: "Luxury Elite Store",
                rating: 4.8,
                verified: true
            },
            reviews: getMockReviews(productId),
            meta: {
                materials: ["Premium Materials", "Fine Craftsmanship"],
                origin: "Internationally Sourced",
                shipping: "Worldwide Express Delivery",
                sellerNote: "Sold by verified premium seller"
            }
        };
        
        return enhancedProduct;
        
    } catch (error) {
        console.error(`❌ GetProductDetails: Error fetching product ${productId}:`, error);
        
        // Mock product data
        const mockProduct = {
            id: productId,
            title: `Premium Luxury Product #${productId}`,
            description: "Experience unparalleled luxury and sophistication with this exclusive item.",
            price: 299.99 + (productId * 20),
            discountPercentage: productId % 4 === 0 ? 20 : productId % 3 === 0 ? 15 : 0,
            rating: 4.5 + (Math.random() * 0.5),
            stock: 25 + (productId % 30),
            category: "Luxury Goods",
            tags: ["premium", "exclusive", "limited-edition"],
            thumbnail: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=400&fit=crop",
            qrCode: `QR-${productId}`,
            sellerId: 2,
            sellerInfo: {
                id: 2,
                name: "Luxury Elite Store",
                rating: 4.8,
                verified: true
            },
            images: [
                "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=400&fit=crop",
                "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&h=400&fit=crop"
            ],
            reviews: getMockReviews(productId)
        };
        
        console.log(`🔄 GetProductDetails: Returning mock product for ID ${productId}`);
        return mockProduct;
    }
};

// Helper function for mock reviews
const getMockReviews = (productId: number) => {
    const reviewTemplates = [
        "Absolutely stunning! The quality is beyond expectations.",
        "Beautiful craftsmanship. Worth every penny.",
        "This exceeded all my expectations. Truly luxurious!",
        "Perfect addition to my collection. Highly recommended."
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