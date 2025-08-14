"use client"

import { useState } from "react"
import { LoginScreen } from "@/components/login-screen"
import { GroupsScreen } from "@/components/groups-screen"
import { GroupDashboard } from "@/components/group-dashboard"

export type Screen = "login" | "groups" | "group-detail"

export interface Group {
  id: string
  name: string
  description: string
  members: string[]
  totalExpenses: number
  yourBalance: number
  createdAt: string
}

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("login")
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)

  const handleLogin = () => {
    setCurrentScreen("groups")
  }

  const handleSelectGroup = (group: Group) => {
    setSelectedGroup(group)
    setCurrentScreen("group-detail")
  }

  const handleBackToGroups = () => {
    setSelectedGroup(null)
    setCurrentScreen("groups")
  }

  const handleLogout = () => {
    setCurrentScreen("login")
    setSelectedGroup(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {currentScreen === "login" && <LoginScreen onLogin={handleLogin} />}

      {currentScreen === "groups" && <GroupsScreen onSelectGroup={handleSelectGroup} onLogout={handleLogout} />}

      {currentScreen === "group-detail" && selectedGroup && (
        <GroupDashboard group={selectedGroup} onBack={handleBackToGroups} onLogout={handleLogout} />
      )}
    </div>
  )
}
