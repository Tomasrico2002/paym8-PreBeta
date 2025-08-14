"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  Plus,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  LogOut,
  Receipt,
  PieChart,
  Calendar,
} from "lucide-react"
import type { Group } from "@/app/page"
import { ExpenseChart } from "@/components/expense-chart"
import { BalanceChart } from "@/components/balance-chart"

interface GroupDashboardProps {
  group: Group
  onBack: () => void
  onLogout: () => void
}

interface Expense {
  id: string
  description: string
  amount: number
  paidBy: string
  date: string
  category: string
  splitBetween: string[]
}

interface Balance {
  member: string
  balance: number
}

export function GroupDashboard({ group, onBack, onLogout }: GroupDashboardProps) {
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: "1",
      description: "Cena en restaurante",
      amount: 120.5,
      paidBy: "Ana",
      date: "2024-01-20",
      category: "Comida",
      splitBetween: ["Ana", "Carlos", "María", "Pedro"],
    },
    {
      id: "2",
      description: "Hotel Barcelona",
      amount: 480.0,
      paidBy: "Carlos",
      date: "2024-01-19",
      category: "Alojamiento",
      splitBetween: ["Ana", "Carlos", "María", "Pedro"],
    },
    {
      id: "3",
      description: "Transporte público",
      amount: 45.2,
      paidBy: "María",
      date: "2024-01-18",
      category: "Transporte",
      splitBetween: ["Ana", "Carlos", "María", "Pedro"],
    },
    {
      id: "4",
      description: "Entradas museo",
      amount: 60.0,
      paidBy: "Pedro",
      date: "2024-01-17",
      category: "Entretenimiento",
      splitBetween: ["Ana", "Carlos", "María"],
    },
  ])

  const [balances] = useState<Balance[]>([
    { member: "Ana", balance: -45.3 },
    { member: "Carlos", balance: 125.2 },
    { member: "María", balance: -35.4 },
    { member: "Pedro", balance: -44.5 },
  ])

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    paidBy: "",
    category: "Comida",
    splitBetween: group.members,
  })

  const handleAddExpense = () => {
    if (newExpense.description && newExpense.amount && newExpense.paidBy) {
      const expense: Expense = {
        id: Date.now().toString(),
        description: newExpense.description,
        amount: Number.parseFloat(newExpense.amount),
        paidBy: newExpense.paidBy,
        date: new Date().toISOString().split("T")[0],
        category: newExpense.category,
        splitBetween: newExpense.splitBetween,
      }
      setExpenses([expense, ...expenses])
      setNewExpense({
        description: "",
        amount: "",
        paidBy: "",
        category: "Comida",
        splitBetween: group.members,
      })
      setIsAddExpenseOpen(false)
    }
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const expensesByCategory = expenses.reduce(
    (acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{group.name}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{group.description}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Gasto
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Agregar Nuevo Gasto</DialogTitle>
                    <DialogDescription>Registra un nuevo gasto para el grupo</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="expense-description">Descripción</Label>
                      <Input
                        id="expense-description"
                        value={newExpense.description}
                        onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                        placeholder="Ej: Cena en restaurante"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expense-amount">Cantidad (€)</Label>
                        <Input
                          id="expense-amount"
                          type="number"
                          step="0.01"
                          value={newExpense.amount}
                          onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expense-category">Categoría</Label>
                        <Select
                          value={newExpense.category}
                          onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Comida">Comida</SelectItem>
                            <SelectItem value="Transporte">Transporte</SelectItem>
                            <SelectItem value="Alojamiento">Alojamiento</SelectItem>
                            <SelectItem value="Entretenimiento">Entretenimiento</SelectItem>
                            <SelectItem value="Compras">Compras</SelectItem>
                            <SelectItem value="Otros">Otros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expense-paidby">Pagado por</Label>
                      <Select
                        value={newExpense.paidBy}
                        onValueChange={(value) => setNewExpense({ ...newExpense, paidBy: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona quien pagó" />
                        </SelectTrigger>
                        <SelectContent>
                          {group.members.map((member) => (
                            <SelectItem key={member} value={member}>
                              {member}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsAddExpenseOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleAddExpense}>Agregar Gasto</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>TU</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{totalExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">{expenses.length} gastos registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Miembros</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{group.members.length}</div>
              <p className="text-xs text-muted-foreground">personas en el grupo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tu Balance</CardTitle>
              {group.yourBalance >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${group.yourBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                {group.yourBalance >= 0 ? "+" : ""}€{group.yourBalance.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">{group.yourBalance >= 0 ? "Te deben" : "Debes"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="expenses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="expenses">Gastos</TabsTrigger>
            <TabsTrigger value="balances">Balances</TabsTrigger>
            <TabsTrigger value="analytics">Análisis</TabsTrigger>
            <TabsTrigger value="members">Miembros</TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Receipt className="h-5 w-5" />
                  <span>Historial de Gastos</span>
                </CardTitle>
                <CardDescription>Todos los gastos registrados en el grupo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h4 className="font-medium">{expense.description}</h4>
                            <p className="text-sm text-gray-500">
                              Pagado por {expense.paidBy} • {expense.date}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">€{expense.amount.toFixed(2)}</p>
                        <Badge variant="secondary" className="text-xs">
                          {expense.category}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="balances" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Balances del Grupo</CardTitle>
                <CardDescription>Quién debe dinero y quién debe recibir</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {balances.map((balance) => (
                    <div key={balance.member} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>{balance.member.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{balance.member}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {balance.balance > 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : balance.balance < 0 ? (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        ) : null}
                        <span
                          className={`font-semibold ${
                            balance.balance > 0
                              ? "text-green-600"
                              : balance.balance < 0
                                ? "text-red-600"
                                : "text-gray-600"
                          }`}
                        >
                          {balance.balance >= 0 ? "+" : ""}€{balance.balance.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5" />
                    <span>Gastos por Categoría</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ExpenseChart data={expensesByCategory} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Balances por Miembro</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BalanceChart data={balances} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Miembros del Grupo</CardTitle>
                <CardDescription>Personas que forman parte de este grupo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.members.map((member, index) => (
                    <div key={index} className="flex items-center space-x-3 p-4 border rounded-lg">
                      <Avatar>
                        <AvatarFallback>{member.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member}</p>
                        <p className="text-sm text-gray-500">Miembro desde {group.createdAt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
