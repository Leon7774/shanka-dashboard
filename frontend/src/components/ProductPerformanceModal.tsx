import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ChevronLeft,
    ChevronRight,
    Search,
    TrendingUp,
    TrendingDown,
    Loader2,
} from "lucide-react";

interface ProductStats {
    product: string;
    sales: number;
    quantity: number;
    price: number;
    total_count: number;
}

interface ProductPerformanceModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialView?: "top" | "worst";
}

export function ProductPerformanceModal({
    open,
    onOpenChange,
    initialView = "top",
}: ProductPerformanceModalProps) {
    const [view, setView] = useState<"top" | "worst">(initialView);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [data, setData] = useState<ProductStats[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [excludeNegative, setExcludeNegative] = useState(false);

    const pageSize = 10;

    useEffect(() => {
        if (open) {
            setView(initialView);
            setPage(1);
            setSearch(""); // Optional: reset search on open
            setExcludeNegative(false); // Reset filter
        }
    }, [open, initialView]);

    useEffect(() => {
        async function fetchData() {
            if (!open) return;

            setLoading(true);
            try {
                const { data: result, error } = await supabase.rpc(
                    "get_product_stats",
                    {
                        p_page: page,
                        p_page_size: pageSize,
                        p_search: search,
                        p_sort_desc: view === "top",
                        p_exclude_negative: excludeNegative,
                    }
                );

                if (error) throw error;

                if (result) {
                    setData(result);
                    if (result.length > 0) {
                        setTotalCount(result[0].total_count);
                    } else {
                        setTotalCount(0);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch product stats:", err);
            } finally {
                setLoading(false);
            }
        }

        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchData();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [open, page, search, view, excludeNegative]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        {view === "top" ? (
                            <TrendingUp className="h-6 w-6 text-green-500" />
                        ) : (
                            <TrendingDown className="h-6 w-6 text-red-500" />
                        )}
                        Product Performance Analysis
                    </DialogTitle>
                    <DialogDescription>
                        Detailed breakdown of product sales performance
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center justify-between gap-4 py-4">
                    <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
                        <Button
                            variant={view === "top" ? "secondary" : "ghost"}
                            className={
                                view === "top"
                                    ? "bg-background shadow-sm"
                                    : "text-muted-foreground"
                            }
                            onClick={() => {
                                setView("top");
                                setPage(1);
                            }}
                            size="sm"
                        >
                            Best Sellers
                        </Button>
                        <Button
                            variant={view === "worst" ? "secondary" : "ghost"}
                            className={
                                view === "worst"
                                    ? "bg-background shadow-sm"
                                    : "text-muted-foreground"
                            }
                            onClick={() => {
                                setView("worst");
                                setPage(1);
                            }}
                            size="sm"
                        >
                            Underperformers
                        </Button>
                    </div>

                    <div className="flex items-center gap-4">
                        {view === "worst" && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="excludeNegative"
                                    checked={excludeNegative}
                                    onChange={(e) => {
                                        setExcludeNegative(e.target.checked);
                                        setPage(1);
                                    }}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label
                                    htmlFor="excludeNegative"
                                    className="text-sm text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Exclude negative revenue
                                </label>
                            </div>
                        )}
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="pl-8"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-auto border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Rank</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead className="text-right">
                                    Revenue
                                </TableHead>
                                <TableHead className="text-right">
                                    Quantity
                                </TableHead>
                                <TableHead className="text-right">
                                    Avg Price
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="h-24 text-center"
                                    >
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        No products found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((item, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="font-medium">
                                            {(page - 1) * pageSize + i + 1}
                                        </TableCell>
                                        <TableCell
                                            className="max-w-[300px] truncate"
                                            title={item.product}
                                        >
                                            {item.product}
                                        </TableCell>
                                        <TableCell className="text-right font-bold">
                                            $
                                            {item.sales.toLocaleString(
                                                undefined,
                                                { minimumFractionDigits: 2 }
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {item.quantity.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">
                                            ${item.price.toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-between pt-4 border-t mt-auto">
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
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1 || loading}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={page >= totalPages || loading}
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
