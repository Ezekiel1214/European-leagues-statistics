
import { Component, ChangeDetectionStrategy, signal, inject, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Agent } from './models/agent.model';
import { GeminiService } from './services/gemini.service';
import { AgentPipelineComponent } from './components/agent-pipeline/agent-pipeline.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, FormsModule, AgentPipelineComponent],
})
export class AppComponent {
  private geminiService = inject(GeminiService);

  prompt = signal<string>('A responsive hero section for a SaaS product with a title, subtitle, CTA button, and a placeholder for an image.');
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  activeAgentIndex = signal<number>(-1);
  agents = signal<Agent[]>(this.getInitialAgents());
  
  isApiKeyMissing = signal<boolean>(!this.geminiService.isInitialized());
  
  private getInitialAgents(): Agent[] {
    return [
      { name: 'Architect', description: 'Creates the technical plan and structure.', providerIcon: '', status: 'pending' },
      { name: 'UI/UX Designer', description: 'Designs wireframes and user flows.', providerIcon: '', status: 'pending' },
      { name: 'Code Generator', description: 'Writes the HTML, CSS, and JavaScript.', providerIcon: '', status: 'pending' },
      { name: 'Debugger & Optimizer', description: 'Finds bugs and improves performance.', providerIcon: '', status: 'pending' },
      { name: 'Creative Enhancer', description: 'Adds creative flair and micro-interactions.', providerIcon: '', status: 'pending' },
      { name: 'Documentation Writer', description: 'Writes clear, user-facing documentation.', providerIcon: '', status: 'pending' },
      { name: 'Integration Specialist', description: 'Checks for API and third-party needs.', providerIcon: '', status: 'pending' },
    ];
  }

  async runPipeline(): Promise<void> {
    if (!this.prompt().trim() || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.agents.set(this.getInitialAgents());
    
    // Use a temporary array for updates to avoid signal anti-patterns
    let currentAgents = this.getInitialAgents();

    for (let i = 0; i < currentAgents.length; i++) {
      this.activeAgentIndex.set(i);
      
      currentAgents = currentAgents.map((agent, index) => 
        index === i ? { ...agent, status: 'active' } : agent
      );
      this.agents.set(currentAgents);

      // Add a small delay for visual effect
      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        const output = await this.geminiService.generateAgentResponse(currentAgents[i], this.prompt());
        currentAgents = currentAgents.map((agent, index) => 
          index === i ? { ...agent, status: 'complete', output } : agent
        );
        this.agents.set(currentAgents);
      } catch (e: any) {
        this.error.set(e.message || 'An unknown error occurred.');
        currentAgents = currentAgents.map((agent, index) => 
          index === i ? { ...agent, status: 'error', output: e.message } : agent
        );
        this.agents.set(currentAgents);
        break; // Stop the pipeline on error
      }
    }

    this.activeAgentIndex.set(-1);
    this.isLoading.set(false);
  }
}
