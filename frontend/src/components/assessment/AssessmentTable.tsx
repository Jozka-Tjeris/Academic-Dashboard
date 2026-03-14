"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  useReactTable,
  SortingState,
} from "@tanstack/react-table";

import UrgencyHeatBar from "@/components/dashboard/UrgencyHeatBar";
import { getStatusColor } from "@/lib/statusColor";
import { AssessmentShared, AssessmentStatus, AssessmentStatusMetadata } from "@internal_package/shared";
import AssessmentActions from "./AssessmentActions";
import { Input } from "../ui/Input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { ArrowDown } from "lucide-react";

export type AssessmentRow = AssessmentShared & {
  courseId: string;  // Added courseId for multi-course context
  urgency?: number;
  courseName?: string;
};

interface AssessmentTableProps {
  assessments: AssessmentRow[];
}

export default function AssessmentTable({ assessments }: AssessmentTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<AssessmentStatus | null>(null);

  const columns = useMemo<ColumnDef<AssessmentRow>[]>(() => {

    const cols: ColumnDef<AssessmentRow>[] = [];

    if (assessments[0]?.courseName !== undefined) {
      cols.push({
        accessorKey: "courseName",
        header: "Course",
        cell: info => (
          <span className="font-medium">
            {info.getValue() as string}
          </span>
        ),
      });
    }

    if (assessments[0]?.urgency !== undefined) {
      cols.push({
        accessorKey: "urgency",
        header: "Urgency",
        cell: info => {
          const row = info.row.original;
          return (
            <UrgencyHeatBar
              urgency={row.urgency!}
              weight={row.weight}
            />
          );
        },
      });
    }

    cols.push(
      {
        accessorKey: "title",
        header: "Title",
        cell: info => (
          <span className="font-medium">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "weight",
        header: "Weight",
        cell: info => `${(info.getValue<number>() * 100).toFixed(0)}%`,
      },
      {
        accessorKey: "score",
        header: "Score",
        sortingFn: (a, b) => {
          const aScore = a.original.score ?? -1;
          const bScore = b.original.score ?? -1;
          return aScore - bScore;
        },
        cell: info => {
          const row = info.row.original;
          return row.score !== null && row.maxScore
            ? `${row.score}/${row.maxScore}`
            : "—";
        },
      },
      {
        accessorKey: "dueDate",
        header: "Due Date",
        cell: info =>
          new Date(info.getValue<Date>()).toLocaleDateString(),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: info => {
          const status = info.getValue<AssessmentStatus>();
          return (
            <span className={getStatusColor(status)}>
              {AssessmentStatusMetadata[status].label}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: info => (
          <div
            onClick={e => e.stopPropagation()}
            className="text-center"
          >
            <AssessmentActions
              assessment={info.row.original}
            />
          </div>
        ),
      }
    );

    return cols;

  }, [assessments]);

  const filteredAssessments = useMemo(() => {
    if (statusFilter === null) return assessments;

    return assessments.filter(a => a.status === statusFilter);
  }, [assessments, statusFilter]);

  const table = useReactTable({
    data: filteredAssessments,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (assessments.length === 0) {
    return <div className="text-muted-foreground">No assessments yet</div>;
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="p-1 rounded hover:bg-muted cursor-pointer flex items-center gap-x-2 px-2 border rounded-md h-8">
              {statusFilter !== null ? AssessmentStatusMetadata[statusFilter].label : "All Statuses"} 
              <ArrowDown size={16}/>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                setStatusFilter(null);
              }}
              className="cursor-pointer">
                All Statuses
            </DropdownMenuItem>
            {(Object.entries(AssessmentStatusMetadata) as [
                AssessmentStatus,
                (typeof AssessmentStatusMetadata)[AssessmentStatus]
              ][]).map(([key, meta]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={(e) => {
                    e.stopPropagation();
                    setStatusFilter(key);
                  }}
                  className="cursor-pointer"
                >
                  {meta.label}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Input
          placeholder="Search for a value..."
          value={globalFilter ?? ""}
          onChange={e => setGlobalFilter(e.target.value)}
          className="max-w-sm min-w-sm"
        />
      </div>
      <div className="border rounded-lg overflow-hidden w-full">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="text-left">
                {headerGroup.headers.map(header => {

                  const canSort = header.column.getCanSort();
                  const sort = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      className={`p-3 ${canSort ? "cursor-pointer select-none" : ""}`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}

                      {sort === "asc" && " ↑"}
                      {sort === "desc" && " ↓"}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr
                key={row.id}
                className="border-t hover:bg-muted/40 cursor-pointer transition-colors"
                onClick={() =>
                  router.push(`/assessments/${row.original.assessmentId}`)
                }
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="p-3">
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
