import { createTool } from "@mastra/core/tools";
import z from "zod";
import {db} from '../../../lib/firebase-admin';
import { OrderSchema, OrderType} from "./types";

export const getPendingSalesTool = createTool({
    id: 'get-pending-sales',
    description: "Get a user's pending sales. Pending sales are sales that are yet to be received by the buyer. Sales can have one of the following status 'pending', 'delivered', 'completed', or 'cancelled'. A sale is considered pending when it's status is either pending or delivered.",
    inputSchema: z.object({}),
    outputSchema: OrderSchema.array().describe("An array of the user's pending sale on shoppe"),
    execute: async (context) => {
        const rc = context.runtimeContext;
        const userId = rc.get('userId');
        try {
            const ordersRef = db.collection('orders');
            const q = ordersRef
              .where('sellerInfo.id', '==', userId)
              .where('status', 'in', ['pending', 'delivered'])
              .orderBy('createdAt', 'desc');
          
          const ordersSnapshot = await q.get();
          return ordersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          })) as OrderType[];
        } catch (error) {
          console.error('Error fetching pending sales:', error);
          throw error;
        }
      },

})