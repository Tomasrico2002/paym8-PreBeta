// Interfaces para la base de datos
export interface IUser {
    id: string;
    name: string;
    email: string;
    password_hash: string;
    created_at: Date;
    updated_at: Date;
}

export interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
}

export interface UpdateUserRequest {
    name?: string;
    email?: string;
    password?: string;
}

// Clase User para instancias
export class User {
    constructor(
        public name: string,
        public email: string,
        public password: string,
        public id: string = crypto.randomUUID()
    ) {}

    getPasswordHash(): string {
        return this.password;
    }

    isValidEmail(): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(this.email);
    }
}