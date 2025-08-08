import { pool } from '../config/conn_mysql.js';
import { IBalance, IBalanceWithDetails, IGroupBalanceSummary, ISettlement, BalanceCalculator } from '../types/balance.js';

export class BalanceRepository {
    
    // Obtener balance de un usuario en un grupo específico
    static async findByUserAndGroup(userId: string, groupId: string): Promise<IBalanceWithDetails | null> {
        const query = `
            SELECT 
                b.user_id, b.group_id, b.balance, b.updated_at,
                u.name as user_name, u.email as user_email,
                g.name as group_name
            FROM balances b
            JOIN users u ON b.user_id = u.id
            JOIN expense_groups g ON b.group_id = g.id
            WHERE b.user_id = ? AND b.group_id = ?
        `;
        
        const [rows] = await pool.execute(query, [userId, groupId]);
        const balances = rows as IBalanceWithDetails[];
        return balances.length > 0 ? balances[0] : null;
    }

    // Obtener todos los balances de un grupo
    static async findByGroupId(groupId: string): Promise<IBalanceWithDetails[]> {
        const query = `
            SELECT 
                b.user_id, b.group_id, b.balance, b.updated_at,
                u.name as user_name, u.email as user_email,
                g.name as group_name
            FROM balances b
            JOIN users u ON b.user_id = u.id
            JOIN expense_groups g ON b.group_id = g.id
            WHERE b.group_id = ?
            ORDER BY b.balance DESC
        `;
        
        const [rows] = await pool.execute(query, [groupId]);
        return rows as IBalanceWithDetails[];
    }

    // Obtener resumen completo de balances de un grupo con settlements
    static async getGroupBalanceSummary(groupId: string): Promise<IGroupBalanceSummary> {
        const balances = await this.findByGroupId(groupId);
        const settlements = BalanceCalculator.calculateSettlements(balances);
        
        // Obtener totals
        const [expenseRows] = await pool.execute(
            'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE group_id = ?',
            [groupId]
        );
        const [paymentRows] = await pool.execute(
            'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE group_id = ?',
            [groupId]
        );
        
        const totalExpenses = (expenseRows as { total: number }[])[0].total;
        const totalPayments = (paymentRows as { total: number }[])[0].total;
        
        // Obtener nombre del grupo
        const [groupRows] = await pool.execute(
            'SELECT name FROM expense_groups WHERE id = ?',
            [groupId]
        );
        const groupName = (groupRows as { name: string }[])[0]?.name || 'Grupo desconocido';

        return {
            group_id: groupId,
            group_name: groupName,
            balances,
            settlements,
            total_expenses: totalExpenses,
            total_payments: totalPayments
        };
    }

    // Crear o actualizar balance
    static async upsert(userId: string, groupId: string, balance: number): Promise<void> {
        await pool.execute(
            `INSERT INTO balances (user_id, group_id, balance) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE 
             balance = VALUES(balance), updated_at = CURRENT_TIMESTAMP`,
            [userId, groupId, balance]
        );
    }

    // Recalcular todos los balances de un grupo
    static async recalculateGroupBalances(groupId: string): Promise<void> {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();

            // Obtener todos los miembros del grupo
            const [memberRows] = await connection.execute(
                'SELECT DISTINCT user_id FROM group_members WHERE group_id = ?',
                [groupId]
            );
            const members = memberRows as { user_id: string }[];

            // Para cada miembro, calcular su balance
            for (const member of members) {
                const balance = await this.calculateUserBalance(member.user_id, groupId);
                await this.upsert(member.user_id, groupId, balance);
            }

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Calcular balance de un usuario en un grupo
    private static async calculateUserBalance(userId: string, groupId: string): Promise<number> {
        // Balance = (Total que pagó) - (Su parte proporcional de todos los gastos) + (Total que recibió en payments) - (Total que pagó en payments)
        
        // 1. Total que pagó en expenses
        const [expensePaidRows] = await pool.execute(
            'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE paid_by = ? AND group_id = ?',
            [userId, groupId]
        );
        const totalPaid = (expensePaidRows as { total: number }[])[0].total;

        // 2. Su parte proporcional de todos los gastos del grupo
        // Por simplicidad, asumimos división equally entre todos los miembros
        const [totalExpensesRows] = await pool.execute(
            'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE group_id = ?',
            [groupId]
        );
        const totalGroupExpenses = (totalExpensesRows as { total: number }[])[0].total;
        
        const [memberCountRows] = await pool.execute(
            'SELECT COUNT(*) as count FROM group_members WHERE group_id = ?',
            [groupId]
        );
        const memberCount = (memberCountRows as { count: number }[])[0].count;
        
        const userOwedShare = memberCount > 0 ? totalGroupExpenses / memberCount : 0;

        // 3. Total recibido en payments
        const [receivedRows] = await pool.execute(
            'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE to_user_id = ? AND group_id = ?',
            [userId, groupId]
        );
        const totalReceived = (receivedRows as { total: number }[])[0].total;

        // 4. Total pagado en payments
        const [paidPaymentsRows] = await pool.execute(
            'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE from_user_id = ? AND group_id = ?',
            [userId, groupId]
        );
        const totalPaidPayments = (paidPaymentsRows as { total: number }[])[0].total;

        // Calcular balance final
        const balance = totalPaid - userOwedShare + totalReceived - totalPaidPayments;
        
        return Math.round(balance * 100) / 100; // Redondear a 2 decimales
    }

    // Obtener balances de todos los grupos de un usuario
    static async findByUserId(userId: string): Promise<IBalanceWithDetails[]> {
        const query = `
            SELECT 
                b.user_id, b.group_id, b.balance, b.updated_at,
                u.name as user_name, u.email as user_email,
                g.name as group_name
            FROM balances b
            JOIN users u ON b.user_id = u.id
            JOIN expense_groups g ON b.group_id = g.id
            WHERE b.user_id = ?
            ORDER BY ABS(b.balance) DESC
        `;
        
        const [rows] = await pool.execute(query, [userId]);
        return rows as IBalanceWithDetails[];
    }

    // Eliminar balance específico
    static async delete(userId: string, groupId: string): Promise<boolean> {
        const [result] = await pool.execute(
            'DELETE FROM balances WHERE user_id = ? AND group_id = ?',
            [userId, groupId]
        );
        const deleteResult = result as any;
        return deleteResult.affectedRows > 0;
    }

    // Eliminar todos los balances de un grupo
    static async deleteByGroupId(groupId: string): Promise<boolean> {
        const [result] = await pool.execute('DELETE FROM balances WHERE group_id = ?', [groupId]);
        const deleteResult = result as any;
        return deleteResult.affectedRows > 0;
    }

    // Obtener usuarios que deben dinero en un grupo
    static async getDebtors(groupId: string): Promise<IBalanceWithDetails[]> {
        const query = `
            SELECT 
                b.user_id, b.group_id, b.balance, b.updated_at,
                u.name as user_name, u.email as user_email,
                g.name as group_name
            FROM balances b
            JOIN users u ON b.user_id = u.id
            JOIN expense_groups g ON b.group_id = g.id
            WHERE b.group_id = ? AND b.balance < 0
            ORDER BY b.balance ASC
        `;
        
        const [rows] = await pool.execute(query, [groupId]);
        return rows as IBalanceWithDetails[];
    }

    // Obtener usuarios a quienes les deben dinero en un grupo
    static async getCreditors(groupId: string): Promise<IBalanceWithDetails[]> {
        const query = `
            SELECT 
                b.user_id, b.group_id, b.balance, b.updated_at,
                u.name as user_name, u.email as user_email,
                g.name as group_name
            FROM balances b
            JOIN users u ON b.user_id = u.id
            JOIN expense_groups g ON b.group_id = g.id
            WHERE b.group_id = ? AND b.balance > 0
            ORDER BY b.balance DESC
        `;
        
        const [rows] = await pool.execute(query, [groupId]);
        return rows as IBalanceWithDetails[];
    }
}