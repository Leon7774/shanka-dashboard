import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

// Define a local interface for the raw DB row structure
interface SalesRow {
    Id: number;
    InvoiceNo: string;
    StockCode: string;
    Description: string;
    Quantity: number;
    InvoiceDate: string; // Supabase returns ISO string
    UnitPrice: number;
    Country: string;
    CustomerID: number;
}

const PAGE_SIZE = 50;

export default function DataTable() {
    const [page, setPage] = useState(1);

    const { data, isLoading, error, isPlaceholderData } = useQuery({
        queryKey: ["salesTable", page],
        queryFn: async () => {
            const from = (page - 1) * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            const { data, error, count } = await supabase
                .from("sales")
                .select("*", { count: "exact" })
                .range(from, to)
                .order("Id", { ascending: true }); // Ensure stable ordering

            if (error) throw error;

            return {
                rows: data as SalesRow[],
                count: count || 0,
            };
        },
        placeholderData: (previousData) => previousData, // Maintain data while fetching next page
    });

    const rows = data?.rows || [];
    const totalCount = data?.count || 0;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    if (error) {
        return (
            <div className="p-8 text-destructive">
                Error loading data: {(error as Error).message}
            </div>
        );
    }

    return (
        <div className="bg-background p-8 space-y-8">
            <div>
                <h1 className="text-4xl font-bold tracking-tight text-foreground">
                    Data Viewer
                </h1>
                <p className="text-muted-foreground">
                    Raw sales transaction data
                </p>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Sales Transactions</CardTitle>
                        <CardDescription>
                            Showing {rows.length} rows per page
                        </CardDescription>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Total Records: {totalCount.toLocaleString()}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice No</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Country</TableHead>
                                    <TableHead className="text-right">
                                        Qty
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Price
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Total
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="h-24 text-center"
                                        >
                                            <div className="flex justify-center items-center gap-2 text-muted-foreground">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Loading...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : rows.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="h-24 text-center"
                                        >
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    rows.map((row) => (
                                        <TableRow key={row.Id}>
                                            <TableCell className="font-medium">
                                                {row.InvoiceNo}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(
                                                    row.InvoiceDate
                                                ).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell
                                                className="max-w-[300px] truncate"
                                                title={row.Description}
                                            >
                                                {row.Description}
                                            </TableCell>
                                            <TableCell>{row.Country}</TableCell>
                                            <TableCell className="text-right">
                                                {row.Quantity}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                ${row.UnitPrice.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                $
                                                {(
                                                    row.Quantity * row.UnitPrice
                                                ).toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-between space-x-2 py-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Page</span>
                            <Input
                                type="number"
                                min={1}
                                max={totalPages}
                                value={page}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (
                                        !isNaN(val) &&
                                        val >= 1 &&
                                        val <= totalPages
                                    ) {
                                        setPage(val);
                                    }
                                }}
                                className="w-16 h-8 text-center px-1"
                            />
                            <span>of {totalPages || 1}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setPage((old) => Math.max(old - 1, 1))
                                }
                                disabled={page === 1 || isLoading}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    if (
                                        !isPlaceholderData &&
                                        page < totalPages
                                    ) {
                                        setPage((old) => old + 1);
                                    }
                                }}
                                disabled={
                                    isPlaceholderData ||
                                    page >= totalPages ||
                                    isLoading
                                }
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
