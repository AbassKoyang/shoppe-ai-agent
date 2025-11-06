import { createTool } from "@mastra/core/tools";
import z from "zod";
import {db} from '../../../lib/firebase-admin';
import { OrderSchema, OrderType} from "./types";

export const getCompletedOrdersTool = createTool({
    id: 'get-completed-orders',
    description: "Get a user's completed orders. Completed orders are orders that have been received by the buyer. Orders can have one of the following status 'pending', 'delivered', 'completed', or 'cancelled'. An order is considered completed when it's status is completed.",
    inputSchema: z.object({}),
    outputSchema: OrderSchema.array().describe("An array of the user's completed order on shoppe"),
    execute: async (context) => {
        const rc = context.runtimeContext;
        const userId = rc.get('userId');
        try {
            const ordersRef = db.collection('orders');
            const q = ordersRef
              .where('buyerInfo.id', '==', userId)
              .where('status', '==', 'completed')
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