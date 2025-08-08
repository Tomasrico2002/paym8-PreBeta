import { Request, Response } from 'express';
import { UserRepository } from '../repositories/user_repository.js';
import { User } from '../types/user.js';

export class UserController {
    
    // Este método ya lo tienes
    static async getAllUsers(req: Request, res: Response) {
        try {
            const users = await UserRepository.findAll();
            res.json({
                success: true,
                data: users
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener usuarios',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // AGREGAR ESTOS MÉTODOS AQUÍ ADENTRO:
    
    static async getUserById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const user = await UserRepository.findById(id);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener usuario',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    static async createUser(req: Request, res: Response) {
    try {
        const { name, email, password } = req.body;
        
        // Validaciones básicas
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos: name, email, password'
            });
        }

        // Crear instancia de User (con ID complejo automático)
        const user = new User(name, email, password);
        
        // Validar email
        if (!user.isValidEmail()) {
            return res.status(400).json({
                success: false,
                message: 'Email inválido'
            });
        }

        // Verificar si el email ya existe
        const existingUser = await UserRepository.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }

        const newUser = await UserRepository.create(user);
        
        res.status(201).json({
            success: true,
            data: newUser,
            message: 'Usuario creado exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear usuario',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
}

    static async updateUser(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const existingUser = await UserRepository.findById(id);
            if (!existingUser) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            const updatedUser = await UserRepository.update(id, updateData);
            
            res.json({
                success: true,
                data: updatedUser,
                message: 'Usuario actualizado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al actualizar usuario',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    static async deleteUser(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const existingUser = await UserRepository.findById(id);
            if (!existingUser) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            const deleted = await UserRepository.delete(id);
            
            if (deleted) {
                res.json({
                    success: true,
                    message: 'Usuario eliminado exitosamente'
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al eliminar usuario',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

} // ← Cerrar la clase aquí