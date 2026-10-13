"use client"

import { useEffect, useState, useCallback } from "react"
import { useRestaurant } from "@/components/restaurant-context"
import {
  getEmployees,
  assignEmployee,
  updateEmployeeRole,
  deactivateEmployee,
} from "@/lib/api"
import type { EmployeeResponse, EmployeeRole } from "@/lib/types"

import { AppSidebar } from "@/components/dashboardcontent/sidebar"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Plus, Trash2, Loader2, Users, UserPlus } from "lucide-react"

const ALL_ROLES: EmployeeRole[] = ["MANAGER", "CHEF", "WAITER", "CASHIER"]

const roleColors: Record<EmployeeRole, string> = {
  MANAGER: "bg-purple-100 text-purple-700",
  CHEF: "bg-orange-100 text-orange-700",
  WAITER: "bg-blue-100 text-blue-700",
  CASHIER: "bg-green-100 text-green-700",
}

export default function EmployeesPage() {
  const { restaurant } = useRestaurant()
  const [employees, setEmployees] = useState<EmployeeResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Assign form
  const [showAssign, setShowAssign] = useState(false)
  const [assignUserId, setAssignUserId] = useState("")
  const [assignRole, setAssignRole] = useState<EmployeeRole>("WAITER")
  const [assigning, setAssigning] = useState(false)

  const fetchEmployees = useCallback(async () => {
    if (!restaurant) return
    try {
      setLoading(true)
      const data = await getEmployees(restaurant.id)
      setEmployees(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load employees")
    } finally {
      setLoading(false)
    }
  }, [restaurant])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const handleAssign = async () => {
    if (!restaurant || !assignUserId) return
    setAssigning(true)
    try {
      await assignEmployee(restaurant.id, {
        userId: assignUserId,
        role: assignRole,
      })
      setShowAssign(false)
      setAssignUserId("")
      await fetchEmployees()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign employee")
    } finally {
      setAssigning(false)
    }
  }

  const handleRoleChange = async (employeeId: string, role: EmployeeRole) => {
    if (!restaurant) return
    try {
      await updateEmployeeRole(restaurant.id, employeeId, { role })
      await fetchEmployees()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role")
    }
  }

  const handleDeactivate = async (employeeId: string) => {
    if (!restaurant || !confirm("Deactivate this employee?")) return
    try {
      await deactivateEmployee(restaurant.id, employeeId)
      await fetchEmployees()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to deactivate employee")
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="min-h-screen bg-[#f7f7f6]">
          <div className="px-3 pt-2">
            <SidebarTrigger />
          </div>

          <div className="px-4 pb-6 pt-2">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold">Employees</h1>
                <p className="text-xs text-muted-foreground">
                  Manage staff assigned to this restaurant
                </p>
              </div>
              <Button
                onClick={() => setShowAssign(true)}
                className="gap-1.5 rounded-lg bg-orange-500 text-xs hover:bg-orange-600"
                size="sm"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Assign Employee
              </Button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                {error}
                <button onClick={() => setError("")} className="ml-2 font-bold">
                  ×
                </button>
              </div>
            )}

            {/* Assign form */}
            {showAssign && (
              <Card className="mb-4 rounded-xl border bg-white p-4 shadow-none">
                <h3 className="mb-3 text-sm font-medium">Assign Employee</h3>
                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">
                      User ID
                    </label>
                    <Input
                      value={assignUserId}
                      onChange={(e) => setAssignUserId(e.target.value)}
                      placeholder="Enter user UUID"
                      className="h-8 w-72 text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">
                      Role
                    </label>
                    <select
                      value={assignRole}
                      onChange={(e) => setAssignRole(e.target.value as EmployeeRole)}
                      className="h-8 rounded-md border border-gray-200 px-2 text-xs"
                    >
                      {ALL_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    onClick={handleAssign}
                    disabled={assigning}
                    size="sm"
                    className="h-8 gap-1 rounded bg-orange-500 text-xs hover:bg-orange-600"
                  >
                    {assigning && <Loader2 className="h-3 w-3 animate-spin" />}
                    Assign
                  </Button>
                  <Button
                    onClick={() => setShowAssign(false)}
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            )}

            {/* Employee list */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
              </div>
            ) : employees.length === 0 ? (
              <Card className="flex flex-col items-center gap-2 rounded-xl border bg-white p-8 shadow-none">
                <Users className="h-10 w-10 text-gray-300" />
                <p className="text-sm text-muted-foreground">
                  No employees assigned yet
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {employees.map((emp) => (
                  <Card
                    key={emp.id}
                    className="rounded-xl border bg-white p-4 shadow-none"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium">
                          Employee #{emp.id.slice(0, 8)}
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          User: {emp.userId.slice(0, 8)}…
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${roleColors[emp.role]}`}
                      >
                        {emp.role}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <select
                        value={emp.role}
                        onChange={(e) =>
                          handleRoleChange(emp.id, e.target.value as EmployeeRole)
                        }
                        className="h-7 flex-1 rounded border border-gray-200 px-2 text-[10px]"
                      >
                        {ALL_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-600"
                        onClick={() => handleDeactivate(emp.id)}
                        title="Deactivate"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    <p className="mt-2 text-[9px] text-muted-foreground">
                      Since {new Date(emp.createdAt).toLocaleDateString()}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
