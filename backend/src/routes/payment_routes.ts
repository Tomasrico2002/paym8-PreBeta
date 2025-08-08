import { Router } from 'express';
import { PaymentController } from '../controllers/payment_controller.js';

const router = Router();

// Rutas principales de payments
router.get('/', PaymentController.getGroupPayments);                    // GET /payments?groupId=xxx
router.get('/:id', PaymentController.getPaymentById);                   // GET /payments/:id
router.post('/', PaymentController.createPayment);                      // POST /payments
router.put('/:id', PaymentController.updatePayment);                    // PUT /payments/:id
router.delete('/:id', PaymentController.deletePayment);                 // DELETE /payments/:id

// Rutas adicionales
router.get('/between/:user1Id/:user2Id', PaymentController.getPaymentsBetweenUsers);  // GET /payments/between/:user1Id/:user2Id?groupId=xxx
router.get('/user/:userId', PaymentController.getUserPayments);                       // GET /payments/user/:userId?groupId=xxx

export default router;