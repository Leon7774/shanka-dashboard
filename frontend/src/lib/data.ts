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
    month: string; // timestamp with time zone
    monthly_revenue: number;
    order_count: number;
}

const API_URL =
    "https://4jzzibjtu1.execute-api.ap-southeast-2.amazonaws.com/shanka/fetch/sales";

async function fetchFromLambda(viewName: string) {
    try {
        const response = await fetch(`${API_URL}?view=${viewName}`);
        if (!response.ok) {
            console.error(
                `Error fetching view ${viewName}:`,
                response.statusText
            );
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching view ${viewName}:`, error);
        return null;
    }
}

export async function fetchKPI(): Promise<KPI | null> {
    const data = await fetchFromLambda("kpi");
    if (!data) return null;

    return {
        totalSales: data.total_revenue,
        totalOrders: data.total_orders,
        totalCustomers: data.unique_customers,
    };
}

export async function fetchCountrySales(): Promise<CountrySales[]> {
    const data = await fetchFromLambda("country");
    if (!data) return [];

    return (data || []).map((row: any) => ({
        country: row.Country,
        sales: row.total_revenue,
    }));
}

export async function fetchProductPerformance() {
    // For top products
    // Note: Lambda 'products' view is sorted by sales DESC, so this is Top Products
    const topData = await fetchFromLambda("products");

    // In Lambda v1 we only have one product view sort.
    // To get underperformers efficiently we might need another view sort or just reverse client side if dataset small.
    // The current lambda 'products' returns ALL products ordered by revenue desc.
    // We can slice top 5 and bottom 5 here.
    // Or update Lambda to accept sort param.
    // Assuming 'products' returns enough data (e.g. top 50 or all).
    // Reviewing lambda code: it selects * from view and orders DESC. No limit.
    // So we invoke it once and slice.

    const allProducts = topData || [];
    const topPerformers = allProducts.slice(0, 5);
    const underperformers = [...allProducts].reverse().slice(0, 5);

    // Map existing view columns to ProductPerformance interface
    const mapToPerformance = (row: any): ProductPerformance => ({
        product: row.Description,
        sales: row.total_revenue,
        quantity: row.units_sold,
        price: row.units_sold ? row.total_revenue / row.units_sold : 0,
    });

    return {
        topPerformers: topPerformers.map(mapToPerformance),
        underperformers: underperformers.map(mapToPerformance),
        allProducts: [],
    };
}

export async function fetchSalesForecast(): Promise<ForecastData[]> {
    const data = await fetchFromLambda("forecast");
    if (!data) return [];

    const monthlyData: ViewMonthlySales[] = data || [];

    // Transform timestamp to index for regression
    const points = monthlyData.map((d, i) => ({
        index: i,
        sales: d.monthly_revenue,
        originalDate: d.month,
    }));

    // Calculate Trend Line (Linear Regression)
    const n = points.length;
    if (n === 0) return [];

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

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Generate Data: History + Forecast
    const result: ForecastData[] = [];

    // Historical
    points.forEach((item, i) => {
        result.push({
            date: new Date(item.originalDate).toLocaleDateString(undefined, {
                month: "short",
                year: "numeric",
            }),
            actualSales: item.sales,
            forecastSales: Math.max(0, slope * item.index + intercept),
        });
    });

    // Future Forecast (next 3 periods)
    const lastIndex = points[points.length - 1].index;
    for (let i = 1; i <= 3; i++) {
        const forecastVal = slope * (lastIndex + i) + intercept;
        result.push({
            date: `Forecast ${i}`,
            forecastSales: Math.max(0, forecastVal),
        });
    }

    return result;
}

export async function loadDashboardData() {
    // Run parallely
    const [kpi, countrySales, performance, forecastData] = await Promise.all([
        fetchKPI(),
        fetchCountrySales(),
        fetchProductPerformance(),
        fetchSalesForecast(),
    ]);

    // Construct ProductSales array for the "Top Products" chart from performance top performers
    const productSales: ProductSales[] = performance.topPerformers.map((p) => ({
        product: p.product,
        sales: p.sales,
    }));

    return {
        kpi,
        countrySales,
        productSales,
        performance,
        forecastData,
    };
}
