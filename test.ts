import dotenv from 'dotenv';
dotenv.config();
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { mastra } from './src/mastra';

async function testLLM() {
    const threadId = "123";
    const resourceId = "user-456";
    const agent = mastra.getAgent('shoppeAgent');
  try {
    const stream = await agent.stream("Who are you?", {
        memory: {
          thread: threadId,
          resource: resourceId,
        }
      });
      
      for await (const chunk of stream.textStream) {
        process.stdout.write(chunk);
      }

    console.log("✅ LLM response:",);
  } catch (error) {
    console.error("❌ LLM test failed:", error);
  }
}

testLLM();
