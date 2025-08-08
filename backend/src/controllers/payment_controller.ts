import { Request, Response } from 'express';
import { PaymentRepository } from '../repositories/payment_repository.js';
import { BalanceRepository } from '../repositories/balance_repository.js';
import { GroupRepository } from '../repositories/group_repository.js';
import { ExpenseRepository } from '../repositories/expense_repository.js';
import { Payment, CreatePaymentRequest, UpdatePaymentRequest } from '../types/payment.js';

export class PaymentController {
    
    // GET /payments?groupId=xxx - Obtener payments de un grupo
    static async getGroupPayments(req: Request, res: Response) {
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

            const payments = await PaymentRepository.findByGroupId(groupId as string);
            
            res.json({
                success: true,
                data: payments,
                message: `${payments.length} pagos encontrados para el grupo`
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener pagos del grupo',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // GET /payments/:id - Obtener payment específico
    static async getPaymentById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const payment = await PaymentRepository.findById(id);
            
            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Pago no encontrado'
                });
            }

            res.json({
                success: true,
                data: payment
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener pago',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // POST /payments - Crear nuevo payment
    static async createPayment(req: Request, res: Response) {
        try {
            const paymentData: CreatePaymentRequest = req.body;
            
            // Validaciones básicas
            if (!paymentData.from_user_id || !paymentData.to_user_id || !paymentData.amount || !paymentData.group_id || !paymentData.date) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan campos requeridos: from_user_id, to_user_id, amount, group_id, date'
                });
            }

            // Verificar que el grupo existe
            const group = await GroupRepository.findById(paymentData.group_id);
            if (!group) {
                return res.status(404).json({
                    success: false,
                    message: 'Grupo no encontrado'
                });
            }

            // Verificar que ambos usuarios son miembros del grupo
            const isFromUserMember = await GroupRepository.isUserMember(paymentData.group_id, paymentData.from_user_id);
            const isToUserMember = await GroupRepository.isUserMember(paymentData.group_id, paymentData.to_user_id);
            
            if (!isFromUserMember || !isToUserMember) {
                return res.status(403).json({
                    success: false,
                    message: 'Ambos usuarios deben ser miembros del grupo'
                });
            }

            // Verificar expense_id si se proporciona
            if (paymentData.expense_id) {
                const expense = await ExpenseRepository.findById(paymentData.expense_id);
                if (!expense) {
                    return res.status(404).json({
                        success: false,
                        message: 'Gasto no encontrado'
                    });
                }
                
                if (expense.group_id !== paymentData.group_id) {
                    return res.status(400).json({
                        success: false,
                        message: 'El gasto debe pertenecer al mismo grupo'
                    });
                }
            }

            // Crear instancia de Payment
            const payment = new Payment(
                paymentData.from_user_id,
                paymentData.to_user_id,
                paymentData.amount,
                paymentData.group_id,
                new Date(paymentData.date),
                paymentData.description || '',
                paymentData.expense_id || null
            );
            
            // Validaciones de negocio
            if (!payment.isValidUsers()) {
                return res.status(400).json({
                    success: false,
                    message: 'No puedes pagarte a ti mismo'
                });
            }

            if (!payment.isValidAmount()) {
                return res.status(400).json({
                    success: false,
                    message: 'El monto debe ser positivo y menor a $999,999.99'
                });
            }

            if (!payment.isValidDate()) {
                return res.status(400).json({
                    success: false,
                    message: 'La fecha debe estar entre un año atrás y un mes adelante'
                });
            }

            // Crear el payment
            const newPayment = await PaymentRepository.create(payment);
            
            // Recalcular balances del grupo automáticamente
            await BalanceRepository.recalculateGroupBalances(paymentData.group_id);
            
            res.status(201).json({
                success: true,
                data: newPayment,
                message: 'Pago registrado exitosamente y balances actualizados'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al registrar pago',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // PUT /payments/:id - Actualizar payment
    static async updatePayment(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updateData: UpdatePaymentRequest = req.body;

            // Verificar si el payment existe
            const existingPayment = await PaymentRepository.findById(id);
            if (!existingPayment) {
                return res.status(404).json({
                    success: false,
                    message: 'Pago no encontrado'
                });
            }

            // Validaciones si se proporcionan nuevos valores
            if (updateData.amount) {
                if (updateData.amount <= 0 || updateData.amount > 999999.99) {
                    return res.status(400).json({
                        success: false,
                        message: 'El monto debe ser positivo y menor a $999,999.99'
                    });
                }
            }

            if (updateData.date) {
                const tempPayment = new Payment('', '', 100, '', new Date(updateData.date));
                if (!tempPayment.isValidDate()) {
                    return res.status(400).json({
                        success: false,
                        message: 'La fecha debe estar entre un año atrás y un mes adelante'
                    });
                }
            }

            // Actualizar payment
            const updatedPayment = await PaymentRepository.update(id, {
                amount: updateData.amount,
                description: updateData.description,
                date: updateData.date ? new Date(updateData.date) : undefined
            });
            
            // Recalcular balances del grupo
            await BalanceRepository.recalculateGroupBalances(existingPayment.group_id);
            
            res.json({
                success: true,
                data: updatedPayment,
                message: 'Pago actualizado exitosamente y balances recalculados'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al actualizar pago',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // DELETE /payments/:id - Eliminar payment
    static async deletePayment(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { userId } = req.body; // Usuario que quiere eliminar

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'userId es requerido en el body'
                });
            }

            // Verificar si el payment existe
            const existingPayment = await PaymentRepository.findById(id);
            if (!existingPayment) {
                return res.status(404).json({
                    success: false,
                    message: 'Pago no encontrado'
                });
            }

            // Verificar permisos: solo quien hizo el pago o un admin del grupo puede eliminar
            const isUserWhoMadePayment = existingPayment.from_user_id === userId;
            const isAdmin = await GroupRepository.isUserAdmin(existingPayment.group_id, userId);
            
            if (!isUserWhoMadePayment && !isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: 'Solo quien hizo el pago o un administrador del grupo puede eliminarlo'
                });
            }

            const deleted = await PaymentRepository.delete(id);
            
            if (deleted) {
                // Recalcular balances del grupo
                await BalanceRepository.recalculateGroupBalances(existingPayment.group_id);
                
                res.json({
                    success: true,
                    message: 'Pago eliminado exitosamente y balances recalculados'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error al eliminar pago'
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al eliminar pago',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // GET /payments/between/:user1Id/:user2Id?groupId=xxx - Pagos entre dos usuarios específicos
    static async getPaymentsBetweenUsers(req: Request, res: Response) {
        try {
            const { user1Id, user2Id } = req.params;
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

            const payments = await PaymentRepository.findBetweenUsers(user1Id, user2Id, groupId as string);
            
            // Calcular totales
            const user1PaidToUser2 = await PaymentRepository.getTotalPaidByUser(user1Id, groupId as string);
            const user2PaidToUser1 = await PaymentRepository.getTotalPaidByUser(user2Id, groupId as string);
            
            res.json({
                success: true,
                data: {
                    payments,
                    summary: {
                        total_payments: payments.length,
                        user1_paid_to_user2: user1PaidToUser2,
                        user2_paid_to_user1: user2PaidToUser1,
                        net_balance: user1PaidToUser2 - user2PaidToUser1
                    }
                },
                message: `${payments.length} pagos encontrados entre los usuarios`
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener pagos entre usuarios',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // GET /payments/user/:userId?groupId=xxx - Pagos realizados por un usuario
    static async getUserPayments(req: Request, res: Response) {
        try {
            const { userId } = req.params;
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

            const totalPaid = await PaymentRepository.getTotalPaidByUser(userId, groupId as string);
            const totalReceived = await PaymentRepository.getTotalReceivedByUser(userId, groupId as string);
            
            res.json({
                success: true,
                data: {
                    summary: {
                        total_paid: totalPaid,
                        total_received: totalReceived,
                        net_payment: totalPaid - totalReceived
                    }
                },
                message: `Resumen de pagos del usuario en el grupo`
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener pagos del usuario',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
}