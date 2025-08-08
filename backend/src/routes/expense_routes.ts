import { Router } from 'express';
import { ExpenseController } from '../controllers/expense_controller.js';

const router = Router();

// Rutas principales de expenses
router.get('/', ExpenseController.getGroupExpenses);                    // GET /expenses?groupId=xxx
router.get('/:id', ExpenseController.getExpenseById);                   // GET /expenses/:id
router.post('/', ExpenseController.createExpense);                      // POST /expenses
router.put('/:id', ExpenseController.updateExpense);                    // PUT /expenses/:id
router.delete('/:id', ExpenseController.deleteExpense);                 // DELETE /expenses/:id

// Rutas adicionales
router.get('/user/:userId/group/:groupId', ExpenseController.getUserExpensesInGroup); // GET /expenses/user/:userId/group/:groupId

export default router;