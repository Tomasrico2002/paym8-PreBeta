import { pool } from '../config/conn_mysql.js';
import { Payment, IPayment, IPaymentWithDetails } from '../types/payment.js';

export class PaymentRepository {
    
    // Obtener todos los payments de un grupo
    static async findByGroupId(groupId: string): Promise<IPaymentWithDetails[]> {
        const query = `
            SELECT 
                p.id, p.from_user_id, p.to_user_id, p.amount, p.expense_id, 
                p.group_id, p.description, p.date, p.created_at,
                u1.name as from_user_name, u1.email as from_user_email,
                u2.name as to_user_name, u2.email as to_user_email,
                g.name as group_name,
                e.description as expense_description
            FROM payments p
            JOIN users u1 ON p.from_user_id = u1.id
            JOIN users u2 ON p.to_user_id = u2.id
            JOIN expense_groups g ON p.group_id = g.id
            LEFT JOIN expenses e ON p.expense_id = e.id
            WHERE p.group_id = ?
            ORDER BY p.date DESC, p.created_at DESC
        `;
        
        const [rows] = await pool.execute(query, [groupId]);
        return rows as IPaymentWithDetails[];
    }

    // Obtener payment por ID
    static async findById(paymentId: string): Promise<IPaymentWithDetails | null> {
        const query = `
            SELECT 
                p.id, p.from_user_id, p.to_user_id, p.amount, p.expense_id, 
                p.group_id, p.description, p.date, p.created_at,
                u1.name as from_user_name, u1.email as from_user_email,
                u2.name as to_user_name, u2.email as to_user_email,
                g.name as group_name,
                e.description as expense_description
            FROM payments p
            JOIN users u1 ON p.from_user_id = u1.id
            JOIN users u2 ON p.to_user_id = u2.id
            JOIN expense_groups g ON p.group_id = g.id
            LEFT JOIN expenses e ON p.expense_id = e.id
            WHERE p.id = ?
        `;
        
        const [rows] = await pool.execute(query, [paymentId]);
        const payments = rows as IPaymentWithDetails[];
        return payments.length > 0 ? payments[0] : null;
    }

    // Crear nuevo payment
    static async create(payment: Payment): Promise<IPaymentWithDetails> {
        await pool.execute(
            'INSERT INTO payments (id, from_user_id, to_user_id, amount, expense_id, group_id, description, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [payment.id, payment.from_user_id, payment.to_user_id, payment.amount, payment.expense_id, payment.group_id, payment.getDescription(), payment.date]
        );

        const newPayment = await this.findById(payment.id);
        if (!newPayment) {
            throw new Error('Error creando payment');
        }
        
        return newPayment;
    }

    // Actualizar payment
    static async update(paymentId: string, updateData: { amount?: number; description?: string; date?: Date }): Promise<IPaymentWithDetails | null> {
        const fieldsToUpdate: string[] = [];
        const values: any[] = [];

        if (updateData.amount) {
            fieldsToUpdate.push('amount = ?');
            values.push(updateData.amount);
        }
        if (updateData.description !== undefined) {
            fieldsToUpdate.push('description = ?');
            values.push(updateData.description);
        }
        if (updateData.date) {
            fieldsToUpdate.push('date = ?');
            values.push(updateData.date);
        }

        if (fieldsToUpdate.length === 0) {
            return this.findById(paymentId);
        }

        values.push(paymentId);
        
        await pool.execute(
            `UPDATE payments SET ${fieldsToUpdate.join(', ')} WHERE id = ?`,
            values
        );

        return this.findById(paymentId);
    }

    // Eliminar payment
    static async delete(paymentId: string): Promise<boolean> {
        const [result] = await pool.execute('DELETE FROM payments WHERE id = ?', [paymentId]);
        const deleteResult = result as any;
        return deleteResult.affectedRows > 0;
    }

    // Obtener payments entre dos usuarios específicos
    static async findBetweenUsers(user1Id: string, user2Id: string, groupId: string): Promise<IPaymentWithDetails[]> {
        const query = `
            SELECT 
                p.id, p.from_user_id, p.to_user_id, p.amount, p.expense_id, 
                p.group_id, p.description, p.date, p.created_at,
                u1.name as from_user_name, u1.email as from_user_email,
                u2.name as to_user_name, u2.email as to_user_email,
                g.name as group_name,
                e.description as expense_description
            FROM payments p
            JOIN users u1 ON p.from_user_id = u1.id
            JOIN users u2 ON p.to_user_id = u2.id
            JOIN expense_groups g ON p.group_id = g.id
            LEFT JOIN expenses e ON p.expense_id = e.id
            WHERE p.group_id = ? AND (
                (p.from_user_id = ? AND p.to_user_id = ?) OR 
                (p.from_user_id = ? AND p.to_user_id = ?)
            )
            ORDER BY p.date DESC
        `;
        
        const [rows] = await pool.execute(query, [groupId, user1Id, user2Id, user2Id, user1Id]);
        return rows as IPaymentWithDetails[];
    }

    // Obtener total pagado por un usuario en un grupo
    static async getTotalPaidByUser(userId: string, groupId: string): Promise<number> {
        const [rows] = await pool.execute(
            'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE from_user_id = ? AND group_id = ?',
            [userId, groupId]
        );
        const result = rows as { total: number }[];
        return result[0].total;
    }

    // Obtener total recibido por un usuario en un grupo
    static async getTotalReceivedByUser(userId: string, groupId: string): Promise<number> {
        const [rows] = await pool.execute(
            'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE to_user_id = ? AND group_id = ?',
            [userId, groupId]
        );
        const result = rows as { total: number }[];
        return result[0].total;
    }
}