import { Router } from 'express';
import { UserController } from '../controllers/user_controller.js';

const router = Router();

// Rutas para usuarios
router.get('/', UserController.getAllUsers);           // GET /users
router.get('/:id', UserController.getUserById);       // GET /users/:id
router.post('/', UserController.createUser);          // POST /users
router.put('/:id', UserController.updateUser);        // PUT /users/:id
router.delete('/:id', UserController.deleteUser);     // DELETE /users/:id

export default router;