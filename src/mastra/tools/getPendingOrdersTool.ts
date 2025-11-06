import { createTool } from "@mastra/core/tools";
import z from "zod";
import {db} from '../../../lib/firebase-admin';
import { OrderSchema, OrderType} from "./types";

export const getPendingOrdersTool = createTool({
    id: 'get-pending-orders',
    description: "Get a user's pending orders. Pending orders are orders that are yet to be received by the buyer. Orders can have one of the following status 'pending', 'delivered', 'completed', or 'cancelled'. an order is considered pending when it's status is either pending or delivered.",
    inputSchema: z.object({}),
    outputSchema: OrderSchema.array().describe("An array of the user's pending order on shoppe"),
    execute: async (context) => {
        const rc = context.runtimeContext;
        const userId = rc.get('userId');
        try {
            const ordersRef = db.collection('orders');
            const q = ordersRef
              .where('buyerInfo.id', '==', userId)
              .where('status', 'in', ['pending', 'delivered'])
              .orderBy('createdAt', 'desc');
          
          const ordersSnapshot = await q.get();
          return ordersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          })) as OrderType[];
        } catch (error) {
          console.error('Error fetching pending orders:', error);
          throw error;
        }
      },

})