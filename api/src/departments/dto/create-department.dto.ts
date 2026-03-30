export class CreateDepartmentDto {
    name: string;
    comment?: string;
    organizationId: number;
    parentId?: number;
}