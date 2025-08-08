// Interfaces para la base de datos
export interface IGroup {
    id: string;
    name: string;
    description: string | null;
    created_by: string;
    created_at: Date;
    updated_at: Date;
}

export interface IGroupMember {
    group_id: string;
    user_id: string;
    joined_at: Date;
    role: 'admin' | 'member';
}

// Interface para grupo con información de miembros
export interface IGroupWithMembers extends IGroup {
    members: Array<{
        user_id: string;
        user_name: string;
        user_email: string;
        role: 'admin' | 'member';
        joined_at: Date;
    }>;
    member_count: number;
}

// Interfaces para requests
export interface CreateGroupRequest {
    name: string;
    description?: string;
}

export interface UpdateGroupRequest {
    name?: string;
    description?: string;
}

export interface AddMemberRequest {
    user_id: string;
    role?: 'admin' | 'member';
}

// Clase Group para instancias
export class Group {
    constructor(
        public name: string,
        public description: string = '',
        public created_by: string,
        public id: string = crypto.randomUUID()
    ) {}

    // Método para validar nombre
    isValidName(): boolean {
        return this.name.trim().length >= 3 && this.name.trim().length <= 100;
    }

    // Método para obtener descripción o default
    getDescription(): string {
        return this.description.trim() || 'Sin descripción';
    }
}