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
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Users, DollarSign, MoreVertical, Trash2, LogOut, TrendingUp, TrendingDown } from "lucide-react"
import type { Group } from "@/app/page"

interface GroupsScreenProps {
  onSelectGroup: (group: Group) => void
  onLogout: () => void
}

export function GroupsScreen({ onSelectGroup, onLogout }: GroupsScreenProps) {
  const [groups, setGroups] = useState<Group[]>([
    {
      id: "1",
      name: "Viaje a Barcelona",
      description: "Gastos del viaje de fin de semana",
      members: ["Ana", "Carlos", "María", "Pedro"],
      totalExpenses: 1250.5,
      yourBalance: -125.3,
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      name: "Casa Compartida",
      description: "Gastos mensuales del apartamento",
      members: ["Juan", "Laura", "Diego"],
      totalExpenses: 2100.0,
      yourBalance: 45.2,
      createdAt: "2024-01-01",
    },
    {
      id: "3",
      name: "Cena de Cumpleaños",
      description: "Celebración de cumpleaños de Sofia",
      members: ["Sofia", "Miguel", "Carmen", "Roberto", "Elena"],
      totalExpenses: 180.75,
      yourBalance: 0.0,
      createdAt: "2024-01-20",
    },
  ])

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [newGroupDescription, setNewGroupDescription] = useState("")

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      const newGroup: Group = {
        id: Date.now().toString(),
        name: newGroupName,
        description: newGroupDescription,
        members: ["Tú"],
        totalExpenses: 0,
        yourBalance: 0,
        createdAt: new Date().toISOString().split("T")[0],
      }
      setGroups([...groups, newGroup])
      setNewGroupName("")
      setNewGroupDescription("")
      setIsCreateDialogOpen(false)
    }
  }

  const handleDeleteGroup = (groupId: string) => {
    setGroups(groups.filter((group) => group.id !== groupId))
  }

  const totalBalance = groups.reduce((sum, group) => sum + group.yourBalance, 0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">paym8</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Balance total</p>
                <p className={`font-semibold ${totalBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {totalBalance >= 0 ? "+" : ""}€{totalBalance.toFixed(2)}
                </p>
              </div>

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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Mis Grupos</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Gestiona tus grupos de gastos compartidos</p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Grupo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Grupo</DialogTitle>
                <DialogDescription>Crea un grupo para dividir gastos con tus amigos</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="group-name">Nombre del grupo</Label>
                  <Input
                    id="group-name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Ej: Viaje a Madrid"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="group-description">Descripción (opcional)</Label>
                  <Textarea
                    id="group-description"
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    placeholder="Describe el propósito del grupo..."
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateGroup}>Crear Grupo</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Card key={group.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <CardDescription className="mt-1">{group.description}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDeleteGroup(group.id)} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="space-y-4" onClick={() => onSelectGroup(group)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">{group.members.length} miembros</span>
                  </div>
                  <Badge variant="secondary">€{group.totalExpenses.toFixed(2)}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Tu balance:</span>
                  <div className="flex items-center space-x-1">
                    {group.yourBalance > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : group.yourBalance < 0 ? (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    ) : null}
                    <span
                      className={`font-semibold ${
                        group.yourBalance > 0
                          ? "text-green-600"
                          : group.yourBalance < 0
                            ? "text-red-600"
                            : "text-gray-600"
                      }`}
                    >
                      {group.yourBalance >= 0 ? "+" : ""}€{group.yourBalance.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {group.members.slice(0, 3).map((member, index) => (
                    <Avatar key={index} className="h-6 w-6">
                      <AvatarFallback className="text-xs">{member.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  ))}
                  {group.members.length > 3 && (
                    <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-xs text-gray-600 dark:text-gray-300">+{group.members.length - 3}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {groups.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tienes grupos aún</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Crea tu primer grupo para empezar a dividir gastos</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Grupo
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
