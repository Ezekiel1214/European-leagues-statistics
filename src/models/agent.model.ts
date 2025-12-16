
export type AgentStatus = 'pending' | 'active' | 'complete' | 'error';

export interface Agent {
  name: string;
  description: string;
  providerIcon: string; 
  status: AgentStatus;
  output?: string;
}
