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
}

export interface CountrySales {
    country: string;
    sales: number;
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

export async function loadDashboardData(filters: DashboardFilters = {}) {
    try {
        const params = new URLSearchParams();
        if (filters.startDate)
            params.append("startDate", formatDate(filters.startDate));
        if (filters.endDate)
            params.append("endDate", formatDate(filters.endDate));
        if (filters.country && filters.country !== "All")
            params.append("country", filters.country);

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
        const kpi: KPI = {
            totalSales: data.kpi?.totalSales || 0,
            totalOrders: data.kpi?.totalOrders || 0,
            totalCustomers: data.kpi?.totalCustomers || 0,
        };

        // 2. Country Sales
        const countrySales: CountrySales[] = (data.countrySales || []).map(
            (row: any) => ({
                country: row.country,
                sales: row.sales,
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
            points.forEach((item, i) => {
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

        return {
            kpi,
            countrySales,
            productSales,
            performance: { topPerformers, underperformers },
            forecastData,
        };
    } catch (error) {
        console.error("Load Data Error:", error);
        throw error;
    }
}
