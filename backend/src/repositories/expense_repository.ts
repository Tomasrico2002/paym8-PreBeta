import { pool } from '../config/conn_mysql.js';
import { Expense, IExpense, IExpenseWithDetails } from '../types/expense.js';

export class ExpenseRepository {
    
    // Obtener todos los expenses de un grupo
    static async findByGroupId(groupId: string): Promise<IExpenseWithDetails[]> {
        const query = `
            SELECT 
                e.id, e.description, e.amount, e.date, e.paid_by, e.group_id, e.created_at,
                u.name as paid_by_name, u.email as paid_by_email,
                g.name as group_name
            FROM expenses e
            JOIN users u ON e.paid_by = u.id
            JOIN expense_groups g ON e.group_id = g.id
            WHERE e.group_id = ?
            ORDER BY e.date DESC, e.created_at DESC
        `;
        
        const [rows] = await pool.execute(query, [groupId]);
        return rows as IExpenseWithDetails[];
    }

    // Obtener expense por ID
    static async findById(expenseId: string): Promise<IExpenseWithDetails | null> {
        const query = `
            SELECT 
                e.id, e.description, e.amount, e.date, e.paid_by, e.group_id, e.created_at,
                u.name as paid_by_name, u.email as paid_by_email,
                g.name as group_name
            FROM expenses e
            JOIN users u ON e.paid_by = u.id
            JOIN expense_groups g ON e.group_id = g.id
            WHERE e.id = ?
        `;
        
        const [rows] = await pool.execute(query, [expenseId]);
        const expenses = rows as IExpenseWithDetails[];
        return expenses.length > 0 ? expenses[0] : null;
    }

    // Crear nuevo expense
    static async create(expense: Expense): Promise<IExpenseWithDetails> {
        await pool.execute(
            'INSERT INTO expenses (id, description, amount, date, paid_by, group_id) VALUES (?, ?, ?, ?, ?, ?)',
            [expense.id, expense.description, expense.amount, expense.date, expense.paid_by, expense.group_id]
        );

        const newExpense = await this.findById(expense.id);
        if (!newExpense) {
            throw new Error('Error creando expense');
        }
        
        return newExpense;
    }

    // Actualizar expense
    static async update(expenseId: string, updateData: { description?: string; amount?: number; date?: Date; paid_by?: string }): Promise<IExpenseWithDetails | null> {
        const fieldsToUpdate: string[] = [];
        const values: any[] = [];

        if (updateData.description) {
            fieldsToUpdate.push('description = ?');
            values.push(updateData.description);
        }
        if (updateData.amount) {
            fieldsToUpdate.push('amount = ?');
            values.push(updateData.amount);
        }
        if (updateData.date) {
            fieldsToUpdate.push('date = ?');
            values.push(updateData.date);
        }
        if (updateData.paid_by) {
            fieldsToUpdate.push('paid_by = ?');
            values.push(updateData.paid_by);
        }

        if (fieldsToUpdate.length === 0) {
            return this.findById(expenseId);
        }

        values.push(expenseId);
        
        await pool.execute(
            `UPDATE expenses SET ${fieldsToUpdate.join(', ')} WHERE id = ?`,
            values
        );

        return this.findById(expenseId);
    }

    // Eliminar expense
    static async delete(expenseId: string): Promise<boolean> {
        const [result] = await pool.execute('DELETE FROM expenses WHERE id = ?', [expenseId]);
        const deleteResult = result as any;
        return deleteResult.affectedRows > 0;
    }

    // Obtener expenses pagados por un usuario en un grupo
    static async findByUserAndGroup(userId: string, groupId: string): Promise<IExpenseWithDetails[]> {
        const query = `
            SELECT 
                e.id, e.description, e.amount, e.date, e.paid_by, e.group_id, e.created_at,
                u.name as paid_by_name, u.email as paid_by_email,
                g.name as group_name
            FROM expenses e
            JOIN users u ON e.paid_by = u.id
            JOIN expense_groups g ON e.group_id = g.id
            WHERE e.paid_by = ? AND e.group_id = ?
            ORDER BY e.date DESC
        `;
        
        const [rows] = await pool.execute(query, [userId, groupId]);
        return rows as IExpenseWithDetails[];
    }

    // Obtener total gastado por un usuario en un grupo
    static async getTotalPaidByUser(userId: string, groupId: string): Promise<number> {
        const [rows] = await pool.execute(
            'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE paid_by = ? AND group_id = ?',
            [userId, groupId]
        );
        const result = rows as { total: number }[];
        return result[0].total;
    }

    // Obtener total de gastos de un grupo
    static async getTotalByGroup(groupId: string): Promise<number> {
        const [rows] = await pool.execute(
            'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE group_id = ?',
            [groupId]
        );
        const result = rows as { total: number }[];
        return result[0].total;
    }
}