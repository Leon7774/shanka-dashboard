import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { CountrySales } from "@/lib/data";

interface Props {
    data: CountrySales[];
}

export function AverageOrderValueChart({ data }: Props) {
    // Sort by AOV descending
    const sortedData = [...data]
        .sort((a, b) => (b.aov || 0) - (a.aov || 0))
        .slice(0, 10);

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Average Order Value by Region</CardTitle>
                <CardDescription>
                    High-value transaction analysis (Top 10)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sortedData} layout="vertical">
                            <CartesianGrid
                                strokeDasharray="3 3"
                                horizontal={true}
                                vertical={false}
                                opacity={0.3}
                            />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="country"
                                type="category"
                                width={100}
                                tickLine={false}
                                axisLine={false}
                                fontSize={12}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "var(--background)",
                                    borderColor: "var(--border)",
                                    borderRadius: "8px",
                                }}
                                formatter={(value: number) => [
                                    `$${value.toFixed(2)}`,
                                    "Avg Order Value",
                                ]}
                                cursor={{ fill: "transparent" }}
                            />
                            <Bar
                                dataKey="aov"
                                fill="#8884d8"
                                radius={[0, 4, 4, 0]}
                                barSize={20}
                                className="fill-primary/80"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
