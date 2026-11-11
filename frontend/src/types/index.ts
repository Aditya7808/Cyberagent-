export type UserRole = 'admin' | 'operator' | 'viewer';

export interface User {
  id: string;
  org_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  settings: Record<string, any>;
  created_at: string;
}

export type AgentStatus = 'draft' | 'active' | 'archived';

export interface AgentTool {
  id: string;
  agent_id: string;
  tool_name: string;
  description?: string;
  parameters_schema: Record<string, any>;
  auth_level: 'open' | 'restricted' | 'approval_required';
  enabled: boolean;
}

export interface Agent {
  id: string;
  org_id: string;
  name: string;
  model_id: string;
  system_prompt: string;
  config: Record<string, any>;
  status: AgentStatus;
  tools?: AgentTool[];
  created_at: string;
}

export interface Document {
  id: string;
  org_id: string;
  title: string;
  source_type: string;
  access_level: 'public' | 'internal' | 'confidential' | 'restricted';
  file_type?: string;
  created_at: string;
}
