"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { DollarSign, Users, PieChart } from "lucide-react"

interface LoginScreenProps {
  onLogin: () => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simular delay de login
    setTimeout(() => {
      setIsLoading(false)
      onLogin()
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo y título */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">paym8</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Divide gastos con tus amigos fácilmente</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <Users className="h-6 w-6 mx-auto text-blue-600" />
            <p className="text-sm text-gray-600 dark:text-gray-300">Grupos</p>
          </div>
          <div className="space-y-2">
            <PieChart className="h-6 w-6 mx-auto text-green-600" />
            <p className="text-sm text-gray-600 dark:text-gray-300">Análisis</p>
          </div>
          <div className="space-y-2">
            <DollarSign className="h-6 w-6 mx-auto text-purple-600" />
            <p className="text-sm text-gray-600 dark:text-gray-300">Balances</p>
          </div>
        </div>

        {/* Formulario de login/signup */}
        <Card>
          <CardHeader>
            <CardTitle>Bienvenido</CardTitle>
            <CardDescription>Inicia sesión o crea una cuenta nueva</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="signup">Registrarse</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="tu@email.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input id="password" type="password" placeholder="••••••••" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input id="name" type="text" placeholder="Tu nombre" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" placeholder="tu@email.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Contraseña</Label>
                    <Input id="signup-password" type="password" placeholder="••••••••" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                    <Input id="confirm-password" type="password" placeholder="••••••••" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Demo: Puedes usar cualquier email y contraseña para probar la app
        </p>
      </div>
    </div>
  )
}
