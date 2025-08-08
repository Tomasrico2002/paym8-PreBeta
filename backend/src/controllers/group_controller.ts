import { Request, Response } from 'express';
import { GroupRepository } from '../repositories/group_repository.js';
import { Group, CreateGroupRequest, UpdateGroupRequest, AddMemberRequest } from '../types/group.js';

export class GroupController {
    
    // GET /groups?userId=xxx - Obtener grupos del usuario
    static async getUserGroups(req: Request, res: Response) {
        try {
            const { userId } = req.query;
            
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'userId es requerido como query parameter'
                });
            }

            const groups = await GroupRepository.findByUserId(userId as string);
            
            res.json({
                success: true,
                data: groups,
                message: `${groups.length} grupos encontrados para el usuario`
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener grupos del usuario',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // GET /groups/:id - Obtener grupo específico
    static async getGroupById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const group = await GroupRepository.findById(id);
            
            if (!group) {
                return res.status(404).json({
                    success: false,
                    message: 'Grupo no encontrado'
                });
            }

            res.json({
                success: true,
                data: group
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener grupo',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // POST /groups - Crear nuevo grupo
    static async createGroup(req: Request, res: Response) {
        try {
            const groupData: CreateGroupRequest & { created_by: string } = req.body;
            
            // Validaciones básicas
            if (!groupData.name || !groupData.created_by) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan campos requeridos: name, created_by'
                });
            }

            // Crear instancia de Group
            const group = new Group(
                groupData.name,
                groupData.description || '',
                groupData.created_by
            );
            
            // Validar nombre
            if (!group.isValidName()) {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre del grupo debe tener entre 3 y 100 caracteres'
                });
            }

            const newGroup = await GroupRepository.create(group);
            
            res.status(201).json({
                success: true,
                data: newGroup,
                message: 'Grupo creado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al crear grupo',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // PUT /groups/:id - Actualizar grupo
    static async updateGroup(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updateData: UpdateGroupRequest = req.body;

            // Verificar si el grupo existe
            const existingGroup = await GroupRepository.findById(id);
            if (!existingGroup) {
                return res.status(404).json({
                    success: false,
                    message: 'Grupo no encontrado'
                });
            }

            // Validar nombre si se proporciona
            if (updateData.name) {
                const tempGroup = new Group(updateData.name, '', '');
                if (!tempGroup.isValidName()) {
                    return res.status(400).json({
                        success: false,
                        message: 'El nombre del grupo debe tener entre 3 y 100 caracteres'
                    });
                }
            }

            const updatedGroup = await GroupRepository.update(id, updateData);
            
            res.json({
                success: true,
                data: updatedGroup,
                message: 'Grupo actualizado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al actualizar grupo',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // DELETE /groups/:id - Eliminar grupo
    static async deleteGroup(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { userId } = req.body; // Usuario que quiere eliminar

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'userId es requerido en el body'
                });
            }

            // Verificar si el grupo existe
            const existingGroup = await GroupRepository.findById(id);
            if (!existingGroup) {
                return res.status(404).json({
                    success: false,
                    message: 'Grupo no encontrado'
                });
            }

            // Verificar si el usuario es admin
            const isAdmin = await GroupRepository.isUserAdmin(id, userId);
            if (!isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: 'Solo los administradores pueden eliminar el grupo'
                });
            }

            const deleted = await GroupRepository.delete(id);
            
            if (deleted) {
                res.json({
                    success: true,
                    message: 'Grupo eliminado exitosamente'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error al eliminar grupo'
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al eliminar grupo',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // POST /groups/:id/members - Agregar miembro al grupo
    static async addMember(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const memberData: AddMemberRequest & { requestedBy: string } = req.body;

            if (!memberData.user_id || !memberData.requestedBy) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan campos requeridos: user_id, requestedBy'
                });
            }

            // Verificar si el grupo existe
            const group = await GroupRepository.findById(id);
            if (!group) {
                return res.status(404).json({
                    success: false,
                    message: 'Grupo no encontrado'
                });
            }

            // Verificar si quien hace la petición es admin
            const isAdmin = await GroupRepository.isUserAdmin(id, memberData.requestedBy);
            if (!isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: 'Solo los administradores pueden agregar miembros'
                });
            }

            await GroupRepository.addMember(id, {
                user_id: memberData.user_id,
                role: memberData.role || 'member'
            });
            
            // Obtener grupo actualizado
            const updatedGroup = await GroupRepository.findById(id);
            
            res.status(201).json({
                success: true,
                data: updatedGroup,
                message: 'Miembro agregado exitosamente'
            });
        } catch (error) {
            if (error instanceof Error && error.message === 'El usuario ya es miembro del grupo') {
                return res.status(409).json({
                    success: false,
                    message: error.message
                });
            }
            
            res.status(500).json({
                success: false,
                message: 'Error al agregar miembro',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // DELETE /groups/:id/members/:userId - Remover miembro del grupo
    static async removeMember(req: Request, res: Response) {
        try {
            const { id, userId } = req.params;
            const { requestedBy } = req.body;

            if (!requestedBy) {
                return res.status(400).json({
                    success: false,
                    message: 'requestedBy es requerido en el body'
                });
            }

            // Verificar si el grupo existe
            const group = await GroupRepository.findById(id);
            if (!group) {
                return res.status(404).json({
                    success: false,
                    message: 'Grupo no encontrado'
                });
            }

            // Verificar si quien hace la petición es admin o se está removiendo a sí mismo
            const isAdmin = await GroupRepository.isUserAdmin(id, requestedBy);
            const isSelfRemoval = requestedBy === userId;
            
            if (!isAdmin && !isSelfRemoval) {
                return res.status(403).json({
                    success: false,
                    message: 'Solo los administradores pueden remover otros miembros, o puedes removerte a ti mismo'
                });
            }

            const removed = await GroupRepository.removeMember(id, userId);
            
            if (removed) {
                res.json({
                    success: true,
                    message: 'Miembro removido exitosamente'
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'El usuario no es miembro del grupo'
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al remover miembro',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
}