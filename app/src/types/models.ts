export interface Organization {
  id: number;
  name: string;
  comment?: string;
  createdAt: string;
}

export interface Department {
  id: number;
  name: string;
  comment?: string;
  organizationId: number;
  parentId?: number;
  organization?: Organization;
  parent?: Department;
  children?: Department[];
}

export interface Position {
  id: number;
  name: string;
  comment?: string;
}
