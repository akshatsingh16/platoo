"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRestaurant } from "@/components/restaurant-context"
import {
  getTables,
  createTable,
  updateTable,
  deleteTable,
  regenerateQrToken,
} from "@/lib/api"
import type { TableResponse, CreateTableRequest, TableStatus } from "@/lib/types"

import { AppSidebar } from "@/components/dashboardcontent/sidebar"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  Plus,
  QrCode,
  RefreshCw,
  Trash2,
  Pencil,
  X,
  Check,
  Loader2,
  Printer,
  Copy,
  ExternalLink,
} from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

const statusColors: Record<TableStatus, string> = {
  AVAILABLE: "bg-green-100 text-green-700",
  OCCUPIED: "bg-orange-100 text-orange-700",
  RESERVED: "bg-blue-100 text-blue-700",
  MAINTENANCE: "bg-gray-200 text-gray-600",
}

export default function TablesPage() {
  const { restaurant } = useRestaurant()
  const [tables, setTables] = useState<TableResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Create form
  const [showCreate, setShowCreate] = useState(false)
  const [newTable, setNewTable] = useState<CreateTableRequest>({
    tableNumber: "",
    capacity: 4,
  })
  const [creating, setCreating] = useState(false)

  // Edit state
  const [editId, setEditId] = useState<string | null>(null)
  const [editData, setEditData] = useState({ tableNumber: "", capacity: 4, label: "" })

  // QR Modal
  const [qrModalTable, setQrModalTable] = useState<TableResponse | null>(null)
  const [copied, setCopied] = useState(false)

  // Origin encoded into QR codes. "localhost" is unreachable from a phone,
  // so when the dashboard is opened via localhost we ask the server for its LAN address.
  const [publicOrigin, setPublicOrigin] = useState<string>("")

  useEffect(() => {
    const { hostname, origin } = window.location
    const isLocal = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1"
    setPublicOrigin(origin)
    if (!isLocal && !process.env.NEXT_PUBLIC_APP_URL) return

    fetch("/api/network")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { publicOrigin?: string } | null) => {
        if (data?.publicOrigin) setPublicOrigin(data.publicOrigin)
      })
      .catch(() => {
        /* keep window.location.origin */
      })
  }, [])

  const fetchTables = useCallback(async () => {
    if (!restaurant) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const data = await getTables(restaurant.id)
      setTables(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tables")
    } finally {
      setLoading(false)
    }
  }, [restaurant])

  useEffect(() => {
    fetchTables()
  }, [fetchTables])

  const handleCreate = async () => {
    if (!restaurant || !newTable.tableNumber) return
    setCreating(true)
    try {
      await createTable(restaurant.id, newTable)
      setShowCreate(false)
      setNewTable({ tableNumber: "", capacity: 4 })
      await fetchTables()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create table")
    } finally {
      setCreating(false)
    }
  }

  const handleUpdate = async (tableId: string) => {
    if (!restaurant) return
    try {
      await updateTable(restaurant.id, tableId, editData)
      setEditId(null)
      await fetchTables()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update table")
    }
  }

  const handleDelete = async (tableId: string) => {
    if (!restaurant || !confirm("Delete this table?")) return
    try {
      await deleteTable(restaurant.id, tableId)
      await fetchTables()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete table")
    }
  }

  const handleRegenerateQr = async (tableId: string) => {
    if (!restaurant) return
    try {
      const updated = await regenerateQrToken(restaurant.id, tableId)
      await fetchTables()
      if (qrModalTable?.id === tableId) {
        setQrModalTable(updated)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to regenerate QR")
    }
  }

  const getTableQrUrl = (qrToken: string) => {
    const origin =
      publicOrigin || (typeof window !== "undefined" ? window.location.origin : "")
    return `${origin}/qr/${qrToken}`
  }

  const handleCopyLink = (token: string) => {
    navigator.clipboard.writeText(getTableQrUrl(token))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    window.print()
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
                <h1 className="text-lg font-semibold">Tables</h1>
                <p className="text-xs text-muted-foreground">
                  Manage restaurant tables and generate printable QR codes
                </p>
              </div>
              <Button
                onClick={() => setShowCreate(true)}
                className="gap-1.5 rounded-lg bg-orange-500 text-xs hover:bg-orange-600"
                size="sm"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Table
              </Button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Create form */}
            {showCreate && (
              <Card className="mb-4 rounded-xl border bg-white p-4 shadow-none">
                <h3 className="mb-3 text-sm font-medium">New Table</h3>
                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">
                      Table Number
                    </label>
                    <Input
                      value={newTable.tableNumber}
                      onChange={(e) =>
                        setNewTable({ ...newTable, tableNumber: e.target.value })
                      }
                      placeholder="e.g. T1"
                      className="h-8 w-32 text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">
                      Capacity
                    </label>
                    <Input
                      type="number"
                      min={1}
                      value={newTable.capacity}
                      onChange={(e) =>
                        setNewTable({
                          ...newTable,
                          capacity: parseInt(e.target.value) || 1,
                        })
                      }
                      className="h-8 w-20 text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">
                      Label (optional)
                    </label>
                    <Input
                      value={newTable.label || ""}
                      onChange={(e) =>
                        setNewTable({ ...newTable, label: e.target.value })
                      }
                      placeholder="e.g. Window seat"
                      className="h-8 w-40 text-xs"
                    />
                  </div>
                  <Button
                    onClick={handleCreate}
                    disabled={creating}
                    size="sm"
                    className="h-8 gap-1 rounded-md bg-orange-500 text-xs hover:bg-orange-600"
                  >
                    {creating && <Loader2 className="h-3 w-3 animate-spin" />}
                    Create
                  </Button>
                  <Button
                    onClick={() => setShowCreate(false)}
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            )}

            {/* Tables grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
              </div>
            ) : tables.length === 0 ? (
              <Card className="flex flex-col items-center gap-2 rounded-xl border bg-white p-8 shadow-none">
                <QrCode className="h-10 w-10 text-gray-300" />
                <p className="text-sm text-muted-foreground">
                  No tables yet. Add your first table!
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {tables.map((table) => {
                  const tableUrl = getTableQrUrl(table.qrToken)

                  return (
                    <Card
                      key={table.id}
                      className="rounded-xl border bg-white p-4 shadow-none transition-shadow hover:shadow-md"
                    >
                      {editId === table.id ? (
                        /* Edit mode */
                        <div className="space-y-2">
                          <Input
                            value={editData.tableNumber}
                            onChange={(e) =>
                              setEditData({ ...editData, tableNumber: e.target.value })
                            }
                            className="h-7 text-xs"
                            placeholder="Table number"
                          />
                          <Input
                            type="number"
                            value={editData.capacity}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                capacity: parseInt(e.target.value) || 1,
                              })
                            }
                            className="h-7 text-xs"
                          />
                          <Input
                            value={editData.label}
                            onChange={(e) =>
                              setEditData({ ...editData, label: e.target.value })
                            }
                            className="h-7 text-xs"
                            placeholder="Label"
                          />
                          <div className="flex gap-1">
                            <Button
                              onClick={() => handleUpdate(table.id)}
                              size="sm"
                              className="h-7 gap-1 rounded bg-green-500 text-xs hover:bg-green-600"
                            >
                              <Check className="h-3 w-3" />
                              Save
                            </Button>
                            <Button
                              onClick={() => setEditId(null)}
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* View mode */
                        <>
                          <div className="mb-2 flex items-start justify-between">
                            <div>
                              <h3 className="text-sm font-semibold">
                                Table {table.tableNumber}
                              </h3>
                              {table.label && (
                                <p className="text-[10px] text-muted-foreground">
                                  {table.label}
                                </p>
                              )}
                            </div>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${statusColors[table.status]}`}
                            >
                              {table.status}
                            </span>
                          </div>

                          <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
                            <span>👥 {table.capacity} seats</span>
                          </div>

                          {/* QR Preview & Quick Action */}
                          <div
                            onClick={() => setQrModalTable(table)}
                            className="mb-3 flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-gray-200 bg-orange-50/40 p-2 transition hover:border-orange-300 hover:bg-orange-50"
                          >
                            <div className="rounded bg-white p-1 shadow-sm">
                              <QRCodeSVG value={tableUrl} size={48} level="M" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-semibold text-gray-800">
                                Click to View / Print QR
                              </p>
                              <p className="truncate font-mono text-[9px] text-muted-foreground">
                                {table.qrToken}
                              </p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between border-t pt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 px-2 text-[11px] text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                              onClick={() => setQrModalTable(table)}
                            >
                              <QrCode className="h-3 w-3" />
                              Print QR
                            </Button>

                            <div className="flex items-center gap-0.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                title="Edit"
                                onClick={() => {
                                  setEditId(table.id)
                                  setEditData({
                                    tableNumber: table.tableNumber,
                                    capacity: table.capacity,
                                    label: table.label || "",
                                  })
                                }}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                title="Regenerate QR"
                                onClick={() => handleRegenerateQr(table.id)}
                              >
                                <RefreshCw className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500 hover:text-red-600"
                                title="Delete"
                                onClick={() => handleDelete(table.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </SidebarInset>

      {/* QR Code Modal / Print View */}
      {qrModalTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close modal"
            onClick={() => setQrModalTable(null)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setQrModalTable(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Printable Card Area */}
            <div id="printable-qr" className="flex flex-col items-center text-center">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 font-bold text-white shadow-md shadow-orange-300">
                P
              </div>

              <h2 className="text-base font-bold text-gray-900">
                {restaurant?.name || "Plato Restaurant"}
              </h2>
              <p className="mt-0.5 text-xs font-semibold text-orange-600">
                Table {qrModalTable.tableNumber} {qrModalTable.label ? `(${qrModalTable.label})` : ""}
              </p>
              <p className="mt-1 text-[11px] text-gray-500">
                Scan with phone camera to browse menu & order
              </p>

              {/* QR Image */}
              <div className="my-5 rounded-2xl border-4 border-orange-100 bg-white p-4 shadow-lg shadow-orange-100/50">
                <QRCodeSVG
                  value={getTableQrUrl(qrModalTable.qrToken)}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <p className="break-all font-mono text-[10px] text-gray-400">
                {getTableQrUrl(qrModalTable.qrToken)}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-2">
              <div className="flex gap-2">
                <Button
                  onClick={handlePrint}
                  className="flex-1 gap-1.5 rounded-xl bg-orange-500 text-xs font-bold text-white hover:bg-orange-600"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print QR
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleCopyLink(qrModalTable.qrToken)}
                  className="flex-1 gap-1.5 rounded-xl text-xs font-semibold"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied!" : "Copy URL"}
                </Button>
              </div>

              <Button
                variant="ghost"
                onClick={() => handleRegenerateQr(qrModalTable.id)}
                className="gap-1.5 text-xs text-muted-foreground hover:text-black"
              >
                <RefreshCw className="h-3 w-3" />
                Regenerate Token
              </Button>
            </div>
          </div>
        </div>
      )}
    </SidebarProvider>
  )
}
