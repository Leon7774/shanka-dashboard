import { useEffect, useState } from 'react';
import { fetchDataset, processData, KPI, CountrySales, ProductSales } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react';

export default function Dashboard() {
    // const [data, setData] = useState<RetailRow[]>([]);
    const [kpi, setKpi] = useState<KPI | null>(null);
    const [countrySales, setCountrySales] = useState<CountrySales[]>([]);
    const [productSales, setProductSales] = useState<ProductSales[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const rawData = await fetchDataset();
            const { kpi, countrySales, productSales } = processData(rawData);
            // setData(rawData);
            setKpi(kpi);
            setCountrySales(countrySales);
            setProductSales(productSales);
            setLoading(false);
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse">Loading Dataset...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">Overview</h1>
                    <p className="text-muted-foreground">Retail Performance Dashboard</p>
                </div>
                <div className="text-sm text-muted-foreground">
                    Last updated: {new Date().toLocaleDateString()}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {kpi?.totalSales ? `$${kpi.totalSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '$0'}
                        </div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {kpi?.totalOrders.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">+12% from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unique Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {kpi?.totalCustomers.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">+7% from last month</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Sales by Country</CardTitle>
                        <CardDescription>
                            Top 10 performing regions
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
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
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', borderRadius: '8px' }}
                                    labelStyle={{ color: 'var(--foreground)' }}
                                    itemStyle={{ color: 'var(--primary)' }}
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Sales']}
                                />
                                <Bar dataKey="sales" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Top Products</CardTitle>
                        <CardDescription>
                            Best selling items by revenue
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {productSales.slice(0, 5).map((item, i) => (
                                <div className="flex items-center" key={i}>
                                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {i + 1}
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none line-clamp-1" title={item.product}>{item.product}</p>
                                        <p className="text-sm text-muted-foreground">
                                            ${item.sales.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium">
                                        <TrendingUp className="h-4 w-4 text-green-500 inline mr-1" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
