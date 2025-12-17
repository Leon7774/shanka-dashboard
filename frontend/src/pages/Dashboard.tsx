import { useEffect, useState } from "react";
import {
    loadDashboardData,
    KPI,
    CountrySales,
    ProductSales,
    ForecastData,
    ProductPerformance,
} from "@/lib/data";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    Legend,
} from "recharts";
import {
    Loader2,
    DollarSign,
    ShoppingCart,
    Users,
    TrendingUp,
    AlertTriangle,
    Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { LatestSales } from "@/components/LatestSales";
import { ProductPerformanceModal } from "@/components/ProductPerformanceModal";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
    const [kpi, setKpi] = useState<KPI | null>(null);
    const [countrySales, setCountrySales] = useState<CountrySales[]>([]);
    const [productSales, setProductSales] = useState<ProductSales[]>([]);
    const [forecastData, setForecastData] = useState<ForecastData[]>([]);
    const [performance, setPerformance] = useState<{
        topPerformers: ProductPerformance[];
        underperformers: ProductPerformance[];
    } | null>(null);
    const [loading, setLoading] = useState(true);

    const [dateRange, setDateRange] = useState<{
        start: string;
        end: string;
    }>({ start: "", end: "" });
    const [selectedCountry, setSelectedCountry] = useState<string>("All");
    const [availableCountries, setAvailableCountries] = useState<string[]>([]);

    // Modal State
    const [statsModalOpen, setStatsModalOpen] = useState(false);
    const [statsModalView, setStatsModalView] = useState<"top" | "worst">(
        "top"
    );

    useEffect(() => {
        async function fetchCountries() {
            const { data } = await supabase
                .from("sales")
                .select("Country")
                .not("Country", "is", null);

            if (data) {
                // Get unique countries
                const uniqueCountries = Array.from(
                    new Set(data.map((item) => item.Country))
                ).sort();
                setAvailableCountries(uniqueCountries);
            }
        }
        fetchCountries();
    }, []);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const data = await loadDashboardData({
                    startDate: dateRange.start
                        ? new Date(dateRange.start)
                        : null,
                    endDate: dateRange.end ? new Date(dateRange.end) : null,
                    country: selectedCountry,
                });
                setKpi(data.kpi);
                setCountrySales(data.countrySales);
                setProductSales(data.productSales);
                setForecastData(data.forecastData);
                setPerformance(data.performance);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [dateRange, selectedCountry]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse">
                        Loading Dataset...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background p-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">
                        Overview
                    </h1>
                    <p className="text-muted-foreground">
                        Retail Performance Dashboard
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2 bg-card p-2 rounded-lg border shadow-sm">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Filters:</span>
                    </div>

                    <Input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) =>
                            setDateRange((prev) => ({
                                ...prev,
                                start: e.target.value,
                            }))
                        }
                        className="w-[140px] h-8"
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) =>
                            setDateRange((prev) => ({
                                ...prev,
                                end: e.target.value,
                            }))
                        }
                        className="w-[140px] h-8"
                    />

                    <Select
                        value={selectedCountry}
                        onValueChange={setSelectedCountry}
                    >
                        <SelectTrigger className="w-[160px] h-8">
                            <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Countries</SelectItem>
                            {availableCountries.map((country) => (
                                <SelectItem key={country} value={country}>
                                    {country}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {(dateRange.start ||
                        dateRange.end ||
                        selectedCountry !== "All") && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-destructive hover:text-destructive"
                            onClick={() => {
                                setDateRange({ start: "", end: "" });
                                setSelectedCountry("All");
                            }}
                        >
                            Reset
                        </Button>
                    )}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Revenue
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {kpi?.totalSales
                                ? `$${kpi.totalSales.toLocaleString(undefined, {
                                      maximumFractionDigits: 0,
                                  })}`
                                : "$0"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Orders
                        </CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {kpi?.totalOrders.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            +12% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Unique Customers
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {kpi?.totalCustomers.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            +7% from last month
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Sales Forecast and Latest Sales */}
            <div className="grid gap-4 md:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Sales Forecasting & Trends</CardTitle>
                        <CardDescription>
                            Historical sales analysis with 3-month predictive
                            linear forecast
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={forecastData}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        opacity={0.3}
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) =>
                                            `$${value / 1000}k`
                                        }
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor:
                                                "var(--background)",
                                            borderColor: "var(--border)",
                                        }}
                                        formatter={(value: number) => [
                                            `$${Math.round(
                                                value
                                            ).toLocaleString()}`,
                                            "Sales",
                                        ]}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="actualSales"
                                        name="Historical Sales"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="forecastSales"
                                        name="Trend / Forecast"
                                        stroke="#82ca9d"
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        dot={{ r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                <div className="col-span-3">
                    <LatestSales />
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {selectedCountry === "All" && (
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Sales by Country</CardTitle>
                            <CardDescription>
                                Top 10 performing regions
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="w-full h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={countrySales}>
                                        <XAxis
                                            dataKey="country"
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            angle={-45}
                                            textAnchor="end"
                                            height={70}
                                        />
                                        <YAxis
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) =>
                                                `$${value}`
                                            }
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor:
                                                    "var(--background)",
                                                borderColor: "var(--border)",
                                                borderRadius: "8px",
                                            }}
                                            labelStyle={{
                                                color: "var(--foreground)",
                                            }}
                                            itemStyle={{
                                                color: "var(--primary)",
                                            }}
                                            formatter={(value: number) => [
                                                `$${value.toLocaleString()}`,
                                                "Sales",
                                            ]}
                                        />
                                        <Bar
                                            dataKey="sales"
                                            fill="currentColor"
                                            radius={[4, 4, 0, 0]}
                                            className="fill-primary"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card className="col-span-3 h-full">
                    <div className="flex flex-col h-full gap-4">
                        <div className="flex-1">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Top Products</CardTitle>
                                    <Button
                                        variant="link"
                                        className="h-auto p-0 text-primary"
                                        onClick={() => {
                                            setStatsModalView("top");
                                            setStatsModalOpen(true);
                                        }}
                                    >
                                        View All
                                    </Button>
                                </div>
                                <CardDescription>
                                    Best revenue drivers
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {performance?.topPerformers
                                        .slice(0, 4)
                                        .map((item, i) => (
                                            <div
                                                className="flex items-center"
                                                key={i}
                                            >
                                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {i + 1}
                                                </div>
                                                <div className="ml-4 space-y-1">
                                                    <p
                                                        className="text-sm font-medium leading-none line-clamp-1"
                                                        title={item.product}
                                                    >
                                                        {item.product}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        $
                                                        {item.sales.toLocaleString()}{" "}
                                                        <span className="text-xs opacity-70">
                                                            ({item.quantity}{" "}
                                                            sold • $
                                                            {item.price?.toFixed(
                                                                2
                                                            )}
                                                            )
                                                        </span>
                                                    </p>
                                                </div>
                                                <div className="ml-auto font-medium">
                                                    <TrendingUp className="h-4 w-4 text-green-500 inline mr-1" />
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </div>

                        <div className="flex-1 border-t pt-4">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-destructive flex items-center gap-2 dark:text-red-600">
                                        <AlertTriangle className="h-4 w-4" />
                                        Underperformers
                                    </CardTitle>
                                    <Button
                                        variant="link"
                                        className="h-auto p-0 text-destructive dark:text-red-600"
                                        onClick={() => {
                                            setStatsModalView("worst");
                                            setStatsModalOpen(true);
                                        }}
                                    >
                                        View All
                                    </Button>
                                </div>
                                <CardDescription>
                                    Action needed: Low sales volume
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {performance?.underperformers
                                        .slice(0, 3)
                                        .map((item, i) => (
                                            <div
                                                className="flex items-center"
                                                key={i}
                                            >
                                                <div className="h-8 w-8 rounded-full bg-destructive/10 dark:bg-red-700/30 flex items-center justify-center text-destructive dark:text-red-400 font-bold text-xs">
                                                    !
                                                </div>
                                                <div className="ml-4 space-y-1">
                                                    <p
                                                        className="text-sm font-medium leading-none line-clamp-1"
                                                        title={item.product}
                                                    >
                                                        {item.product}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        $
                                                        {item.sales.toLocaleString()}{" "}
                                                        | {item.quantity} sold
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </div>
                    </div>
                </Card>
            </div>

            <ProductPerformanceModal
                open={statsModalOpen}
                onOpenChange={setStatsModalOpen}
                initialView={statsModalView}
            />
        </div>
    );
}

// Helper component for CartesianGrid since it was missing in import above but used in code
import { CartesianGrid } from "recharts";
