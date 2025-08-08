import { pool } from '../config/conn_mysql.js';
import { Group, IGroup, IGroupWithMembers, IGroupMember, AddMemberRequest } from '../types/group.js';

export class GroupRepository {
    
    // Obtener todos los grupos donde el usuario es miembro
    static async findByUserId(userId: string): Promise<IGroupWithMembers[]> {
        const query = `
            SELECT 
                g.id, g.name, g.description, g.created_by, g.created_at, g.updated_at,
                COUNT(gm.user_id) as member_count
            FROM expense_groups g
            JOIN group_members gm ON g.id = gm.group_id
            WHERE gm.user_id = ?
            GROUP BY g.id, g.name, g.description, g.created_by, g.created_at, g.updated_at
            ORDER BY g.created_at DESC
        `;
        
        const [rows] = await pool.execute(query, [userId]);
        const groups = rows as (IGroup & { member_count: number })[];
        
        // Para cada grupo, obtener sus miembros
        const groupsWithMembers: IGroupWithMembers[] = [];
        for (const group of groups) {
            const members = await this.getGroupMembers(group.id);
            groupsWithMembers.push({
                ...group,
                members,
                member_count: Number(group.member_count)
            });
        }
        
        return groupsWithMembers;
    }

    // Obtener un grupo específico por ID
    static async findById(groupId: string): Promise<IGroupWithMembers | null> {
        const [rows] = await pool.execute(
            'SELECT * FROM expense_groups WHERE id = ?', 
            [groupId]
        );
        const groups = rows as IGroup[];
        
        if (groups.length === 0) {
            return null;
        }
        
        const group = groups[0];
        const members = await this.getGroupMembers(groupId);
        
        return {
            ...group,
            members,
            member_count: members.length
        };
    }

    // Obtener miembros de un grupo con información del usuario
    static async getGroupMembers(groupId: string) {
        const query = `
            SELECT 
                gm.user_id, gm.role, gm.joined_at,
                u.name as user_name, u.email as user_email
            FROM group_members gm
            JOIN users u ON gm.user_id = u.id
            WHERE gm.group_id = ?
            ORDER BY gm.role DESC, gm.joined_at ASC
        `;
        
        const [rows] = await pool.execute(query, [groupId]);
        return rows as Array<{
            user_id: string;
            user_name: string;
            user_email: string;
            role: 'admin' | 'member';
            joined_at: Date;
        }>;
    }

    // Crear un nuevo grupo
    static async create(group: Group): Promise<IGroupWithMembers> {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // Insertar el grupo
            await connection.execute(
                'INSERT INTO expense_groups (id, name, description, created_by) VALUES (?, ?, ?, ?)',
                [group.id, group.name, group.getDescription(), group.created_by]
            );
            
            // Agregar al creador como admin
            await connection.execute(
                'INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)',
                [group.id, group.created_by, 'admin']
            );
            
            await connection.commit();
            
            const newGroup = await this.findById(group.id);
            if (!newGroup) {
                throw new Error('Error creando grupo');
            }
            
            return newGroup;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Actualizar grupo
    static async update(groupId: string, updateData: { name?: string; description?: string }): Promise<IGroupWithMembers | null> {
        const fieldsToUpdate: string[] = [];
        const values: any[] = [];

        if (updateData.name) {
            fieldsToUpdate.push('name = ?');
            values.push(updateData.name);
        }
        if (updateData.description !== undefined) {
            fieldsToUpdate.push('description = ?');
            values.push(updateData.description);
        }

        if (fieldsToUpdate.length === 0) {
            return this.findById(groupId);
        }

        values.push(groupId);
        
        await pool.execute(
            `UPDATE expense_groups SET ${fieldsToUpdate.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            values
        );

        return this.findById(groupId);
    }

    // Eliminar grupo
    static async delete(groupId: string): Promise<boolean> {
        const [result] = await pool.execute('DELETE FROM expense_groups WHERE id = ?', [groupId]);
        const deleteResult = result as any;
        return deleteResult.affectedRows > 0;
    }

    // Agregar miembro al grupo
    static async addMember(groupId: string, memberData: AddMemberRequest): Promise<boolean> {
        try {
            await pool.execute(
                'INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)',
                [groupId, memberData.user_id, memberData.role || 'member']
            );
            return true;
        } catch (error: any) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('El usuario ya es miembro del grupo');
            }
            throw error;
        }
    }

    // Remover miembro del grupo
    static async removeMember(groupId: string, userId: string): Promise<boolean> {
        const [result] = await pool.execute(
            'DELETE FROM group_members WHERE group_id = ? AND user_id = ?',
            [groupId, userId]
        );
        const deleteResult = result as any;
        return deleteResult.affectedRows > 0;
    }

    // Verificar si usuario es admin del grupo
    static async isUserAdmin(groupId: string, userId: string): Promise<boolean> {
        const [rows] = await pool.execute(
            'SELECT role FROM group_members WHERE group_id = ? AND user_id = ?',
            [groupId, userId]
        );
        const members = rows as { role: string }[];
        return members.length > 0 && members[0].role === 'admin';
    }

    // Verificar si usuario es miembro del grupo
    static async isUserMember(groupId: string, userId: string): Promise<boolean> {
        const [rows] = await pool.execute(
            'SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?',
            [groupId, userId]
        );
        return (rows as any[]).length > 0;
    }
}