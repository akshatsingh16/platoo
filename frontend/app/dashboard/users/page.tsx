"use client"

import { useState, useEffect, useCallback } from "react"
import {
  getAllUsers,
  createUser,
  updateUserStatus,
  deleteUser,
} from "@/lib/api"
import type { UserResponse, CreateUserRequest, UserRole, UserStatus } from "@/lib/types"

import { AppSidebar } from "@/components/dashboardcontent/sidebar"
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  Check,
  Filter,
  Loader2,
  Lock,
  Plus,
  Search,
  Shield,
  Trash2,
  UserCheck,
  UserX,
  Users,
  X,
} from "lucide-react"

const roleBadges: Record<UserRole, { label: string; className: string }> = {
  SUPER_ADMIN: { label: "Super Admin", className: "bg-purple-100 text-purple-700" },
  OWNER: { label: "Restaurant Owner", className: "bg-orange-100 text-orange-700" },
  EMPLOYEE: { label: "Employee", className: "bg-blue-100 text-blue-700" },
}

const statusBadges: Record<UserStatus, { label: string; className: string }> = {
  ACTIVE: { label: "Active", className: "bg-green-100 text-green-700" },
  SUSPENDED: { label: "Suspended", className: "bg-amber-100 text-amber-700" },
  DELETED: { label: "Deleted", className: "bg-gray-100 text-gray-500" },
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Search & Filter
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("ALL")

  // Create Modal
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<CreateUserRequest>({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    role: "OWNER",
  })

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      const page = await getAllUsers(0, 100)
      setUsers(page.content)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleCreate = async () => {
    if (!form.fullName || !form.email || !form.password) return
    setCreating(true)
    setError("")
    try {
      await createUser(form)
      setShowCreate(false)
      setForm({
        fullName: "",
        email: "",
        password: "",
        phone: "",
        role: "OWNER",
      })
      await fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user")
    } finally {
      setCreating(false)
    }
  }

  const handleToggleStatus = async (user: UserResponse) => {
    const nextStatus: UserStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE"
    try {
      await updateUserStatus(user.id, nextStatus)
      await fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return
    try {
      await deleteUser(id)
      await fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user")
    }
  }

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter
    return matchesSearch && matchesRole
  })

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
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold text-gray-900">User Management</h1>
                  <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
                    Super Admin Only
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Create and manage platform accounts (Owners & Employees)
                </p>
              </div>

              <Button
                onClick={() => setShowCreate(true)}
                className="gap-1.5 rounded-lg bg-orange-500 text-xs font-semibold text-white hover:bg-orange-600"
                size="sm"
              >
                <Plus className="h-3.5 w-3.5" />
                Create Account
              </Button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                {error}
              </div>
            )}

            {/* Filter toolbar */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px] flex-1">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="h-8 rounded-lg pl-8 text-xs"
                />
              </div>

              <select
                aria-label="Filter users by role"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-8 rounded-lg border bg-white px-2.5 text-xs outline-none"
              >
                <option value="ALL">All Roles</option>
                <option value="OWNER">Owners</option>
                <option value="EMPLOYEE">Employees</option>
                <option value="SUPER_ADMIN">Super Admins</option>
              </select>
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
              </div>
            ) : filtered.length === 0 ? (
              <Card className="flex flex-col items-center justify-center p-12 text-center shadow-none">
                <Users className="mb-2 h-10 w-10 text-gray-300" />
                <p className="text-sm font-medium text-gray-700">No users found</p>
                <p className="text-xs text-muted-foreground">Try adjusting your search filters.</p>
              </Card>
            ) : (
              <Card className="overflow-hidden rounded-xl border bg-white shadow-none">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b bg-gray-50/70 text-[11px] font-semibold text-gray-500">
                      <tr>
                        <th className="px-4 py-3">Full Name</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Created</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filtered.map((u) => {
                        const roleMeta = roleBadges[u.role] || {
                          label: u.role,
                          className: "bg-gray-100 text-gray-700",
                        }
                        const statusMeta = statusBadges[u.status] || {
                          label: u.status,
                          className: "bg-gray-100 text-gray-700",
                        }

                        return (
                          <tr key={u.id} className="hover:bg-gray-50/50">
                            <td className="px-4 py-3 font-medium text-gray-900">{u.fullName}</td>
                            <td className="px-4 py-3 text-gray-600">{u.email}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${roleMeta.className}`}
                              >
                                {roleMeta.label}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusMeta.className}`}
                              >
                                {statusMeta.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {u.role !== "SUPER_ADMIN" && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-gray-500 hover:text-gray-900"
                                      title={u.status === "ACTIVE" ? "Suspend user" : "Activate user"}
                                      onClick={() => handleToggleStatus(u)}
                                    >
                                      {u.status === "ACTIVE" ? (
                                        <UserX className="h-3.5 w-3.5" />
                                      ) : (
                                        <UserCheck className="h-3.5 w-3.5" />
                                      )}
                                    </Button>

                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-red-500 hover:text-red-700"
                                      title="Delete user"
                                      onClick={() => handleDelete(u.id)}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        </main>
      </SidebarInset>

      {/* Create User Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close modal"
            onClick={() => setShowCreate(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Create Platform Account</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Full Name *</label>
                <Input
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Email Address *</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. rahul@example.com"
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Initial Password *</label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Phone</label>
                <Input
                  value={form.phone || ""}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. +91 9876543210"
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Role *</label>
                <select
                  aria-label="Account role"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                  className="h-8 w-full rounded-md border bg-white px-2.5 text-xs outline-none"
                >
                  <option value="OWNER">Restaurant Owner</option>
                  <option value="EMPLOYEE">Employee (Chef, Waiter, Manager)</option>
                </select>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {form.role === "OWNER"
                    ? "Owners can create restaurants, set up menus, and hire employees."
                    : "Employees can be assigned to restaurants by owners."}
                </p>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <Button
                disabled={creating || !form.fullName || !form.email || !form.password}
                onClick={handleCreate}
                className="flex-1 rounded-xl bg-orange-500 text-xs font-bold text-white hover:bg-orange-600"
              >
                {creating ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : null}
                Create Account
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreate(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </SidebarProvider>
  )
}
