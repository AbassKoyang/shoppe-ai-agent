import dotenv from 'dotenv';
dotenv.config();
import { Agent } from "@mastra/core/agent";
import { getProductsTool } from "../tools/productTools";
import { MongoDBStore } from '@mastra/mongodb';
import { Memory } from '@mastra/memory';
import { searchProductsTool } from '../tools/searchProductsTool';

export const shoppeAgent = new Agent({
    name: 'ShoppeAgent',
    instructions: `
  You are Shoppe AI — an assistant for Shoppe users.
  You can:
  - Answer general questions about Shoppe (e.g. "How does payment work?")
  - Help users find products with specific filters.
  - Explain how escrow or refunds work.
  - Use tools for product lookup, but answer policy-related questions directly.
`,
model: 'google/gemini-2.5-flash',
memory: new Memory({
    storage: new MongoDBStore({
      url: process.env.MONGODB_URI!,
      dbName: process.env.MONGODB_APP_NAME!
    }),
    options: {
        lastMessages: 10,
    },
  }),
tools: {
    getProductsTool,
    searchProductsTool
}
})