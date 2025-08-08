"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CreditCard, DollarSign, TrendingUp, Users, ArrowUpRight, ArrowDownRight, Plus, Send, Download } from 'lucide-react'
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"

interface Transaction {
  id: string
  type: 'sent' | 'received'
  amount: number
  currency: string
  recipient: string
  date: string
  status: 'completed' | 'pending' | 'failed'
}

export default function DashboardPage() {
  const [user, setUser] = useState({ name: "Juan Pérez", email: "juan@email.com" })
  const [balance, setBalance] = useState(15420.50)
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "received",
      amount: 2500.00,
      currency: "USD",
      recipient: "María García",
      date: "2024-01-15",
      status: "completed"
    },
    {
      id: "2",
      type: "sent",
      amount: 850.00,
      currency: "USD",
      recipient: "Carlos López",
      date: "2024-01-14",
      status: "completed"
    },
    {
      id: "3",
      type: "received",
      amount: 1200.00,
      currency: "USD",
      recipient: "Ana Martínez",
      date: "2024-01-13",
      status: "pending"
    }
  ])

  useEffect(() => {
    // Aquí se cargarían los datos del usuario desde el backend
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('/api/transactions', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          const transactionData = await response.json()
          setTransactions(transactionData)
        }
      } catch (error) {
        console.error('Error fetching transactions:', error)
      }
    }

    fetchUserData()
    fetchTransactions()
  }, [])

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Button asChild>
              <Link href="/send">
                <Send className="mr-2 h-4 w-4" />
                Enviar Dinero
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balance Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${balance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +20.1% desde el mes pasado
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{transactions.length}</div>
              <p className="text-xs text-muted-foreground">
                +180.1% desde el mes pasado
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+$12,234</div>
              <p className="text-xs text-muted-foreground">
                +19% desde el mes pasado
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contactos Activos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+573</div>
              <p className="text-xs text-muted-foreground">
                +201 desde el mes pasado
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Transacciones Recientes</CardTitle>
              <CardDescription>
                Tus últimas transacciones realizadas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={`/text_placeholder.png?height=36&width=36&text=${transaction.recipient.charAt(0)}`} alt="Avatar" />
                      <AvatarFallback>{transaction.recipient.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {transaction.recipient}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.date}
                      </p>
                    </div>
                    <div className="ml-auto flex items-center space-x-2">
                      <Badge variant={transaction.status === 'completed' ? 'default' : 
                                   transaction.status === 'pending' ? 'secondary' : 'destructive'}>
                        {transaction.status}
                      </Badge>
                      <div className="flex items-center">
                        {transaction.type === 'sent' ? (
                          <ArrowUpRight className="h-4 w-4 text-red-500 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-green-500 mr-1" />
                        )}
                        <span className={`font-medium ${
                          transaction.type === 'sent' ? 'text-red-500' : 'text-green-500'
                        }`}>
                          {transaction.type === 'sent' ? '-' : '+'}${transaction.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>
                Accede rápidamente a las funciones más utilizadas.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Button asChild className="w-full justify-start">
                <Link href="/send">
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Dinero
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/request">
                  <Download className="mr-2 h-4 w-4" />
                  Solicitar Pago
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/contacts">
                  <Users className="mr-2 h-4 w-4" />
                  Gestionar Contactos
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/cards">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Mis Tarjetas
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
