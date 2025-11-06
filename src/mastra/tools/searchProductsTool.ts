import dotenv from 'dotenv';
dotenv.config();
import { createTool } from '@mastra/core';
import { z } from 'zod';
import {algoliasearch, SearchResponse} from 'algoliasearch';
import { ProductSchema, ProductType } from './types';

const ALGOLIA_APP_ID = process.env.PUBLIC_ALGOLIA_APP_ID!;
const ALGOLIA_WRITE_API_KEY = process.env.PUBLIC_ALGOLIA_WRITE_API_KEY!;
const ALGOLIA_INDEX_NAME = 'products';

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_WRITE_API_KEY);

export const searchProductsTool = createTool({
  id: 'searchProductsTool',
  description: `
Search for products listed on the Shoppe marketplace using flexible filters such as name, price range, category, location, color, size, and condition.  
The tool returns an array of matching products based on the user’s search criteria.  
Include descriptive keywords in your query (e.g., "blue sneakers", "men's polo shirts", "leather bags", "vintage dresses") to refine the search and improve accuracy.`,
inputSchema: z.object({
  query: z.string().optional().describe(
    'Search keyword or product name. Include descriptive keywords such as "sneakers", "tops", "pants", "red dress", or "men’s jacket" to refine results.'
  ),

  currency: z.union([
    z.literal("$ USD"),
    z.literal("€ EURO"),
    z.literal("₦ NGN")
  ]).default("₦ NGN").optional(),

  category: z.literal([
    "Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Accessories", "Bags",
    "Underwear", "Swimwear", "Activewear", "Other"
  ]).array().optional().describe(
    "Main category of the product, such as Tops, Bottoms, Shoes, Accessories, etc."
  ),

  subCategory: z.literal([
    "T-Shirts", "Polo Shirts", "Tank Tops", "Blouses", "Dress Shirts", "Henleys",
    "Sweatshirts", "Hoodies", "Crop Tops", "Tunics",
    "Jeans", "Chinos", "Dress Pants", "Joggers", "Leggings", "Shorts", "Cargo Pants", "Skirts", "Capris", "Overalls",
    "Casual Dresses", "Evening Gowns", "Cocktail Dresses", "Maxi Dresses", "Mini Dresses", "Bodycon Dresses", "Wrap Dresses", "Shirt Dresses", "Sundresses", "Work Dresses",
    "Jackets", "Blazers", "Coats", "Trench Coats", "Parkas", "Bomber Jackets", "Leather Jackets", "Denim Jackets", "Cardigans", "Vests",
    "Sneakers", "Boots", "Sandals", "Loafers", "Heels", "Flats", "Wedges", "Espadrilles", "Oxfords", "Slippers",
    "Backpacks", "Tote Bags", "Crossbody Bags", "Clutches", "Shoulder Bags", "Messenger Bags", "Satchels", "Duffle Bags", "Belt Bags", "Laptop Bags",
    "Hats & Caps", "Scarves", "Gloves", "Belts", "Ties & Bowties", "Watches", "Jewelry", "Sunglasses", "Wallets", "Hair Accessories",
    "Boxers", "Briefs", "Trunks", "Bras", "Panties", "Camisoles", "Thermal Underwear", "Shapewear", "Bralettes", "Lingerie",
    "Bikinis", "One-Piece Swimsuits", "Tankinis", "Swim Trunks", "Boardshorts", "Rash Guards", "Swim Dresses", "Monokinis", "Swim Skirts", "Cover-Ups",
    "Gym Shorts", "Sports Bras", "Leggings", "Tracksuits", "Compression Wear", "Athletic T-Shirts", "Tank Tops", "Joggers", "Hoodies", "Yoga Pants",
    "Custom Wear", "Uniforms", "Costumes", "Maternity Wear", "Workwear", "Ethnic Wear", "Festival Outfits", "Seasonal Clothing", "Vintage", "Miscellaneous"
  ]).optional().describe(
    "Specific subcategory under the main category, such as 'Sneakers', 'Hoodies', or 'Maxi Dresses'."
  ),

  minPrice: z.number().optional().describe(
    "Minimum price to include in search results."
  ),

  maxPrice: z.number().optional().describe(
    "Maximum price to include in search results."
  ),

  discountPercentage: z.number().optional().describe(
    "Filter products with at least this percentage discount."
  ),

  size: z.union([
    z.literal(["One Size", "XS", "S", "M", "L", "XL", "XXL"]),
    z.string().regex(/^\d+$/, "Numeric size must be digits only"),
  ]).array().default(['M']).optional().describe(
    "Product size or measurement. Can include lettered sizes (S, M, L) or numeric sizes (e.g., 32, 40)."
  ),

  gender: z.literal(["Men", "Women", "Unisex"]).optional().describe(
    "Target gender for the product, such as Men, Women, or Unisex."
  ),

  condition: z.literal(["new", "used"]).optional().describe(
    "Condition of the product — either 'new' or 'used'."
  ),

  order: z.literal(["Popular", "Newest", "Oldest", "PriceHighToLow", "PriceLowToHigh"]).optional().describe(
    "Sorting order for results — e.g., by popularity, newest arrivals, or price range."
  ),
}),
  outputSchema: z.object({
    success: z.boolean(),
    count: z.number(),
    products: ProductSchema.array().optional(),
    message: z.string().optional()
  }),
  
  async execute({context}) {
    try {
      const {
        query,
        category,
        subCategory,
        currency,
        minPrice,
        maxPrice,
        discountPercentage,
        size,
        gender,
        condition,
        order,
      } = context;

      const facetFilters: string[][] = [['status:available']];

      if (currency) facetFilters.push([`currency:${currency}`]);
      if (gender) facetFilters.push([`gender:${gender}`]);
      if (condition) facetFilters.push([`condition:${condition}`]);

      if (size) {
        const formatSizes = (sizes: string[]) => {
        return sizes.map((s) => `size:${s}`)
        } 
        const formattedSizes = formatSizes(size);
        facetFilters.push(formattedSizes)
    }
     if (category) {
        const formatCategory = (categories: string[]) => {
        return categories.map((s) => `category:${s}`)
        } 
        const formattedCategories = formatCategory(category);
        facetFilters.push(formattedCategories)
    }

      const numericFilters: string[][] = [];
      if (minPrice) numericFilters.push([`price>=${minPrice}`]);
      if (maxPrice) numericFilters.push([`price<=${maxPrice}`]);
      if (discountPercentage) numericFilters.push([`discountPercentage>=${discountPercentage}`]);

      let sortBy: string | undefined;
      if (order === 'Newest') sortBy = 'createdAt_desc';
      if (order === 'Oldest') sortBy = 'createdAt_asc';
      if (order === 'Popular') sortBy = 'popular_desc';
      if (order === 'PriceHighToLow') sortBy = 'price_desc';
      if (order === 'PriceLowToHigh') sortBy = 'price_asc';

      const res = await client.search({
        requests: [
          {
            query: query || '',
            indexName: sortBy ? `${ALGOLIA_INDEX_NAME}_${sortBy}` : ALGOLIA_INDEX_NAME,
            facetFilters,
            numericFilters,
          },
        ],
      });

      const searchResult = res.results[0] as SearchResponse<any>;
      const products = searchResult.hits.map((p) => ({
        id: p.objectID,
        ...p
      })) as ProductType[];

      return {
        success: true,
        count: products.length,
        products,
      };
    } catch (error) {
      console.error('❌ searchProductsTool error:', error);
      return { success: false, count: 0, message: String(error) };
    }
  },
});
