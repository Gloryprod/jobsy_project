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
 
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}
 
export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
    const [globalFilter, setGlobalFilter] = useState<any>([])
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: 'includesString',
        state: {
            globalFilter,
        },
    })

    const [selectedRows, setSelectedRows] = React.useState<Set<string>>(
        new Set(["1"])
    )
    const selectAll = selectedRows.size === data.length
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
        setSelectedRows(new Set(data.map((row) => row.id)))
        } else {
        setSelectedRows(new Set())
        }
    }
    const handleSelectRow = (id: string, checked: boolean) => {
        const newSelected = new Set(selectedRows)
        if (checked) {
        newSelected.add(id)
        } else {
        newSelected.delete(id)
        }
        setSelectedRows(newSelected)
    }

    
    return (
        <div>

            <div className="flex items-end justify-end">
                <Input
                    value=""
                    onChange={e => table.setGlobalFilter(String(e.target.value))}
                    placeholder="Rechercher..."
                    className="m-2 w-64"
                />
            </div>
            <div className="overflow-x-auto no-scrollba bg-gray-50 shadow-xs rounded-lg m-2">
                <Table>
                    <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} data-state={selectedRows.has(headerGroup.id) ? "selected" : undefined}
>
                        <TableHead className="w-8 bg-[#000080]/80 text-white ">
                            <Checkbox
                                id="select-all-checkbox"
                                name="select-all-checkbox"
                                checked={selectAll}
                                onCheckedChange={handleSelectAll}
                                className="text-white"
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
                                    id={`row-${row.id}-checkbox`}
                                    name={`row-${row.id}-checkbox`}
                                    checked={selectedRows.has(row.id)}
                                    onCheckedChange={(checked) =>
                                    handleSelectRow(row.id, checked === true)
                                    }
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