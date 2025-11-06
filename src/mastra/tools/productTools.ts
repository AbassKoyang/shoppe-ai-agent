import { createTool } from "@mastra/core/tools";
import z from "zod";
import {db} from '../../../lib/firebase-admin';
import { ProductSchema, ProductType } from "./types";


export const getProductsTool = createTool({
    id: 'get-products',
    description: 'Get all available products on Shoppe.',
    inputSchema: z.object({}),
    outputSchema: ProductSchema.array().describe('Array of products on shoppe'),
    execute: async () => {
        const snapshot = await db.collection('products').where('status', '==', 'available').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ProductType[];
    },

})