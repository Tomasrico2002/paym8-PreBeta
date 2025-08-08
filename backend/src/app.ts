import express, { Application, Request, Response } from 'express';
import userRoutes from './routes/user_routes.js';
import groupRoutes from './routes/group_routes.js';
import expenseRoutes from './routes/expense_routes.js';
import paymentRoutes from './routes/payment_routes.js';
import balanceRoutes from './routes/balance_routes.js';  

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '3000');

// Middleware básico
app.use(express.json());

// Rutas
app.use('/users', userRoutes);
app.use('/groups', groupRoutes);
app.use('/expenses', expenseRoutes);
app.use('/payments', paymentRoutes);
app.use('/balances', balanceRoutes);  

// Ruta de salud
app.get('/', (req: Request, res: Response) => {
    res.json({ 
        message: 'Paym8 API - Gestión de gastos compartidos',
        version: '1.0.0',
        status: 'API completamente funcional',
        endpoints: {
            users: {
                'GET /users': 'Listar todos los usuarios',
                'GET /users/:id': 'Obtener usuario por ID',
                'POST /users': 'Crear nuevo usuario',
                'PUT /users/:id': 'Actualizar usuario',
                'DELETE /users/:id': 'Eliminar usuario'
            },
            groups: {
                'GET /groups?userId=xxx': 'Obtener grupos del usuario',
                'GET /groups/:id': 'Obtener grupo específico',
                'POST /groups': 'Crear nuevo grupo',
                'PUT /groups/:id': 'Actualizar grupo',
                'DELETE /groups/:id': 'Eliminar grupo',
                'POST /groups/:id/members': 'Agregar miembro al grupo',
                'DELETE /groups/:id/members/:userId': 'Remover miembro del grupo'
            },
            expenses: {
                'GET /expenses?groupId=xxx': 'Obtener gastos del grupo',
                'GET /expenses/:id': 'Obtener gasto específico',
                'POST /expenses': 'Crear nuevo gasto',
                'PUT /expenses/:id': 'Actualizar gasto',
                'DELETE /expenses/:id': 'Eliminar gasto',
                'GET /expenses/user/:userId/group/:groupId': 'Gastos de usuario en grupo'
            },
            payments: {
                'GET /payments?groupId=xxx': 'Obtener pagos del grupo',
                'GET /payments/:id': 'Obtener pago específico',
                'POST /payments': 'Registrar nuevo pago',
                'PUT /payments/:id': 'Actualizar pago',
                'DELETE /payments/:id': 'Eliminar pago',
                'GET /payments/between/:user1Id/:user2Id?groupId=xxx': 'Pagos entre usuarios',
                'GET /payments/user/:userId?groupId=xxx': 'Resumen de pagos de usuario'
            },
            balances: { 
                'GET /balances/group/:groupId': 'Resumen completo de balances del grupo',
                'GET /balances/user/:userId/group/:groupId': 'Balance de usuario en grupo específico',
                'GET /balances/user/:userId': 'Todos los balances del usuario',
                'GET /balances/debtors/:groupId': 'Usuarios que deben dinero en el grupo',
                'GET /balances/creditors/:groupId': 'Usuarios a quienes les deben dinero',
                'POST /balances/recalculate/:groupId': 'Recalcular balances del grupo',
                'GET /balances/settlements/:groupId': 'Plan de liquidación óptimo'
            }
        },
        features: [
            '✅ Gestión completa de usuarios',
            '✅ Grupos con sistema de roles (admin/member)',
            '✅ Registro de gastos compartidos',
            '✅ Sistema de pagos entre usuarios',
            '✅ Cálculo automático de balances',
            '✅ Plan de liquidación optimizado',
            '✅ Arquitectura escalable en capas'
        ]
    });
});

// Middleware para manejar rutas no encontradas
app.use('*', (req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint no encontrado'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(` Servidor Paym8 corriendo en puerto ${PORT}`);
    console.log(` API disponible en: http://localhost:${PORT}`);
    console.log(` Documentación completa: http://localhost:${PORT}`);
    console.log(`\n API completamente funcional con:`);
    console.log(`   ✅ Users, Groups, Expenses, Payments, Balances`);
    console.log(`   ✅ Cálculo automático de balances`);
    console.log(`   ✅ Sistema de liquidación optimizado`);
    console.log(`   ✅ Arquitectura profesional en capas\n`);
});