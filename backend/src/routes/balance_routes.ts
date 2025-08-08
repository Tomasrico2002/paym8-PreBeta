import { Router } from 'express';
import { BalanceController } from '../controllers/balance_controller.js';

const router = Router();

// Rutas principales de balances
router.get('/group/:groupId', BalanceController.getGroupBalanceSummary);            // GET /balances/group/:groupId
router.get('/user/:userId/group/:groupId', BalanceController.getUserBalance);      // GET /balances/user/:userId/group/:groupId
router.get('/user/:userId', BalanceController.getAllUserBalances);                 // GET /balances/user/:userId

// Rutas para análisis específicos
router.get('/debtors/:groupId', BalanceController.getGroupDebtors);                // GET /balances/debtors/:groupId
router.get('/creditors/:groupId', BalanceController.getGroupCreditors);            // GET /balances/creditors/:groupId

// Rutas de acción
router.post('/recalculate/:groupId', BalanceController.recalculateGroupBalances);  // POST /balances/recalculate/:groupId
router.get('/settlements/:groupId', BalanceController.getSettlementPlan);          // GET /balances/settlements/:groupId

export default router;