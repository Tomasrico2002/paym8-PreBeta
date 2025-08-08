import { Request, Response } from 'express';
import { ExpenseRepository } from '../repositories/expense_repository.js';
import { BalanceRepository } from '../repositories/balance_repository.js';
import { GroupRepository } from '../repositories/group_repository.js';
import { Expense, CreateExpenseRequest, UpdateExpenseRequest } from '../types/expense.js';

export class ExpenseController {
    
    // GET /expenses?groupId=xxx - Obtener expenses de un grupo
    static async getGroupExpenses(req: Request, res: Response) {
        try {
            const { groupId } = req.query;
            
            if (!groupId) {
                return res.status(400).json({
                    success: false,
                    message: 'groupId es requerido como query parameter'
                });
            }

            // Verificar que el grupo existe
            const group = await GroupRepository.findById(groupId as string);
            if (!group) {
                return res.status(404).json({
                    success: false,
                    message: 'Grupo no encontrado'
                });
            }

            const expenses = await ExpenseRepository.findByGroupId(groupId as string);
            
            res.json({
                success: true,
                data: expenses,
                message: `${expenses.length} gastos encontrados para el grupo`
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener gastos del grupo',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // GET /expenses/:id - Obtener expense específico
    static async getExpenseById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const expense = await ExpenseRepository.findById(id);
            
            if (!expense) {
                return res.status(404).json({
                    success: false,
                    message: 'Gasto no encontrado'
                });
            }

            res.json({
                success: true,
                data: expense
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener gasto',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // POST /expenses - Crear nuevo expense
    static async createExpense(req: Request, res: Response) {
        try {
            const expenseData: CreateExpenseRequest = req.body;
            
            // Validaciones básicas
            if (!expenseData.description || !expenseData.amount || !expenseData.date || !expenseData.paid_by || !expenseData.group_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan campos requeridos: description, amount, date, paid_by, group_id'
                });
            }

            // Verificar que el grupo existe
            const group = await GroupRepository.findById(expenseData.group_id);
            if (!group) {
                return res.status(404).json({
                    success: false,
                    message: 'Grupo no encontrado'
                });
            }

            // Verificar que el usuario que paga es miembro del grupo
            const isUserMember = await GroupRepository.isUserMember(expenseData.group_id, expenseData.paid_by);
            if (!isUserMember) {
                return res.status(403).json({
                    success: false,
                    message: 'El usuario que paga debe ser miembro del grupo'
                });
            }

            // Crear instancia de Expense
            const expense = new Expense(
                expenseData.description,
                expenseData.amount,
                new Date(expenseData.date),
                expenseData.paid_by,
                expenseData.group_id
            );
            
            // Validaciones de negocio
            if (!expense.isValidDescription()) {
                return res.status(400).json({
                    success: false,
                    message: 'La descripción debe tener entre 3 y 500 caracteres'
                });
            }

            if (!expense.isValidAmount()) {
                return res.status(400).json({
                    success: false,
                    message: 'El monto debe ser positivo y menor a $999,999.99'
                });
            }

            if (!expense.isValidDate()) {
                return res.status(400).json({
                    success: false,
                    message: 'La fecha debe estar entre un año atrás y un año adelante'
                });
            }

            // Crear el expense
            const newExpense = await ExpenseRepository.create(expense);
            
            // Recalcular balances del grupo automáticamente
            await BalanceRepository.recalculateGroupBalances(expenseData.group_id);
            
            res.status(201).json({
                success: true,
                data: newExpense,
                message: 'Gasto creado exitosamente y balances actualizados'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al crear gasto',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // PUT /expenses/:id - Actualizar expense
    static async updateExpense(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updateData: UpdateExpenseRequest = req.body;

            // Verificar si el expense existe
            const existingExpense = await ExpenseRepository.findById(id);
            if (!existingExpense) {
                return res.status(404).json({
                    success: false,
                    message: 'Gasto no encontrado'
                });
            }

            // Validaciones si se proporcionan nuevos valores
            if (updateData.description) {
                const tempExpense = new Expense(updateData.description, 100, new Date(), '', '');
                if (!tempExpense.isValidDescription()) {
                    return res.status(400).json({
                        success: false,
                        message: 'La descripción debe tener entre 3 y 500 caracteres'
                    });
                }
            }

            if (updateData.amount) {
                if (updateData.amount <= 0 || updateData.amount > 999999.99) {
                    return res.status(400).json({
                        success: false,
                        message: 'El monto debe ser positivo y menor a $999,999.99'
                    });
                }
            }

            if (updateData.date) {
                const tempExpense = new Expense('test', 100, new Date(updateData.date), '', '');
                if (!tempExpense.isValidDate()) {
                    return res.status(400).json({
                        success: false,
                        message: 'La fecha debe estar entre un año atrás y un año adelante'
                    });
                }
            }

            // Si se cambia quien pagó, verificar que es miembro del grupo
            if (updateData.paid_by) {
                const isUserMember = await GroupRepository.isUserMember(existingExpense.group_id, updateData.paid_by);
                if (!isUserMember) {
                    return res.status(403).json({
                        success: false,
                        message: 'El nuevo usuario que paga debe ser miembro del grupo'
                    });
                }
            }

            // Actualizar expense
            const updatedExpense = await ExpenseRepository.update(id, {
                description: updateData.description,
                amount: updateData.amount,
                date: updateData.date ? new Date(updateData.date) : undefined,
                paid_by: updateData.paid_by
            });
            
            // Recalcular balances del grupo
            await BalanceRepository.recalculateGroupBalances(existingExpense.group_id);
            
            res.json({
                success: true,
                data: updatedExpense,
                message: 'Gasto actualizado exitosamente y balances recalculados'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al actualizar gasto',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // DELETE /expenses/:id - Eliminar expense
    static async deleteExpense(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { userId } = req.body; // Usuario que quiere eliminar

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'userId es requerido en el body'
                });
            }

            // Verificar si el expense existe
            const existingExpense = await ExpenseRepository.findById(id);
            if (!existingExpense) {
                return res.status(404).json({
                    success: false,
                    message: 'Gasto no encontrado'
                });
            }

            // Verificar permisos: solo quien pagó o un admin del grupo puede eliminar
            const isUserWhoExpensed = existingExpense.paid_by === userId;
            const isAdmin = await GroupRepository.isUserAdmin(existingExpense.group_id, userId);
            
            if (!isUserWhoExpensed && !isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: 'Solo quien pagó el gasto o un administrador del grupo puede eliminarlo'
                });
            }

            const deleted = await ExpenseRepository.delete(id);
            
            if (deleted) {
                // Recalcular balances del grupo
                await BalanceRepository.recalculateGroupBalances(existingExpense.group_id);
                
                res.json({
                    success: true,
                    message: 'Gasto eliminado exitosamente y balances recalculados'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error al eliminar gasto'
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al eliminar gasto',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // GET /expenses/user/:userId/group/:groupId - Gastos pagados por un usuario en un grupo
    static async getUserExpensesInGroup(req: Request, res: Response) {
        try {
            const { userId, groupId } = req.params;

            // Verificar que el grupo existe
            const group = await GroupRepository.findById(groupId);
            if (!group) {
                return res.status(404).json({
                    success: false,
                    message: 'Grupo no encontrado'
                });
            }

            const expenses = await ExpenseRepository.findByUserAndGroup(userId, groupId);
            const totalPaid = await ExpenseRepository.getTotalPaidByUser(userId, groupId);
            
            res.json({
                success: true,
                data: {
                    expenses,
                    summary: {
                        total_expenses: expenses.length,
                        total_paid: totalPaid
                    }
                },
                message: `${expenses.length} gastos encontrados para el usuario en el grupo`
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener gastos del usuario',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
}