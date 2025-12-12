
import axios from "axios";
import {
    DEFAULT_PAGE,
    DEFAULT_PER_PAGE,
    PRODUCTS_ENDPOINT
} from "../configs/constants";
import { useUserStore } from "../store/userStore";

// Enhanced search with better error handling and logging
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
            // Filter by category - CORRECT ENDPOINT FOR DUMMYJSON
            url = `${PRODUCTS_ENDPOINT}/category/${encodeURIComponent(category)}`;
            console.log(`📁 Category endpoint: ${url}`);
            isSearchEndpoint = false;
        } else if (searchKey && searchKey.trim() !== '') {
            // Search by keyword
            url = `${PRODUCTS_ENDPOINT}/search?q=${encodeURIComponent(searchKey.trim())}`;
            console.log(`🔎 Search endpoint: ${url}`);
            isSearchEndpoint = true;
        } else {
            // Get all products
            url = `${PRODUCTS_ENDPOINT}?`;
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
            const total = response.data.total || products.length;
            
            // Manual pagination for category endpoint
            const startIndex = (page - 1) * perPage;
            const endIndex = Math.min(startIndex + perPage, total);
            const paginatedProducts = products.slice(startIndex, endIndex);
            
            // Add QR codes to products
            const enhancedProducts = paginatedProducts.map((product: any, index: number) => ({
                ...product,
                qrCode: product.qrCode || `QR-${product.id || `CAT-${category}-${index + 1}`}`,
                thumbnail: product.thumbnail || product.images?.[0] || `https://via.placeholder.com/300x300?text=${encodeURIComponent(product.title || 'Product')}`,
                // Add seller info
                sellerInfo: getSellerInfoForProduct(product.id || index)
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

            // Add QR codes and seller info to products
            const enhancedProducts = products.map((product: any) => ({
                ...product,
                qrCode: product.qrCode || `QR-${product.id}`,
                thumbnail: product.thumbnail || product.images?.[0] || `https://via.placeholder.com/300x300?text=${encodeURIComponent(product.title || 'Product')}`,
                // Add seller info
                sellerInfo: getSellerInfoForProduct(product.id)
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
        // Return enhanced mock data on error with seller info
        return getMockProducts(searchKey, category, page, perPage);
    }
}

// Get seller products (for seller dashboard)
export const GetSellerProducts = async (sellerId?: number) => {
    console.log(`🛍️ GetSellerProducts called for seller:`, sellerId);
    
    try {
        // In a real app, this would be a separate endpoint for seller products
        // For now, we'll use the store or filter from the main API
        
        // Get all products
        const response = await axios.get(`${PRODUCTS_ENDPOINT}?limit=100`);
        let products = response.data.products || [];
        
        // Filter products that belong to this seller
        // Since dummyjson doesn't have seller info, we'll simulate it
        const sellerProducts = products
            .filter((product: any) => {
                // Simulate: products with IDs divisible by seller's ID (if provided) or by 3
                if (sellerId) {
                    return product.id % sellerId === 0 || product.id % 3 === 0;
                }
                return product.id % 3 === 0; // Default seller products
            })
            .map((product: any) => ({
                ...product,
                sellerId: sellerId || 2, // Default to seller ID 2
                status: product.stock > 0 ? 'active' : 'out_of_stock',
                sold: Math.floor(Math.random() * 50) + 10,
                createdAt: new Date(Date.now() - Math.random() * 31536000000).toISOString(), // Random date within last year
                updatedAt: new Date().toISOString(),
                sellerInfo: getSellerInfoForProduct(product.id, sellerId)
            }));
        
        console.log(`✅ Found ${sellerProducts.length} products for seller ${sellerId}`);
        return sellerProducts;
        
    } catch (error) {
        console.error('❌ Error fetching seller products:', error);
        // Return mock seller products
        return getMockSellerProducts(sellerId);
    }
}

// Get seller-specific product details
export const GetSellerProductDetails = async (productId: number, sellerId?: number) => {
    console.log(`🛍️ GetSellerProductDetails: ${productId} for seller ${sellerId}`);
    
    try {
        const response = await axios.get(`${PRODUCTS_ENDPOINT}/${productId}`);
        
        // Enhance with seller-specific data
        const sellerProduct = {
            ...response.data,
            sellerId: sellerId || 2,
            sellerInfo: getSellerInfoForProduct(productId, sellerId),
            stock: response.data.stock || 50,
            sold: Math.floor(Math.random() * 100) + 20,
            status: response.data.stock > 0 ? 'active' : 'out_of_stock',
            views: Math.floor(Math.random() * 500) + 100,
            revenue: (response.data.price || 0) * (Math.floor(Math.random() * 50) + 10),
            createdAt: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
            updatedAt: new Date().toISOString(),
            // Add seller management fields
            canEdit: true,
            canDelete: true,
            isFeatured: productId % 5 === 0,
            tags: response.data.tags || ['premium', 'featured', 'bestseller']
        };
        
        return sellerProduct;
        
    } catch (error) {
        console.error('❌ Error fetching seller product details:', error);
        return getMockSellerProductDetails(productId, sellerId);
    }
}

// Update seller product stock
export const UpdateSellerProductStock = async (productId: number, newStock: number, sellerId?: number) => {
    console.log(`📦 UpdateSellerProductStock: ${productId} to ${newStock} for seller ${sellerId}`);
    
    // In a real app, this would be a PUT/PATCH request
    // For now, simulate API call and update store
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update in store (in a real app, this would come from API response)
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
            sellerId
        };
        
    } catch (error) {
        console.error('❌ Error updating stock:', error);
        return {
            success: false,
            message: 'Failed to update stock',
            productId,
            newStock,
            sellerId
        };
    }
}

// Add new product (seller)
export const AddSellerProduct = async (productData: any, sellerId?: number) => {
    console.log(`➕ AddSellerProduct for seller ${sellerId}:`, productData);
    
    try {
        // In a real app, this would be a POST request
        // For now, simulate API call and update store
        
        // Generate a unique ID (in real app, this would come from server)
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
            sellerId: sellerId || 2,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sellerInfo: getSellerInfoForProduct(newProductId, sellerId)
        };
        
        // Add to store (in a real app, this would come from API response)
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
    console.log(`🗑️ DeleteSellerProduct: ${productId} for seller ${sellerId}`);
    
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Delete from store (in a real app, this would be a DELETE request)
        const { deleteSellerProduct } = useUserStore.getState();
        deleteSellerProduct(productId);
        
        return {
            success: true,
            message: 'Product deleted successfully',
            productId,
            sellerId
        };
        
    } catch (error) {
        console.error('❌ Error deleting product:', error);
        return {
            success: false,
            message: 'Failed to delete product',
            productId,
            sellerId
        };
    }
}

// Get seller statistics
export const GetSellerStats = async (sellerId?: number) => {
    console.log(`📊 GetSellerStats for seller:`, sellerId);
    
    try {
        // Get seller products
        const sellerProducts = await GetSellerProducts(sellerId);
        
        // Calculate statistics
        const totalProducts = sellerProducts.length;
        const totalRevenue = sellerProducts.reduce((sum: number, product: any) => 
            sum + (product.price * (product.sold || 0)), 0);
        const totalOrders = Math.floor(totalRevenue / 100); // Simplified calculation
        
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
            sellerId: sellerId || 2,
            totalRevenue: Math.round(totalRevenue),
            totalOrders,
            totalProducts,
            totalCustomers: Math.floor(totalOrders * 0.7), // Estimated
            monthlyGrowth: 12.5, // Static for now
            lowStockProducts: lowStockProducts.length,
            outOfStockProducts: outOfStockProducts.length,
            popularCategories,
            lastUpdated: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('❌ Error fetching seller stats:', error);
        return getMockSellerStats(sellerId);
    }
}

// Helper function to get seller info for a product
const getSellerInfoForProduct = (productId: number, sellerId?: number) => {
    const sellerIdToUse = sellerId || 2; // Default seller ID
    
    const sellers = [
        {
            id: 2,
            name: "Luxury Elite Store",
            rating: 4.8,
            totalProducts: 42,
            joined: "2023-01-15",
            verified: true,
            responseRate: 98,
            shippingTime: "1-2 days"
        },
        {
            id: 3,
            name: "Premium Collections",
            rating: 4.9,
            totalProducts: 28,
            joined: "2023-03-20",
            verified: true,
            responseRate: 99,
            shippingTime: "2-3 days"
        },
        {
            id: 4,
            name: "Designer Hub",
            rating: 4.7,
            totalProducts: 35,
            joined: "2023-02-10",
            verified: true,
            responseRate: 95,
            shippingTime: "3-5 days"
        }
    ];
    
    // Pick seller based on product ID or provided sellerId
    const sellerIndex = sellerIdToUse ? 
        sellers.findIndex(s => s.id === sellerIdToUse) : 
        productId % sellers.length;
    
    return sellers[sellerIndex] || sellers[0];
}

// Mock data generator for fallback with seller info
const getMockProducts = (searchKey: string, category: string, page: number, perPage: number) => {
    const mockProducts = [];
    const total = 45;
    const startIndex = (page - 1) * perPage;
    
    for (let i = 0; i < Math.min(perPage, 10); i++) {
        const id = startIndex + i + 1;
        const sellerInfo = getSellerInfoForProduct(id);
        
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
            sellerInfo: sellerInfo,
            sellerId: sellerInfo.id,
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

// Mock seller products
const getMockSellerProducts = (sellerId?: number) => {
    const products = [];
    const productCount = 12;
    const sellerIdToUse = sellerId || 2;
    
    for (let i = 1; i <= productCount; i++) {
        const id = sellerIdToUse * 100 + i;
        products.push({
            id: id,
            title: `Seller Product ${i}`,
            description: `Premium product from seller ${sellerIdToUse}`,
            price: 49.99 + (i * 25),
            stock: Math.floor(Math.random() * 50) + 10,
            sold: Math.floor(Math.random() * 100) + 20,
            category: ['smartphones', 'laptops', 'fragrances', 'beauty'][i % 4],
            status: i % 5 === 0 ? 'out_of_stock' : 'active',
            rating: 4 + (Math.random() * 1),
            images: [`https://images.unsplash.com/photo-${1546868871 + id}?w=300&h=300&fit=crop`],
            thumbnail: `https://images.unsplash.com/photo-${1546868871 + id}?w=300&h=300&fit=crop`,
            sellerId: sellerIdToUse,
            createdAt: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
            updatedAt: new Date().toISOString()
        });
    }
    
    return products;
};

// Mock seller product details
const getMockSellerProductDetails = (productId: number, sellerId?: number) => {
    const sellerIdToUse = sellerId || 2;
    
    return {
        id: productId,
        title: `Seller Exclusive Product #${productId}`,
        description: "Premium seller-exclusive product with enhanced features.",
        price: 199.99 + (productId * 10),
        stock: 25 + (productId % 30),
        sold: Math.floor(Math.random() * 100) + 30,
        category: "luxury",
        status: productId % 5 === 0 ? 'out_of_stock' : 'active',
        rating: 4.5 + (Math.random() * 0.5),
        images: [
            "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&h=400&fit=crop"
        ],
        thumbnail: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=400&fit=crop",
        sellerId: sellerIdToUse,
        sellerInfo: getSellerInfoForProduct(productId, sellerIdToUse),
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

// Mock seller stats
const getMockSellerStats = (sellerId?: number) => {
    const sellerIdToUse = sellerId || 2;
    
    return {
        sellerId: sellerIdToUse,
        totalRevenue: 24580 + (sellerIdToUse * 1000),
        totalOrders: 156 + (sellerIdToUse * 10),
        totalProducts: 42 + (sellerIdToUse * 2),
        totalCustomers: 1245 + (sellerIdToUse * 50),
        monthlyGrowth: 12.5 + (sellerIdToUse * 0.5),
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
      const isPopular = ['smartphones', 'laptops', 'fragrances', 'beauty', 'womens-dresses', 'mens-shirts']
        .includes(category.toLowerCase());
      const isNew = ['motorcycle', 'vehicle']
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
      if (a.isNew && !b.isNew) return -1;
      if (!a.isNew && b.isNew) return 1;
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
      isPopular: ['smartphones', 'laptops', 'fragrances', 'beauty', 'womens-dresses', 'mens-shirts']
        .includes(cat.name.toLowerCase()),
      isNew: ['motorcycle', 'vehicle']
        .includes(cat.name.toLowerCase()),
      productCount: Math.floor(Math.random() * 30) + 5,
      hasProducts: true,
      icon: cat.icon,
      color: cat.color
    }))
    .sort((a, b) => {
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      if (a.isNew && !b.isNew) return -1;
      if (!a.isNew && b.isNew) return 1;
      return b.productCount - a.productCount;
    });
};

// Product details function with enhanced features and QR code
export const GetProductDetails = async (productId: number) => {
    console.log(`🔄 GetProductDetails: Fetching product ${productId}`);
    
    try {
        const response = await axios.get(`${PRODUCTS_ENDPOINT}/${productId}`);
        console.log(`✅ GetProductDetails: Successfully fetched product ${productId}`);
        
        // Enhance product data with QR code, seller info, and ensure all fields
        const enhancedProduct = {
            ...response.data,
            qrCode: response.data.qrCode || `QR-${productId}`,
            thumbnail: response.data.thumbnail || response.data.images?.[0] || `https://via.placeholder.com/600x400?text=Product+${productId}`,
            images: response.data.images || [response.data.thumbnail] || [`https://via.placeholder.com/600x400?text=Product+${productId}`],
            reviews: response.data.reviews || getMockReviews(productId),
            sellerInfo: getSellerInfoForProduct(productId),
            meta: response.data.meta || {
                materials: ["Premium Materials", "Fine Craftsmanship"],
                origin: "Internationally Sourced",
                shipping: "Worldwide Express Delivery",
                sellerNote: "Sold by verified premium seller"
            }
        };
        
        return enhancedProduct;
        
    } catch (error) {
        console.error(`❌ GetProductDetails: Error fetching product ${productId}:`, error);
        
        // Enhanced mock product data with QR code and seller info
        const sellerInfo = getSellerInfoForProduct(productId);
        
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
            sellerInfo: sellerInfo,
            sellerId: sellerInfo.id,
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
                authenticity: "100% Authentic with Certificate",
                sellerNote: `Sold by ${sellerInfo.name} - Verified Premium Seller`
            },
            specifications: {
                material: "Premium Materials",
                color: "Various Available",
                size: "Standard/Medium",
                feature1: "Water Resistant",
                feature2: "Scratch Proof",
                feature3: "Eco Friendly",
                sellerGuarantee: "30-day money back guarantee"
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

// Category icons and colors mapping - UPDATED WITH CORRECT CATEGORIES
const categoryIcons = [
    { name: 'smartphones', icon: '📱', color: '#F29F58' },
    { name: 'laptops', icon: '💻', color: '#AB4459' },
    { name: 'fragrances', icon: '🌸', color: '#441752' },
    { name: 'beauty', icon: '✨', color: '#4ECDC4' },
    { name: 'groceries', icon: '🛒', color: '#FF6B95' },
    { name: 'home-decoration', icon: '🏠', color: '#7877C6' },
    { name: 'furniture', icon: '🛋️', color: '#F29F58' },
    { name: 'tops', icon: '👕', color: '#AB4459' },
    { name: 'womens-dresses', icon: '👗', color: '#441752' },
    { name: 'womens-shoes', icon: '👠', color: '#4ECDC4' },
    { name: 'mens-shirts', icon: '👔', color: '#FF6B95' },
    { name: 'mens-shoes', icon: '👞', color: '#7877C6' },
    { name: 'mens-watches', icon: '⌚', color: '#F29F58' },
    { name: 'womens-watches', icon: '⌚', color: '#AB4459' },
    { name: 'womens-bags', icon: '👜', color: '#441752' },
    { name: 'womens-jewellery', icon: '💎', color: '#4ECDC4' },
    { name: 'sunglasses', icon: '🕶️', color: '#FF6B95' },
    { name: 'vehicle', icon: '🚗', color: '#7877C6' },
    { name: 'motorcycle', icon: '🏍️', color: '#F29F58' },
];
