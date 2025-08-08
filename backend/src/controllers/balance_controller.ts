import { Request, Response } from 'express';
import { BalanceRepository } from '../repositories/balance_repository.js';
import { GroupRepository } from '../repositories/group_repository.js';

export class BalanceController {
    
    // GET /balances/group/:groupId - Obtener resumen completo de balances de un grupo
    static async getGroupBalanceSummary(req: Request, res: Response) {
        try {
            const { groupId } = req.params;

            // Verificar que el grupo existe
            const group = await GroupRepository.findById(groupId);
            if (!group) {
                return res.status(404).json({
                    success: false,
                    message: 'Grupo no encontrado'
                });
            }

            // Recalcular balances antes de mostrar (para asegurar datos actualizados)
            await BalanceRepository.recalculateGroupBalances(groupId);

            // Obtener resumen completo
            const balanceSummary = await BalanceRepository.getGroupBalanceSummary(groupId);
            
            res.json({
                success: true,
                data: balanceSummary,
                message: 'Resumen de balances obtenido exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener resumen de balances',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // GET /balances/user/:userId/group/:groupId - Balance específico de un usuario en un grupo
    static async getUserBalance(req: Request, res: Response) {
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

            // Verificar que el usuario es miembro del grupo
            const isUserMember = await GroupRepository.isUserMember(groupId, userId);
            if (!isUserMember) {
                return res.status(403).json({
                    success: false,
                    message: 'El usuario no es miembro del grupo'
                });
            }

            // Recalcular balance del usuario
            await BalanceRepository.recalculateGroupBalances(groupId);

            // Obtener balance específico
            const userBalance = await BalanceRepository.findByUserAndGroup(userId, groupId);
            
            if (!userBalance) {
                return res.status(404).json({
                    success: false,
                    message: 'Balance no encontrado para este usuario en el grupo'
                });
            }

            res.json({
                success: true,
                data: {
                    balance: userBalance,
                    interpretation: {
                        status: userBalance.balance > 0 ? 'credit' : userBalance.balance < 0 ? 'debt' : 'settled',
                        message: userBalance.balance > 0 
                            ? `Te deben $${userBalance.balance.toFixed(2)}`
                            : userBalance.balance < 0 
                            ? `Debes $${Math.abs(userBalance.balance).toFixed(2)}`
                            : 'Estás al día, no debes ni te deben'
                    }
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener balance del usuario',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // GET /balances/user/:userId - Todos los balances de un usuario (todos los grupos)
    static async getAllUserBalances(req: Request, res: Response) {
        try {
            const { userId } = req.params;

            const balances = await BalanceRepository.findByUserId(userId);
            
            // Calcular estadísticas
            const totalCredit = balances
                .filter(b => b.balance > 0)
                .reduce((sum, b) => sum + b.balance, 0);
            
            const totalDebt = balances
                .filter(b => b.balance < 0)
                .reduce((sum, b) => sum + Math.abs(b.balance), 0);
            
            res.json({
                success: true,
                data: {
                    balances,
                    summary: {
                        total_groups: balances.length,
                        total_credit: totalCredit,
                        total_debt: totalDebt,
                        net_balance: totalCredit - totalDebt,
                        status: totalCredit > totalDebt ? 'net_creditor' : 
                               totalCredit < totalDebt ? 'net_debtor' : 'settled'
                    }
                },
                message: `${balances.length} balances encontrados para el usuario`
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener balances del usuario',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // GET /balances/debtors/:groupId - Usuarios que deben dinero en un grupo
    static async getGroupDebtors(req: Request, res: Response) {
        try {
            const { groupId } = req.params;

            // Verificar que el grupo existe
            const group = await GroupRepository.findById(groupId);
            if (!group) {
                return res.status(404).json({
                    success: false,
                    message: 'Grupo no encontrado'
                });
            }

            const debtors = await BalanceRepository.getDebtors(groupId);
            
            const totalDebt = debtors.reduce((sum, debtor) => sum + Math.abs(debtor.balance), 0);
            
            res.json({
                success: true,
                data: {
                    debtors,
                    summary: {
                        total_debtors: debtors.length,
                        total_debt: totalDebt
                    }
                },
                message: `${debtors.length} deudores encontrados en el grupo`
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener deudores del grupo',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // GET /balances/creditors/:groupId - Usuarios a quienes les deben dinero en un grupo
    static async getGroupCreditors(req: Request, res: Response) {
        try {
            const { groupId } = req.params;

            // Verificar que el grupo existe
            const group = await GroupRepository.findById(groupId);
            if (!group) {
                return res.status(404).json({
                    success: false,
                    message: 'Grupo no encontrado'
                });
            }

            const creditors = await BalanceRepository.getCreditors(groupId);
            
            const totalCredit = creditors.reduce((sum, creditor) => sum + creditor.balance, 0);
            
            res.json({
                success: true,
                data: {
                    creditors,
                    summary: {
                        total_creditors: creditors.length,
                        total_credit: totalCredit
                    }
                },
                message: `${creditors.length} acreedores encontrados en el grupo`
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener acreedores del grupo',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // POST /balances/recalculate/:groupId - Forzar recálculo de balances de un grupo
    static async recalculateGroupBalances(req: Request, res: Response) {
        try {
            const { groupId } = req.params;
            const { userId } = req.body; // Usuario que solicita el recálculo

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'userId es requerido en el body'
                });
            }

            // Verificar que el grupo existe
            const group = await GroupRepository.findById(groupId);
            if (!group) {
                return res.status(404).json({
                    success: false,
                    message: 'Grupo no encontrado'
                });
            }

            // Verificar que el usuario es miembro del grupo (solo miembros pueden recalcular)
            const isUserMember = await GroupRepository.isUserMember(groupId, userId);
            if (!isUserMember) {
                return res.status(403).json({
                    success: false,
                    message: 'Solo los miembros del grupo pueden recalcular balances'
                });
            }

            // Recalcular balances
            await BalanceRepository.recalculateGroupBalances(groupId);

            // Obtener balances actualizados
            const updatedBalances = await BalanceRepository.findByGroupId(groupId);
            
            res.json({
                success: true,
                data: updatedBalances,
                message: 'Balances recalculados exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al recalcular balances',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // GET /balances/settlements/:groupId - Obtener plan de liquidación óptimo
    static async getSettlementPlan(req: Request, res: Response) {
        try {
            const { groupId } = req.params;

            // Verificar que el grupo existe
            const group = await GroupRepository.findById(groupId);
            if (!group) {
                return res.status(404).json({
                    success: false,
                    message: 'Grupo no encontrado'
                });
            }

            // Recalcular balances para asegurar datos actualizados
            await BalanceRepository.recalculateGroupBalances(groupId);

            // Obtener resumen con settlements
            const balanceSummary = await BalanceRepository.getGroupBalanceSummary(groupId);
            
            res.json({
                success: true,
                data: {
                    settlements: balanceSummary.settlements,
                    summary: {
                        total_settlements: balanceSummary.settlements.length,
                        total_amount: balanceSummary.settlements.reduce((sum, s) => sum + s.amount, 0),
                        message: balanceSummary.settlements.length === 0 
                            ? 'Todos los balances están saldados' 
                            : `Se necesitan ${balanceSummary.settlements.length} transacciones para saldar todas las deudas`
                    }
                },
                message: 'Plan de liquidación calculado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al calcular plan de liquidación',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
}