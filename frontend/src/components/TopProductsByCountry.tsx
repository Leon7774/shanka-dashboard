import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Loader2, Globe } from "lucide-react";

interface RegionalProduct {
    country: string;
    product: string;
    total_sales: number;
}

export function TopProductsByCountry() {
    const { data: products, isLoading } = useQuery({
        queryKey: ["topProductsByCountry"],
        queryFn: async () => {
            const { data, error } = await supabase.rpc(
                "get_top_products_by_country"
            );
            if (error) throw error;
            return data as RegionalProduct[];
        },
    });

    return (
        <Card className="h-full">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    <CardTitle>Regional Bestsellers</CardTitle>
                </div>
                <CardDescription>
                    Top performing product in each country
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] overflow-auto pr-2">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Country</TableHead>
                                <TableHead>Top Product</TableHead>
                                <TableHead className="text-right">
                                    Sales
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        className="h-24 text-center"
                                    >
                                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : products?.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        className="text-center text-muted-foreground"
                                    >
                                        No data available
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products?.map((item, index) => (
                                    <TableRow key={`${item.country}-${index}`}>
                                        <TableCell className="font-medium">
                                            {item.country}
                                        </TableCell>
                                        <TableCell
                                            className="max-w-[200px] truncate"
                                            title={item.product}
                                        >
                                            {item.product}
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-primary">
                                            $
                                            {item.total_sales.toLocaleString(
                                                undefined,
                                                { maximumFractionDigits: 0 }
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
