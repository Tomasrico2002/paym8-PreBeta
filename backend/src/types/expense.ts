// Interfaces para la base de datos
export interface IExpense {
    id: string;
    description: string;
    amount: number;
    date: Date;
    paid_by: string;
    group_id: string;
    created_at: Date;
}

// Interface para expense con información completa
export interface IExpenseWithDetails extends IExpense {
    paid_by_name: string;
    paid_by_email: string;
    group_name: string;
}

// Interfaces para requests
export interface CreateExpenseRequest {
    description: string;
    amount: number;
    date: string; // ISO date string
    paid_by: string;
    group_id: string;
}

export interface UpdateExpenseRequest {
    description?: string;
    amount?: number;
    date?: string;
    paid_by?: string;
}

// Clase Expense para instancias
export class Expense {
    constructor(
        public description: string,
        public amount: number,
        public date: Date,
        public paid_by: string,
        public group_id: string,
        public id: string = crypto.randomUUID()
    ) {}

    // Validar descripción
    isValidDescription(): boolean {
        return this.description.trim().length >= 3 && this.description.trim().length <= 500;
    }

    // Validar monto
    isValidAmount(): boolean {
        return this.amount > 0 && this.amount <= 999999.99;
    }

    // Validar fecha
    isValidDate(): boolean {
        const today = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(today.getFullYear() + 1);

        return this.date >= oneYearAgo && this.date <= oneYearFromNow;
    }
}