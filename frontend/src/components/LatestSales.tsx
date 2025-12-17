import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface Sale {
    id: number;
    description: string;
    amount: number;
    timestamp: string;
    country: string;
}

export function LatestSales() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch initial data
        async function fetchInitialSales() {
            try {
                const { data, error } = await supabase
                    .from("sales")
                    .select(
                        '"Description", "Quantity", "UnitPrice", "InvoiceDate", "Country", "Id"'
                    )
                    .order('"InvoiceDate"', { ascending: false })
                    .limit(5);

                if (error) throw error;

                const formattedSales = data.map((item) => ({
                    id: item.Id,
                    description: item.Description,
                    amount: item.Quantity * item.UnitPrice,
                    timestamp: item.InvoiceDate,
                    country: item.Country,
                }));

                setSales(formattedSales);
            } catch (error) {
                console.error("Error fetching sales:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchInitialSales();

        // Subscribe to real-time changes
        const subscription = supabase
            .channel("sales-realtime")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "sales" },
                (payload) => {
                    const newSale = payload.new;
                    setSales((prev) => {
                        const formattedNewSale = {
                            id: newSale.Id, // Assuming 'id' exists
                            description: newSale.Description,
                            amount: newSale.Quantity * newSale.UnitPrice,
                            timestamp: newSale.InvoiceDate,
                            country: newSale.Country,
                        };
                        return [formattedNewSale, ...prev].slice(0, 5);
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Latest Sales</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Latest Sales</CardTitle>
                <CardDescription>
                    Real-time feed of latest orders
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {sales.map((sale, i) => (
                        <div
                            key={`${sale.id}-${i}`}
                            className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                        >
                            <div className="space-y-1">
                                <p
                                    className="text-sm font-medium leading-none line-clamp-1"
                                    title={sale.description}
                                >
                                    {sale.description}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {sale.country} •{" "}
                                    {new Date(
                                        sale.timestamp
                                    ).toLocaleDateString()}{" "}
                                    •{" "}
                                    {new Date(
                                        sale.timestamp
                                    ).toLocaleTimeString()}
                                </p>
                            </div>
                            <div className="font-medium">
                                +${sale.amount.toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
