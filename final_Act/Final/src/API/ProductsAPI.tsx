import axios from "axios";
import {
    DEFAULT_PAGE,
    DEFAULT_PER_PAGE,
    PRODUCTS_ENDPOINT
} from "../configs/constants";

const SeachProducts = async ({
    searchKey,
    page = DEFAULT_PAGE,
    perPage = DEFAULT_PER_PAGE
}: {
    searchKey: string,
    page: number,
    perPage: number
}) => {
    const paginationParams = `&limit=${perPage}&skip=${(page - 1) * perPage}`;
    const response = await axios.get(`${PRODUCTS_ENDPOINT}/search?q=${searchKey}${paginationParams}`);
    const { products, skip, total } = response.data;

    return { products, perPage, total, page: skip / perPage + 1, lastPage: Math.ceil(total / perPage) };
}

// Fetch categories from API
export const GetCategories = async () => {
    try {
        const response = await axios.get(`${PRODUCTS_ENDPOINT}/categories`);
        // Enhance categories with icons and colors
        const enhancedCategories = response.data.map((category: string, index: number) => {
            const categoryData = categoryIcons.find(c => c.name.toLowerCase() === category.toLowerCase()) || {
                icon: categoryIcons[index % categoryIcons.length].icon,
                color: categoryIcons[index % categoryIcons.length].color
            };
            
            return {
                id: index + 1,
                name: category,
                displayName: formatCategoryName(category),
                ...categoryData
            };
        });
        
        return enhancedCategories;
    } catch (error) {
        console.error('Error fetching categories:', error);
        // Return mock categories if API fails
        return getMockCategories();
    }
};

// Mock categories with icons and colors for fallback
const getMockCategories = () => {
    return [
        { id: 1, name: 'smartphones', displayName: 'Smartphones', icon: '📱', color: '#2196F3' },
        { id: 2, name: 'laptops', displayName: 'Laptops', icon: '💻', color: '#4CAF50' },
        { id: 3, name: 'fragrances', displayName: 'Fragrances', icon: '🌸', color: '#9C27B0' },
        { id: 4, name: 'skincare', displayName: 'Skincare', icon: '🧴', color: '#FF9800' },
        { id: 5, name: 'groceries', displayName: 'Groceries', icon: '🛒', color: '#795548' },
        { id: 6, name: 'home-decoration', displayName: 'Home Decor', icon: '🏠', color: '#607D8B' },
        { id: 7, name: 'furniture', displayName: 'Furniture', icon: '🛋️', color: '#795548' },
        { id: 8, name: 'tops', displayName: 'Tops', icon: '👕', color: '#F44336' },
        { id: 9, name: 'womens-dresses', displayName: 'Dresses', icon: '👗', color: '#E91E63' },
        { id: 10, name: 'womens-shoes', displayName: 'Women Shoes', icon: '👠', color: '#9C27B0' },
        { id: 11, name: 'mens-shirts', displayName: 'Men Shirts', icon: '👔', color: '#2196F3' },
        { id: 12, name: 'mens-shoes', displayName: 'Men Shoes', icon: '👞', color: '#795548' },
        { id: 13, name: 'mens-watches', displayName: 'Watches', icon: '⌚', color: '#607D8B' },
        { id: 14, name: 'womens-watches', displayName: 'Women Watches', icon: '⌚', color: '#E91E63' },
        { id: 15, name: 'womens-bags', displayName: 'Bags', icon: '👜', color: '#FF5722' },
        { id: 16, name: 'womens-jewellery', displayName: 'Jewellery', icon: '💎', color: '#FFC107' },
        { id: 17, name: 'sunglasses', displayName: 'Sunglasses', icon: '🕶️', color: '#00BCD4' },
        { id: 18, name: 'automotive', displayName: 'Automotive', icon: '🚗', color: '#3F51B5' },
        { id: 19, name: 'motorcycle', displayName: 'Motorcycle', icon: '🏍️', color: '#FF9800' },
        { id: 20, name: 'lighting', displayName: 'Lighting', icon: '💡', color: '#FFC107' }
    ];
};

// Format category name for display
const formatCategoryName = (category: string) => {
    return category
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

// Category icons and colors mapping
const categoryIcons = [
    { name: 'smartphones', icon: '📱', color: '#2196F3' },
    { name: 'laptops', icon: '💻', color: '#4CAF50' },
    { name: 'fragrances', icon: '🌸', color: '#9C27B0' },
    { name: 'skincare', icon: '🧴', color: '#FF9800' },
    { name: 'groceries', icon: '🛒', color: '#795548' },
    { name: 'home-decoration', icon: '🏠', color: '#607D8B' },
    { name: 'furniture', icon: '🛋️', color: '#795548' },
    { name: 'tops', icon: '👕', color: '#F44336' },
    { name: 'womens-dresses', icon: '👗', color: '#E91E63' },
    { name: 'womens-shoes', icon: '👠', color: '#9C27B0' },
    { name: 'mens-shirts', icon: '👔', color: '#2196F3' },
    { name: 'mens-shoes', icon: '👞', color: '#795548' },
    { name: 'mens-watches', icon: '⌚', color: '#607D8B' },
    { name: 'womens-watches', icon: '⌚', color: '#E91E63' },
    { name: 'womens-bags', icon: '👜', color: '#FF5722' },
    { name: 'womens-jewellery', icon: '💎', color: '#FFC107' },
    { name: 'sunglasses', icon: '🕶️', color: '#00BCD4' },
    { name: 'automotive', icon: '🚗', color: '#3F51B5' },
    { name: 'motorcycle', icon: '🏍️', color: '#FF9800' },
    { name: 'lighting', icon: '💡', color: '#FFC107' }
];

// Product details function (keeping your existing)
export const GetProductDetails = async (productId: number) => {
    // Mock function - replace with actual API call
    return {
        id: productId,
        title: "Product Details",
        description: "Detailed product description...",
        price: 99.99,
        discountPercentage: 15,
        rating: 4.5,
        stock: 50,
        category: "Electronics",
        tags: ["New", "Popular", "Limited"],
        thumbnail: "https://via.placeholder.com/300",
        images: [
            "https://via.placeholder.com/600x400",
            "https://via.placeholder.com/600x400/2",
            "https://via.placeholder.com/600x400/3"
        ],
        brand: "Premium Brand",
        sku: "PRD-001",
        weight: "1.5kg",
        dimensions: "10x5x8 inches",
        warranty: "2 Years",
        reviews: [
            {
                id: 1,
                user: "John Doe",
                rating: 5,
                date: "2024-01-15",
                comment: "Excellent product, highly recommended!",
                avatar: "https://via.placeholder.com/40"
            },
        ],
        meta: {
            qrCode: "https://via.placeholder.com/150"
        }
    };
};

export { SeachProducts };