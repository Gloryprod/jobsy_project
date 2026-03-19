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
import { Trash2 } from "lucide-react" 
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
        <div>

            <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2">
                {bulkDeleteUrl && table.getSelectedRowModel().rows.length > 0 && (
                    <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                    <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer ({table.getSelectedRowModel().rows.length})
                    </Button>
                )}
                </div>
                
                <Input
                    value={globalFilter ?? ""}
                    onChange={e => setGlobalFilter(e.target.value)}
                    placeholder="Rechercher..."
                    className="w-64"
                />
            </div>
            <div className="overflow-x-auto no-scrollba bg-gray-50 shadow-xs rounded-lg m-2">
                <Table>
                    <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                        <TableHead className="w-8 bg-[#000080]/80 text-white ">
                            <Checkbox
                                checked={table.getIsAllPageRowsSelected()}
                                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                                aria-label="Select all"
                            />
                        </TableHead>

                        {headerGroup.headers.map((header) => {
                            return (
                            <TableHead key={header.id} className="bg-[#000080]/80 text-white">
                                {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                    )}
                            </TableHead>
                            )
                        })}
                        </TableRow>
                    ))}
                    </TableHeader>
                    <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                        <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                        >
                            <TableCell>
                                <Checkbox
                                checked={row.getIsSelected()}
                                onCheckedChange={(value) => row.toggleSelected(!!value)}
                                aria-label="Select row"
                                />
                            </TableCell>
                            {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                            ))}
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                            No results.
                        </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-center space-x-2 py-4 px-4">
                <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                >
                Previous
                </Button>
                <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                >
                Next
                </Button>
        </div>
        </div>
        
    )
}