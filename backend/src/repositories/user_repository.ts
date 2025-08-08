import { pool } from '../config/conn_mysql.js';
import { User, IUser } from '../types/user.js';

export class UserRepository {
    
    static async findAll(): Promise<IUser[]> {
        const [rows] = await pool.execute('SELECT * FROM users ORDER BY created_at DESC');
        return rows as IUser[];
    }

    static async findById(id: string): Promise<IUser | null> {
        const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
        const users = rows as IUser[];
        return users.length > 0 ? users[0] : null;
    }

    static async findByEmail(email: string): Promise<IUser | null> {
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        const users = rows as IUser[];
        return users.length > 0 ? users[0] : null;
    }

    static async create(user: User): Promise<IUser> {
        await pool.execute(
            'INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)',
            [user.id, user.name, user.email, user.getPasswordHash()]
        );

        const newUser = await this.findById(user.id);
        if (!newUser) {
            throw new Error('Error creando usuario');
        }
        
        return newUser;
    }

    static async update(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
        const fieldsToUpdate: string[] = [];
        const values: any[] = [];

        if (updateData.name) {
            fieldsToUpdate.push('name = ?');
            values.push(updateData.name);
        }
        if (updateData.email) {
            fieldsToUpdate.push('email = ?');
            values.push(updateData.email);
        }

        if (fieldsToUpdate.length === 0) {
            return this.findById(id);
        }

        values.push(id);
        
        await pool.execute(
            `UPDATE users SET ${fieldsToUpdate.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            values
        );

        return this.findById(id);
    }

    static async delete(id: string): Promise<boolean> {
        const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
        const deleteResult = result as any;
        return deleteResult.affectedRows > 0;
    }
}