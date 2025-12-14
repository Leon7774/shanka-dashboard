import * as XLSX from 'xlsx';

export interface RetailRow {
    InvoiceNo: string | number;
    StockCode: string | number;
    Description: string;
    Quantity: number;
    InvoiceDate: number; // Excel date serial or string
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

export async function fetchDataset(): Promise<RetailRow[]> {
    try {
        const response = await fetch('/dataset/Online%20Retail.xlsx');
        if (!response.ok) {
            throw new Error(`Failed to fetch dataset: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Parse to JSON
        const data: RetailRow[] = XLSX.utils.sheet_to_json(sheet);
        return data;
    } catch (error) {
        console.error("Error loading dataset:", error);
        return [];
    }
}

export function processData(data: RetailRow[]) {
    let totalSales = 0;
    const uniqueInvoices = new Set();
    const uniqueCustomers = new Set();
    const salesByCountry: Record<string, number> = {};
    const salesByProduct: Record<string, number> = {};

    data.forEach((row) => {
        // Basic validation
        if (!row.Quantity || !row.UnitPrice) return;

        const saleAmount = row.Quantity * row.UnitPrice;
        totalSales += saleAmount;
        uniqueInvoices.add(row.InvoiceNo);
        if (row.CustomerID) uniqueCustomers.add(row.CustomerID);

        // Country Aggregation
        if (row.Country) {
            salesByCountry[row.Country] = (salesByCountry[row.Country] || 0) + saleAmount;
        }

        // Product Aggregation
        if (row.Description) {
            salesByProduct[row.Description] = (salesByProduct[row.Description] || 0) + saleAmount;
        }
    });

    const countrySales: CountrySales[] = Object.entries(salesByCountry)
        .map(([country, sales]) => ({ country, sales }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 10); // Top 10

    const productSales: ProductSales[] = Object.entries(salesByProduct)
        .map(([product, sales]) => ({ product, sales }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 10); // Top 10

    const kpi: KPI = {
        totalSales,
        totalOrders: uniqueInvoices.size,
        totalCustomers: uniqueCustomers.size,
    };

    return { kpi, countrySales, productSales };
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

export function calculateForecast(data: RetailRow[]): ForecastData[] {
    // 1. Group by Month (using approximate indexing)
    // Helper to convert Excel serial date to JS Date (approximate)
    // Excel base date: Dec 30 1899. 
    // But often in JS passed as string or number. If number < 200000 it's likely serial.

    const buckets: { [key: number]: number } = {};
    let minDate = Infinity;
    let maxDate = -Infinity;

    data.forEach(row => {
        if (typeof row.InvoiceDate === 'number') {
            // Approximate month grouping: roughly 30 days
            const monthIndex = Math.floor(row.InvoiceDate / 30);
            buckets[monthIndex] = (buckets[monthIndex] || 0) + (row.Quantity * row.UnitPrice);
            if (row.InvoiceDate < minDate) minDate = row.InvoiceDate;
            if (row.InvoiceDate > maxDate) maxDate = row.InvoiceDate;
        }
    });

    const xValues: number[] = [];
    const yValues: number[] = [];
    const monthlyData: { index: number; sales: number }[] = [];

    Object.entries(buckets).forEach(([indexStr, sales]) => {
        const index = parseInt(indexStr);
        xValues.push(index);
        yValues.push(sales);
        monthlyData.push({ index, sales });
    });

    monthlyData.sort((a, b) => a.index - b.index);

    // Linear Regression
    const n = monthlyData.length;
    if (n === 0) return [];

    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = monthlyData.reduce((acc, curr) => acc + (curr.index * curr.sales), 0);
    const sumXX = xValues.reduce((acc, curr) => acc + (curr * curr), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Generate Data: History + Forecast
    const result: ForecastData[] = [];

    // Historical
    monthlyData.forEach(item => {
        result.push({
            date: `Month ${result.length + 1}`,
            actualSales: item.sales,
            forecastSales: Math.max(0, slope * item.index + intercept) // Trend line on history
        });
    });

    // Future Forecast (next 3 periods)
    const lastIndex = monthlyData[monthlyData.length - 1].index;
    for (let i = 1; i <= 3; i++) {
        const forecastVal = slope * (lastIndex + i) + intercept;
        result.push({
            date: `Forecast ${i}`,
            forecastSales: Math.max(0, forecastVal)
        });
    }

    return result;
}

export function getProductPerformance(data: RetailRow[]) {
    const productStats: Record<string, ProductPerformance> = {};

    data.forEach(row => {
        if (!row.Description) return;
        if (!productStats[row.Description]) {
            productStats[row.Description] = {
                product: row.Description,
                sales: 0,
                quantity: 0,
                price: row.UnitPrice // Assuming relatively constant or taking last
            };
        }
        productStats[row.Description].sales += row.Quantity * row.UnitPrice;
        productStats[row.Description].quantity += row.Quantity;
    });

    const products = Object.values(productStats);
    products.sort((a, b) => b.sales - a.sales);

    const underperformers = products.slice(-5); // Bottom 5
    const topPerformers = products.slice(0, 5);

    return { topPerformers, underperformers, allProducts: products };
}
