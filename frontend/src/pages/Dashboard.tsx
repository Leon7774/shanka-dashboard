import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    loadDashboardData,
    KPI,
    CountrySales,
    ForecastData,
    ProductPerformance,
    DashboardData,
} from "@/lib/data";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
    CartesianGrid,
} from "recharts";

console.log("Dashboard component loading...");
import {
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
import { TopProductsByCountry } from "@/components/TopProductsByCountry";
import { DomesticVsInternational } from "@/components/DomesticVsInternational";
import { AverageOrderValueChart } from "@/components/AverageOrderValueChart";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
    const [kpi, setKpi] = useState<KPI | null>(null);
    const [excludeUK, setExcludeUK] = useState(false);
    const [countrySales, setCountrySales] = useState<CountrySales[]>([]);
    const [forecastData, setForecastData] = useState<ForecastData[]>([]);
    const [performance, setPerformance] = useState<{
        topPerformers: ProductPerformance[];
        underperformers: ProductPerformance[];
    } | null>(null);

    const [dateRange, setDateRange] = useState<{
        start: string;
        end: string;
    }>({ start: "", end: "" });
    const [selectedCountry, setSelectedCountry] = useState<string>("All");
    const [availableCountries, setAvailableCountries] = useState<string[]>([]);
    const [dataset] = useState<"100k" | "600k" | "2m">(
        (import.meta.env.VITE_DEFAULT_DATASET as "100k" | "600k" | "2m") || "600k"
    );

    // Modal State
    const [statsModalOpen, setStatsModalOpen] = useState(false);
    const [statsModalView, setStatsModalView] = useState<"top" | "worst">(
        "top"
    );


    useEffect(() => {
        const logPerf = () => {
            // Using a timeout to ensure loadEventEnd is populated
            setTimeout(() => {
                const navEntry = window.performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
                if (navEntry) {
                    const ttfb = navEntry.responseStart - navEntry.requestStart;
                    const pageLoad = navEntry.loadEventEnd > 0 ? (navEntry.loadEventEnd - navEntry.startTime) : 0;

                    console.log(`📊 [Perf] TTFB: ${ttfb.toFixed(0)}ms | Load: ${pageLoad > 0 ? pageLoad.toFixed(0) + 'ms' : 'Pending'}`);
                }
            }, 0);
        };

        if (document.readyState === "complete") {
            logPerf();
        } else {
            window.addEventListener("load", logPerf);
            return () => window.removeEventListener("load", logPerf);
        }
    }, []);

    const startTime = useRef(window.performance.now());

    useEffect(() => {
        async function fetchCountries() {
            const { data, error } = await supabase.rpc("get_unique_countries");

            if (error) {
                console.error("Error fetching countries:", error);
                return;
            }

            if (data) {
                // supabase-js returns array of objects like [{ country: "Name" }]
                const countries = data.map(
                    (item: { country: string }) => item.country
                );
                // Deduplicate and sort
                const uniqueCountries = Array.from(
                    new Set(countries)
                ).sort() as string[];
                setAvailableCountries(uniqueCountries);
            }
        }
        fetchCountries();
    }, []);

    // React Query implementation
    const { data, isLoading: loading, error } = useQuery<DashboardData>({
        queryKey: ["dashboardData", dateRange, selectedCountry, dataset],
        queryFn: () =>
            loadDashboardData({
                startDate: dateRange.start ? new Date(dateRange.start) : null,
                endDate: dateRange.end ? new Date(dateRange.end) : null,
                country: selectedCountry,
                dataset,
            }),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    useEffect(() => {
        console.log("Query State:", { loading, hasData: !!data, error });
        if (error) {
            console.error("Query Error:", error);
        }
        if (data) {
            setKpi(data.kpi);
            setCountrySales(data.countrySales);
            // setProductSales(data.productSales); // Removed state
            setForecastData(data.forecastData);
            setPerformance(data.performance);
            console.log("Regional Data received:", data.regionalData);

            const timeTaken = window.performance.now() - startTime.current;
            console.log(`🚀 [Perf] TTI (Interactive): ${timeTaken.toFixed(0)}ms`);
        }
    }, [data]);

    if (loading) {
        return (
            <div className="bg-background p-8 space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-[200px]" />
                        <Skeleton className="h-4 w-[300px]" />
                    </div>
                    <Skeleton className="h-12 w-[600px] rounded-lg" />
                </div>

                {/* KPI Skeleton */}
                <div className="grid gap-4 md:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-4 w-[100px]" />
                                <Skeleton className="h-4 w-4 rounded-full" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-[120px] mb-2" />
                                <Skeleton className="h-3 w-[80px]" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Forecast & Latest Sales Skeleton */}
                <div className="grid gap-4 md:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <Skeleton className="h-6 w-[200px] mb-2" />
                            <Skeleton className="h-4 w-[300px]" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-[300px] w-full" />
                        </CardContent>
                    </Card>
                    <Card className="col-span-3">
                        <CardHeader>
                            <Skeleton className="h-6 w-[150px] mb-2" />
                            <Skeleton className="h-4 w-[250px]" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-4"
                                    >
                                        <Skeleton className="h-9 w-9 rounded-full" />
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-3 w-[60%]" />
                                        </div>
                                        <Skeleton className="h-4 w-[50px]" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom Row Skeleton */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* Sales By Country */}
                    <Card className="col-span-4">
                        <CardHeader>
                            <Skeleton className="h-6 w-[150px]" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-[350px] w-full" />
                        </CardContent>
                    </Card>

                    {/* Top Products By Country (Placeholder for conditional) */}
                    <div className="col-span-3 space-y-4">
                        <Card className="h-full">
                            <CardHeader>
                                <Skeleton className="h-6 w-[180px]" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Skeleton
                                            key={i}
                                            className="h-12 w-full"
                                        />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
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
                            {availableCountries.map((country, index) => (
                                <SelectItem
                                    key={`${country}-${index}`}
                                    value={country}
                                >
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
            <div className="grid gap-4 md:grid-cols-4">
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
                            {kpi?.salesTrend
                                ? `${kpi.salesTrend > 0 ? "+" : ""
                                }${kpi.salesTrend.toFixed(1)}% vs last month`
                                : "No trend data"}
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
                            {kpi?.ordersTrend
                                ? `${kpi.ordersTrend > 0 ? "+" : ""
                                }${kpi.ordersTrend.toFixed(1)}% vs last month`
                                : "No trend data"}
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
                            {/* Trend data unavailable */}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Avg. Order Value
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {kpi?.totalSales && kpi?.totalOrders
                                ? `$${(
                                    kpi.totalSales / kpi.totalOrders
                                ).toFixed(2)}`
                                : "$0.00"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Per transaction
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
                {selectedCountry === "All" ? (
                    <>
                        <Card className="col-span-4">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Sales by Country</CardTitle>
                                    <CardDescription>
                                        Top 10 performing regions
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="excludeUK"
                                        checked={excludeUK}
                                        onChange={(e) =>
                                            setExcludeUK(e.target.checked)
                                        }
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <label
                                        htmlFor="excludeUK"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Exclude UK
                                    </label>
                                </div>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <div className="w-full h-[350px]">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <BarChart
                                            data={countrySales.filter((c) =>
                                                excludeUK
                                                    ? c.country !==
                                                    "United Kingdom"
                                                    : true
                                            )}
                                        >
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
                                                    borderColor:
                                                        "var(--border)",
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
                        <div className="col-span-3">
                            <TopProductsByCountry />
                        </div>
                    </>
                ) : null}

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
                <Card className="col-span-2">
                    <DomesticVsInternational data={data?.regionalData ?? null} />
                </Card>
                <Card className="col-span-2">
                    <AverageOrderValueChart data={countrySales} />
                </Card>
            </div>

            <ProductPerformanceModal
                open={statsModalOpen}
                onOpenChange={setStatsModalOpen}
                initialView={statsModalView}
                countryFilter={selectedCountry}
                dateRange={dateRange}
            />
        </div>
    );
}

