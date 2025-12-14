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
