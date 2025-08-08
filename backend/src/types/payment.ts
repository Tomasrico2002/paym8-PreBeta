// Interfaces para la base de datos
export interface IPayment {
    id: string;
    from_user_id: string;
    to_user_id: string;
    amount: number;
    expense_id: string | null;
    group_id: string;
    description: string | null;
    date: Date;
    created_at: Date;
}

// Interface para payment con información completa
export interface IPaymentWithDetails extends IPayment {
    from_user_name: string;
    from_user_email: string;
    to_user_name: string;
    to_user_email: string;
    group_name: string;
    expense_description: string | null;
}

// Interfaces para requests
export interface CreatePaymentRequest {
    from_user_id: string;
    to_user_id: string;
    amount: number;
    expense_id?: string; // opcional
    group_id: string;
    description?: string;
    date: string; // ISO date string
}

export interface UpdatePaymentRequest {
    amount?: number;
    description?: string;
    date?: string;
}

// Clase Payment para instancias
export class Payment {
    constructor(
        public from_user_id: string,
        public to_user_id: string,
        public amount: number,
        public group_id: string,
        public date: Date,
        public description: string = '',
        public expense_id: string | null = null,
        public id: string = crypto.randomUUID()
    ) {}

    // Validar que no se pague a sí mismo
    isValidUsers(): boolean {
        return this.from_user_id !== this.to_user_id;
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
        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(today.getMonth() + 1);

        return this.date >= oneYearAgo && this.date <= oneMonthFromNow;
    }

    // Obtener descripción o default
    getDescription(): string {
        return this.description.trim() || `Pago de ${this.amount}`;
    }
}