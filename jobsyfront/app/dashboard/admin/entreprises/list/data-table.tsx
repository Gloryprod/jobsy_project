"use client"
 
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table"
 
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import React, { useState } from 'react';
import api from '@/lib/api';
import { Trash2, Search } from "lucide-react" 
import Swal from 'sweetalert2';
import { toast } from 'react-hot-toast';
 
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  bulkDeleteUrl?: string 
  onSuccess?: () => void 
}
 
export function DataTable<TData, TValue>({
  columns,
  data,
  bulkDeleteUrl,
  onSuccess
}: DataTableProps<TData, TValue>) {
    const [globalFilter, setGlobalFilter] = useState("")
    const [rowSelection, setRowSelection] = useState({})
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: 'includesString',
        state: {
            globalFilter,
            rowSelection,
        },
    })

    const handleDeleteSelected = async () => {
        if (!bulkDeleteUrl) return
        const selectedIds = table.getSelectedRowModel().rows.map((row: any) => row.original.id)

        const result = await Swal.fire({
        title: `Voulez-vous supprimer ces ${selectedIds.length} offres ?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Oui, supprimer",
        cancelButtonText: "Annuler",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        });

        if (result.isConfirmed) {

            try {
                await api.post(bulkDeleteUrl, { ids: selectedIds })
                toast.success("Suppression effectuée avec succès")
                setRowSelection({})
                if (onSuccess) onSuccess()
            } catch (error) {
                toast.error("Erreur suppression")
            }
        }  
    }

    
    return (
        <>
            {/* Barre d'outils supérieure */}
            <div className="flex items-center justify-between px-2 py-6">
                <div className="flex items-center gap-2">
                    {bulkDeleteUrl && table.getSelectedRowModel().rows.length > 0 && (
                        <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={handleDeleteSelected}
                            className="rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-red-100 transition-all hover:scale-105"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer ({table.getSelectedRowModel().rows.length})
                        </Button>
                    )}
                </div>
                
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <Input
                        value={globalFilter ?? ""}
                        onChange={e => setGlobalFilter(e.target.value)}
                        placeholder="Rechercher dans la liste..."
                        className="w-72 pl-10 pr-4 py-6 bg-white border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#000080]/10 focus:border-[#000080] transition-all"
                    />
                </div>
            </div>

            {/* Conteneur du tableau */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden no-scrollbar" >
                <div className="container mx-auto p-4">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="border-b border-slate-100 hover:bg-transparent">
                                    <TableHead className="w-12 px-6">
                                        <Checkbox
                                            checked={table.getIsAllPageRowsSelected()}
                                            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                                            aria-label="Select all"
                                            className="border-slate-300 data-[state=checked]:bg-[#000080] data-[state=checked]:border-[#000080]"
                                        />
                                    </TableHead>

                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className="border-b border-slate-50 last:border-0 hover:bg-blue-50/30 transition-colors group"
                                    >
                                        <TableCell className="px-6">
                                            <Checkbox
                                                checked={row.getIsSelected()}
                                                onCheckedChange={(value) => row.toggleSelected(!!value)}
                                                aria-label="Select row"
                                                className="border-slate-300 data-[state=checked]:bg-[#000080] data-[state=checked]:border-[#000080]"
                                            />
                                        </TableCell>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="px-6 py-4 text-sm font-medium text-slate-600 group-data-[state=selected]:text-[#000080]">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length + 1} className="h-40 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400 italic gap-2">
                                            <Search size={32} className="opacity-20" />
                                            <p>Aucune donnée trouvée...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between py-6 px-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
                </p>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="rounded-xl border-slate-200 font-bold px-5 hover:bg-[#000080] hover:text-white transition-all disabled:opacity-30"
                    >
                        Précédent
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="rounded-xl border-slate-200 font-bold px-5 hover:bg-[#000080] hover:text-white transition-all disabled:opacity-30"
                    >
                        Suivant
                    </Button>
                </div>
            </div>
        </>
)}