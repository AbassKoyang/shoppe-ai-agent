import { createTool } from "@mastra/core/tools";
import z from "zod";
import {db} from '../../../lib/firebase-admin';
import { OrderSchema, OrderType} from "./types";

export const getUserProductsTool = createTool({
    id: 'get-completed-orders',
    description: "Get products/items on shoppe that were posted/listed on shoppe by the user",
    inputSchema: z.object({}),
    outputSchema: OrderSchema.array().describe("An array of the user's listed products/items"),
    execute: async (context) => {
        const rc = context.runtimeContext;
        const userId = rc.get('userId');
        try {
            const ordersRef = db.collection('products');
            const q = ordersRef
              .where('sellerId', '==', userId)
              .orderBy('createdAt', 'desc');
          
          const ordersSnapshot = await q.get();
          return ordersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          })) as OrderType[];
        } catch (error) {
          console.error('Error fetching completed orders:', error);
          throw error;
        }
      },

})