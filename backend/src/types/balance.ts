// Interfaces para la base de datos
export interface IBalance {
    user_id: string;
    group_id: string;
    balance: number; // positivo = le deben, negativo = debe
    updated_at: Date;
}

// Interface para balance con información completa
export interface IBalanceWithDetails extends IBalance {
    user_name: string;
    user_email: string;
    group_name: string;
}

// Interface para resumen de balances de un grupo
export interface IGroupBalanceSummary {
    group_id: string;
    group_name: string;
    balances: IBalanceWithDetails[];
    settlements: ISettlement[]; // Quién debe pagar a quién
    total_expenses: number;
    total_payments: number;
}

// Interface para simplificaciones de deuda
export interface ISettlement {
    from_user_id: string;
    from_user_name: string;
    to_user_id: string;
    to_user_name: string;
    amount: number;
}

// Interfaces para requests
export interface UpdateBalanceRequest {
    user_id: string;
    group_id: string;
    balance: number;
}

// Clase utilitaria para cálculos de balances
export class BalanceCalculator {
    
    // Calcular settlements óptimos (algoritmo de simplificación de deudas)
    static calculateSettlements(balances: IBalanceWithDetails[]): ISettlement[] {
        const settlements: ISettlement[] = [];
        const workingBalances = balances.map(b => ({ ...b }));

        // Separar deudores y acreedores
        const debtors = workingBalances.filter(b => b.balance < 0);
        const creditors = workingBalances.filter(b => b.balance > 0);

        // Algoritmo greedy para minimizar transacciones
        while (debtors.length > 0 && creditors.length > 0) {
            const debtor = debtors[0];
            const creditor = creditors[0];

            const debt = Math.abs(debtor.balance);
            const credit = creditor.balance;
            const amount = Math.min(debt, credit);

            if (amount > 0.01) { // Evitar cantidades muy pequeñas
                settlements.push({
                    from_user_id: debtor.user_id,
                    from_user_name: debtor.user_name,
                    to_user_id: creditor.user_id,
                    to_user_name: creditor.user_name,
                    amount: Math.round(amount * 100) / 100
                });
            }

            // Actualizar balances
            debtor.balance += amount;
            creditor.balance -= amount;

            // Remover si el balance llega a 0
            if (Math.abs(debtor.balance) < 0.01) {
                debtors.shift();
            }
            if (Math.abs(creditor.balance) < 0.01) {
                creditors.shift();
            }
        }

        return settlements;
    }

    // Validar que los balances de un grupo sumen 0
    static validateGroupBalances(balances: IBalance[]): boolean {
        const total = balances.reduce((sum, balance) => sum + balance.balance, 0);
        return Math.abs(total) < 0.01; // Tolerancia para decimales
    }
}