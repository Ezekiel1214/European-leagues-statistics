
import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { Agent } from '../../models/agent.model';

@Component({
  selector: 'app-agent-pipeline',
  templateUrl: './agent-pipeline.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class AgentPipelineComponent {
  agents = input.required<Agent[]>();
  activeAgentIndex = input.required<number>();
}
