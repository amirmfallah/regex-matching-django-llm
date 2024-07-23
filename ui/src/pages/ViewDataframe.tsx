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
import * as _ from "lodash-es";
import { ChevronDown, Loader2, Undo2 } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Separator } from "@radix-ui/react-select";
import { SubmitHandler, useForm } from "react-hook-form";

// convert numbers to numerical string including the postive and the negative sign
const number_to_signed_str = (num: any) => {
  return num >= 0 ? `+${num}` : `${num}`;
};

type FindFormInput = {
  input_string: string;
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
      setCurrentPage({
        current_page: res.data.current_page,
        total_pages: res.data.total_pages,
      });
      const columns = _.get(res.data, ["columns"]);
      console.log(columns);

      // Setup dynamic columns based on the dataframe
      setColumns([]);
      columns.forEach((key: string) => {
        setColumns((columns) => [
          ...columns,
          {
            accessorKey: key,
            header: () => (
              <p className="flex gap-2 items-center">
                <span>{key}</span>
              </p>
            ),
            cell: ({ row }) => (
              <div className="capitalize">{row.getValue(key)}</div>
            ),
          },
        ]);
      });
    });
  };

  // Fetch table's data on component mount, and when pagination states change
  React.useEffect(() => {
    loadData();
  }, [page, pageSize, pk]);

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

  // Initialize find and replace form
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FindFormInput>();
  const onSubmit: SubmitHandler<FindFormInput> = async (data) => {
    const response = await axiosAgent.post(`dataframe/${pk}/find/`, data);
    if (response.status == 200) {
      loadData();
    }
  };

  return (
    <ScrollArea className="w-full">
      <div className="flex items-center py-4">
        <h1 className="text-4xl font-bold mr-auto">Dataframes list</h1>
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

      <Separator className="my-4" />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mb-4 flex items-center gap-2"
      >
        <Input
          placeholder="Find and replace"
          {...register("input_string")}
          required
        />
        <Button className="gap-2" type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : null}
          Find
        </Button>
        <Button
          variant="secondary"
          type="button"
          onClick={async () => {
            await axiosAgent.post(`dataframe/${pk}/undo/`);
            loadData();
          }}
        >
          <Undo2 />
        </Button>
      </form>

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
