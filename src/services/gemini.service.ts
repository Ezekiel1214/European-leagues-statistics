
import { Injectable, signal } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { Agent } from '../models/agent.model';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI | null = null;
  public isInitialized = signal(false);

  constructor() {
    try {
      if (process.env.API_KEY) {
        this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        this.isInitialized.set(true);
      } else {
        console.error('API_KEY environment variable not found.');
        this.isInitialized.set(false);
      }
    } catch (error) {
      console.error('Error initializing GoogleGenAI:', error);
      this.isInitialized.set(false);
    }
  }

  private getAgentPrompt(agent: Agent, userPrompt: string): string {
    switch (agent.name) {
      case 'Architect':
        return `As the 'Architect' AI agent, your role is to create a high-level technical plan. Based on the user request "${userPrompt}", outline the main components, data structures, and overall architecture. Be concise and use bullet points.`;
      case 'UI/UX Designer':
        return `As the 'UI/UX Designer' AI agent, your role is to define the user experience. For the user request "${userPrompt}", describe the key UI elements, user flow, and interaction design principles. Focus on usability and aesthetics.`;
      case 'Code Generator':
        return `As the 'Code Generator' AI agent, your task is to write a complete, runnable HTML file. The output must be a single file that starts with <!DOCTYPE html> and includes <html>, <head>, and <body> tags. It must use Tailwind CSS for styling by including the official Tailwind CDN script in the <head>. Any necessary JavaScript should be included in a <script> tag within the body. The code should be clean, responsive, and directly implement the visual aspects of the user request: "${userPrompt}". Do not include any explanations, comments, or markdown formatting like \`\`\`html. Output only the raw HTML code.`;
      case 'Debugger & Optimizer':
        return `As the 'Debugger & Optimizer' AI agent, your job is to anticipate problems. For a component based on "${userPrompt}", list 3 potential bugs, 2 performance bottlenecks, and 1 accessibility issue to watch out for.`;
      case 'Creative Enhancer':
        return `As the 'Creative Enhancer' AI agent, your goal is to add flair. Suggest three innovative or delightful micro-interactions or visual effects that could enhance a web component for "${userPrompt}".`;
      case 'Documentation Writer':
        return `As the 'Documentation Writer' AI agent, your task is to create clear documentation. Write a brief, user-friendly description for a website component that fulfills this request: "${userPrompt}". Explain its purpose and primary features.`;
      case 'Integration Specialist':
        return `As the 'Integration Specialist' AI agent, you must identify external needs. For the request "${userPrompt}", list potential third-party APIs, services, or libraries that would be necessary or beneficial for implementation.`;
      default:
        return userPrompt;
    }
  }

  async generateAgentResponse(agent: Agent, userPrompt: string): Promise<string> {
    if (!this.ai) {
      return Promise.reject('Gemini AI client is not initialized.');
    }

    const fullPrompt = this.getAgentPrompt(agent, userPrompt);

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
      });
      return response.text;
    } catch (error) {
      console.error(`Error generating content for ${agent.name}:`, error);
      throw new Error(`The AI agent '${agent.name}' failed to generate a response. Please check your connection or API key.`);
    }
  }
}
