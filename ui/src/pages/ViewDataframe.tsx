import * as React from "react";
import * as _ from "lodash-es";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { axiosAgent } from "@/lib/axios";
import { useNavigate, useParams } from "react-router-dom";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { toast } from "@/components/ui/use-toast";

const DATA_TYPES = {
  object: "Text",
  Int64: "Big Number",
  Int32: "Medium Number",
  Int16: "Small Number",
  Int8: "Extra Small Number",
  float64: "Big Float",
  float32: "Small Float",
  bool: "Boolean",
  "datetime64[ns]": "Date",
  "timedelta64[ns]": "Date with timezone",
  category: "Categorical",
  complex: "Complex",
};

const number_to_signed_str = (num: any) => {
  return num >= 0 ? `+${num}` : `${num}`;
};

export default function ViewDataframe() {
  // Get dataframe's public key from query parameters
  const { pk } = useParams();

  // Setup pagination states
  const [page, setPage] = React.useState(1);
  const [currentPage, setCurrentPage] = React.useState({
    total_pages: 0,
    current_page: 0,
  });
  const pageSize = 10;

  // Declare data table state
  const [data, setData] = React.useState([]);
  const [columns, setColumns] = React.useState<ColumnDef<any>[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const navigate = useNavigate();

  // Load tables data from server
  const loadData = () => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    axiosAgent.get(`dataframe/${pk}?${params}`).then((res) => {
      setData(JSON.parse(_.get(res.data, ["data"])));
      console.log(JSON.parse(_.get(res.data, ["data"])));
      setCurrentPage({
        current_page: res.data.current_page,
        total_pages: res.data.total_pages,
      });
      const dtypes = _.get(res.data, ["dtypes"]);

      // Setup dynamic columns based on the dataframe
      setColumns([]);
      for (const [key, value] of Object.entries(dtypes)) {
        setColumns((columns) => [
          ...columns,
          {
            accessorKey: key,
            header: () => (
              <p className="flex gap-2 items-center">
                <span>{key}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-6 w-6 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Data Types</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {/* Handle data type change button event */}
                    {Object.keys(DATA_TYPES).map((_key, index) => (
                      <DropdownMenuItem
                        key={index}
                        onClick={() => updateDataType(_key, key, dtypes)}
                        className={_key == value ? "bg-slate-100" : ""}
                      >
                        {_.get(DATA_TYPES, _key)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </p>
            ),
            cell: ({ row }) => (
              <div className="capitalize">{row.getValue(key)}</div>
            ),
          },
        ]);
      }
    });
  };

  // Fetch table's data on component mount, and when pagination states change
  React.useEffect(() => {
    loadData();
  }, [page, pageSize, pk]);

  const updateDataType = (label: string, columnKey: string, dtypes: any) => {
    _.set(dtypes, columnKey, label);
    axiosAgent
      .patch(`dataframe/${pk}/`, { dtypes })
      .then(() => {
        loadData();
        toast({
          title: "Datatype successfully changed.",
          description: "Congrats!",
        });
      })
      .catch(() => {
        toast({
          title: "Datatype update failed",
          description: `${columnKey} cannot be converted to ${label}`,
        });
      });
  };

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: { pageIndex: page, pageSize },
    },
    manualPagination: true,
    pageCount: currentPage?.total_pages ?? -1,
  });

  return (
    <ScrollArea className="w-full">
      <h1 className="text-4xl font-bold">Dataframes list</h1>
      <div className="flex items-center py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button className="ml-2" onClick={() => navigate("/new")}>
          New
        </Button>
        <Button className="ml-2" onClick={() => navigate("/")}>
          View All
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
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
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {_.isObject(cell.getValue())
                        ? `${_.get(
                            cell.getValue(),
                            "real"
                          )}${number_to_signed_str(
                            _.get(cell.getValue(), "imag")
                          )}j`
                        : cell.getValue()?.toString()}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {currentPage?.current_page} of {currentPage?.total_pages} pages
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={currentPage?.current_page == 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={currentPage?.current_page == currentPage?.total_pages}
          >
            Next
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}
