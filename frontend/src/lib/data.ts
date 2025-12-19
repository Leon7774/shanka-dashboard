import { redis } from './redis';
export interface RetailRow {
    Id: number;
    InvoiceNo: string | number;
    StockCode: string | number;
    Description: string;
    Quantity: number;
    InvoiceDate: number;
    UnitPrice: number;
    CustomerID: number;
    Country: string;
}

export interface KPI {
    totalSales: number;
    totalOrders: number;
    totalCustomers: number;
    salesTrend?: number;
    ordersTrend?: number;
}

export interface CountrySales {
    country: string;
    sales: number;
    aov?: number;
    order_count?: number;
}

export interface ProductSales {
    product: string;
    sales: number;
}

export interface ForecastData {
    date: string;
    actualSales?: number;
    forecastSales?: number;
}

export interface ProductPerformance {
    product: string;
    sales: number;
    quantity: number;
    price: number;
}

export interface RegionalDistribution {
    domestic: number;
    international: number;
}

interface ViewMonthlySales {
    month: string;
    monthly_revenue: number;
    order_count: number;
}

const API_URL =
    "https://4jzzibjtu1.execute-api.ap-southeast-2.amazonaws.com/shanka/fetch/sales";

interface DashboardFilters {
    startDate?: Date | null;
    endDate?: Date | null;
    country?: string | null;
}

// Helper to format Date to YYYY-MM-DD for API
function formatDate(date: Date) {
    return date.toISOString().split("T")[0];
}


export interface DashboardData {
    kpi: KPI;
    countrySales: CountrySales[];
    productSales: ProductSales[];
    performance: {
        topPerformers: ProductPerformance[];
        underperformers: ProductPerformance[];
    };
    forecastData: ForecastData[];
    regionalData: RegionalDistribution;
}

export async function loadDashboardData(filters: DashboardFilters = {}): Promise<DashboardData> {
    try {
        const startTime = performance.now();
        const params = new URLSearchParams();
        if (filters.startDate)
            params.append("startDate", formatDate(filters.startDate));
        if (filters.endDate)
            params.append("endDate", formatDate(filters.endDate));
        if (filters.country && filters.country !== "All")
            params.append("country", filters.country);

        // Cache Key Strategy:
        // Include all filter parameters to ensure unique cache per view
        const cacheKey = `dashboard:data:${JSON.stringify(filters)}`;

        // 1. Try Cache
        try {
            const cached = await redis.get<DashboardData>(cacheKey);
            if (cached) {
                const duration = performance.now() - startTime;
                console.log(`Serving from Redis Cache ⚡️ (took ${duration.toFixed(2)}ms)`);
                return cached;
            }
        } catch (err) {
            console.warn("Redis Cache Error (continuing to fetch):", err);
        }

        const response = await fetch(`${API_URL}?${params.toString()}`);

        console.log("Response:", response);

        if (!response.ok) {
            console.error(
                "Error fetching dashboard data:",
                response.statusText
            );
            throw new Error("Failed to fetch data");
        }

        const data = await response.json();

        // 1. KPI
        // Calculate trends from forecast data (monthly history)
        const monthlyHistory: ViewMonthlySales[] = data.forecastData || [];
        let salesTrend = 0;
        let ordersTrend = 0;

        if (monthlyHistory.length >= 2) {
            const current = monthlyHistory[monthlyHistory.length - 1];
            const previous = monthlyHistory[monthlyHistory.length - 2];

            if (previous.monthly_revenue > 0) {
                salesTrend =
                    ((current.monthly_revenue - previous.monthly_revenue) /
                        previous.monthly_revenue) *
                    100;
            }
            if (previous.order_count > 0) {
                ordersTrend =
                    ((current.order_count - previous.order_count) /
                        previous.order_count) *
                    100;
            }
        }

        const kpi: KPI = {
            totalSales: data.kpi?.totalSales || 0,
            totalOrders: data.kpi?.totalOrders || 0,
            totalCustomers: data.kpi?.totalCustomers || 0,
            salesTrend,
            ordersTrend,
        };

        // 2. Country Sales
        const countrySales: CountrySales[] = (data.countrySales || []).map(
            (row: any) => ({
                country: row.country,
                sales: row.sales,
                aov: row.aov || 0,
                order_count: row.order_count || 0,
            })
        );

        // 3. Performance
        const topPerformers: ProductPerformance[] = (
            data.performance?.topPerformers || []
        ).map((p: any) => ({
            product: p.product,
            sales: p.sales,
            quantity: p.quantity,
            price: p.price,
        }));

        const underperformers: ProductPerformance[] = (
            data.performance?.underperformers || []
        ).map((p: any) => ({
            product: p.product,
            sales: p.sales,
            quantity: p.quantity,
            price: p.price,
        }));

        // 4. Forecast Logic (Client-side regression on Server-side buckets)
        const monthlyData: ViewMonthlySales[] = data.forecastData || [];
        const points = monthlyData.map((d, i) => ({
            index: i,
            sales: d.monthly_revenue,
            originalDate: d.month,
        }));

        let forecastData: ForecastData[] = [];

        if (points.length > 0) {
            const n = points.length;
            const sumX = points.reduce((a, b) => a + b.index, 0);
            const sumY = points.reduce((a, b) => a + b.sales, 0);
            const sumXY = points.reduce(
                (acc, curr) => acc + curr.index * curr.sales,
                0
            );
            const sumXX = points.reduce(
                (acc, curr) => acc + curr.index * curr.index,
                0
            );

            let slope = 0;
            let intercept = 0;

            if (n > 1) {
                slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
                intercept = (sumY - slope * sumX) / n;
            } else {
                intercept = sumY / n; // Simple average or fallback
            }

            // Historical
            points.forEach((item) => {
                forecastData.push({
                    date: new Date(item.originalDate).toLocaleDateString(
                        undefined,
                        { month: "short", year: "numeric" }
                    ),
                    actualSales: item.sales,
                    forecastSales: Math.max(0, slope * item.index + intercept),
                });
            });

            // Future Forecast (next 3 periods)
            const lastIndex = points[points.length - 1].index;
            for (let i = 1; i <= 3; i++) {
                const forecastVal = slope * (lastIndex + i) + intercept;
                forecastData.push({
                    date: `Forecast ${i}`,
                    forecastSales: Math.max(0, forecastVal),
                });
            }
        }

        // Construct ProductSales array for the "Top Products" chart
        const productSales: ProductSales[] = topPerformers.map((p) => ({
            product: p.product,
            sales: p.sales,
        }));

        // 5. Regional Data Strategy
        // Try to get direct data, otherwise calculate from available metrics (Fallback)
        let regionalData: RegionalDistribution = data.regionalData;

        if (
            !regionalData ||
            (regionalData.domestic === 0 && regionalData.international === 0)
        ) {
            console.warn(
                "Regional data missing from RPC, calculating from KPI fallback..."
            );
            const ukSales =
                countrySales.find((c) => c.country === "United Kingdom")
                    ?.sales || 0;
            const totalSales = kpi.totalSales;

            regionalData = {
                domestic: ukSales,
                international: Math.max(0, totalSales - ukSales),
            };
        }

        const finalResult: DashboardData = {
            kpi,
            countrySales,
            productSales,
            performance: { topPerformers, underperformers },
            forecastData,
            regionalData,
        };

        // 2. Set Cache (Fire and forget, or await)
        try {
            // Cache for 5 minutes (300 seconds)
            await redis.set(cacheKey, finalResult, { ex: 300 });
        } catch (cacheErr) {
            console.warn("Failed to set Redis cache:", cacheErr);
        }

        const duration = performance.now() - startTime;
        console.log(`Data fetch completed in ${duration.toFixed(2)}ms`);

        return finalResult;

    } catch (error) {
        console.error("Load Data Error:", error);
        throw error;
    }
}

