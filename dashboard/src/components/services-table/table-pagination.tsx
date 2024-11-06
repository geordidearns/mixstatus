import {
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronsLeftIcon,
	ChevronsRightIcon,
} from "lucide-react";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";

interface DataTablePaginationProps<TData> {
	table: Table<TData>;
}

export function TablePagination<TData>({
	table,
}: DataTablePaginationProps<TData>) {
	return (
		<div className="flex items-center justify-between px-2">
			<div className="flex-1 text-xs text-gray-500">
				{(() => {
					const selectedCount = table.getFilteredSelectedRowModel().rows.length;
					const totalCount = table.getFilteredRowModel().rows.length;
					if (selectedCount === 0) return <span>No services selected</span>;
					if (selectedCount === totalCount)
						return (
							<span>
								<span className="font-medium text-black">All</span> services selected
							</span>
						);
					if (selectedCount === 1)
						return (
							<span>
								<span className="font-medium text-black">1</span> service selected
							</span>
						);
					return (
						<span>
							<span className="font-medium text-black">{selectedCount}</span> services
							selected
						</span>
					);
				})()}
			</div>
			<div className="flex items-center space-x-6 lg:space-x-8">
				<div className="text-xs text-gray-500">
					Showing{" "}
					<span className="font-medium text-black">
						{table.getState().pagination.pageIndex *
							table.getState().pagination.pageSize +
							1}
					</span>
					-
					<span className="font-medium text-black">
						{Math.min(
							(table.getState().pagination.pageIndex + 1) *
								table.getState().pagination.pageSize,
							table.getFilteredRowModel().rows.length
						)}
					</span>{" "}
					of{" "}
					<span className="font-medium text-black">
						{table.getFilteredRowModel().rows.length}
					</span>
				</div>
				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						className="hidden h-6 w-6 p-0 lg:flex"
						onClick={() => table.setPageIndex(0)}
						disabled={!table.getCanPreviousPage()}
					>
						<span className="sr-only">Go to first page</span>
						<ChevronsLeftIcon className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						className="h-6 w-6 p-0"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						<span className="sr-only">Go to previous page</span>
						<ChevronLeftIcon className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						className="h-6 w-6 p-0"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						<span className="sr-only">Go to next page</span>
						<ChevronRightIcon className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						className="hidden h-6 w-6 p-0 lg:flex"
						onClick={() => table.setPageIndex(table.getPageCount() - 1)}
						disabled={!table.getCanNextPage()}
					>
						<span className="sr-only">Go to last page</span>
						<ChevronsRightIcon className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
