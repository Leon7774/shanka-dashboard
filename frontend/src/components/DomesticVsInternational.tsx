import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from "recharts";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { RegionalDistribution } from "@/lib/data";

const COLORS = ["hsl(var(--primary))", "#f5d442"];

interface Props {
    data: RegionalDistribution | null;
}

export function DomesticVsInternational({ data }: Props) {
    console.log("DomesticVsInternational received data:", data);
    if (!data) return null;

    const chartData = [
        { name: "Domestic (UK)", value: data.domestic },
        { name: "International", value: data.international },
    ];

    const total = chartData.reduce((acc, item) => acc + item.value, 0);

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Market Distribution</CardTitle>
                <CardDescription>
                    Domestic vs International Revenue
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                label={({
                                    cx,
                                    cy,
                                    midAngle = 0,
                                    outerRadius,
                                    percent = 0,
                                }) => {
                                    const RADIAN = Math.PI / 180;
                                    const radius = outerRadius + 20;
                                    const x =
                                        cx +
                                        radius * Math.cos(-midAngle * RADIAN);
                                    const y =
                                        cy +
                                        radius * Math.sin(-midAngle * RADIAN);

                                    return (
                                        <text
                                            x={x}
                                            y={y}
                                            fill="hsl(var(--foreground))"
                                            textAnchor={
                                                x > cx ? "start" : "end"
                                            }
                                            dominantBaseline="central"
                                            className="text-xs font-medium"
                                        >
                                            {`${(percent * 100).toFixed(0)}%`}
                                        </text>
                                    );
                                }}
                            >
                                {chartData.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "var(--background)",
                                    borderColor: "var(--border)",
                                    borderRadius: "8px",
                                }}
                                formatter={(value: number) => {
                                    const percent =
                                        total > 0
                                            ? ((value / total) * 100).toFixed(1)
                                            : "0.0";
                                    return [
                                        `$${value.toLocaleString()} (${percent}%)`,
                                        "Revenue",
                                    ];
                                }}
                            />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
