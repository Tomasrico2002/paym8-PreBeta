import { Router } from 'express';
import { GroupController } from '../controllers/group_controller.js';

const router = Router();

// Rutas principales de grupos
router.get('/', GroupController.getUserGroups);              // GET /groups?userId=xxx
router.get('/:id', GroupController.getGroupById);           // GET /groups/:id
router.post('/', GroupController.createGroup);              // POST /groups
router.put('/:id', GroupController.updateGroup);            // PUT /groups/:id
router.delete('/:id', GroupController.deleteGroup);         // DELETE /groups/:id

// Rutas para gestión de miembros
router.post('/:id/members', GroupController.addMember);     // POST /groups/:id/members
router.delete('/:id/members/:userId', GroupController.removeMember); // DELETE /groups/:id/members/:userId

export default router;