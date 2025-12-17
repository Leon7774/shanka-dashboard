-- Function to get all dashboard stats with dynamic filtering
-- SECURITY DEFINER: Runs with privileges of the creator (skipping RLS checks)
CREATE OR REPLACE FUNCTION get_dashboard_stats(
    filter_start_date timestamp with time zone DEFAULT NULL,
    filter_end_date timestamp with time zone DEFAULT NULL,
    filter_country text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
    
    -- Variables for sub-results
    kpi_data json;
    country_data json;
    product_top_data json;
    product_bottom_data json;
    forecast_data json;
BEGIN
    
    -- 1. KPI Calculation
    SELECT json_build_object(
        'totalSales', COALESCE(SUM("Quantity" * "UnitPrice"), 0),
        'totalOrders', COUNT(DISTINCT "InvoiceNo"),
        'totalCustomers', COUNT(DISTINCT "CustomerID")
    ) INTO kpi_data
    FROM sales
    WHERE 
        ("InvoiceDate" >= filter_start_date OR filter_start_date IS NULL)
        AND ("InvoiceDate" <= filter_end_date OR filter_end_date IS NULL)
        AND ("Country" = filter_country OR filter_country IS NULL);

    -- 2. Sales by Country (Top 10)
    SELECT json_agg(t) INTO country_data
    FROM (
        SELECT "Country" as country, SUM("Quantity" * "UnitPrice") as sales
        FROM sales
        WHERE 
            ("InvoiceDate" >= filter_start_date OR filter_start_date IS NULL)
            AND ("InvoiceDate" <= filter_end_date OR filter_end_date IS NULL)
             -- Note: If filter_country is set, this will just return 1 row, which is correct behavior
            AND ("Country" = filter_country OR filter_country IS NULL)
        GROUP BY "Country"
        ORDER BY sales DESC
        LIMIT 10
    ) t;

    -- 3. Top Products (Top 5)
    SELECT json_agg(t) INTO product_top_data
    FROM (
        SELECT "Description" as product, SUM("Quantity" * "UnitPrice") as sales, SUM("Quantity") as quantity, AVG("UnitPrice") as price
        FROM sales
        WHERE 
            ("InvoiceDate" >= filter_start_date OR filter_start_date IS NULL)
            AND ("InvoiceDate" <= filter_end_date OR filter_end_date IS NULL)
            AND ("Country" = filter_country OR filter_country IS NULL)
        GROUP BY "Description"
        ORDER BY sales DESC
        LIMIT 5
    ) t;

    -- 4. Bottom Products (Top 5 Underperformers)
    SELECT json_agg(t) INTO product_bottom_data
    FROM (
        SELECT "Description" as product, SUM("Quantity" * "UnitPrice") as sales, SUM("Quantity") as quantity, AVG("UnitPrice") as price
        FROM sales
        WHERE 
            ("InvoiceDate" >= filter_start_date OR filter_start_date IS NULL)
            AND ("InvoiceDate" <= filter_end_date OR filter_end_date IS NULL)
            AND ("Country" = filter_country OR filter_country IS NULL)
        GROUP BY "Description"
        HAVING SUM("Quantity" * "UnitPrice") > 0 -- Exclude pure zeroes if needed, or keep them
        ORDER BY sales ASC
        LIMIT 5
    ) t;

    -- 5. Monthly/Daily Sales for Forecast
    SELECT json_agg(t) INTO forecast_data
    FROM (
        SELECT 
            DATE_TRUNC('month', "InvoiceDate") as month, 
            SUM("Quantity" * "UnitPrice") as monthly_revenue,
            COUNT(DISTINCT "InvoiceNo") as order_count
        FROM sales
        WHERE 
            ("InvoiceDate" >= filter_start_date OR filter_start_date IS NULL)
            AND ("InvoiceDate" <= filter_end_date OR filter_end_date IS NULL)
            AND ("Country" = filter_country OR filter_country IS NULL)
        GROUP BY 1
        ORDER BY 1 ASC
    ) t;

    -- Combine Result
    result := json_build_object(
        'kpi', kpi_data,
        'countrySales', COALESCE(country_data, '[]'::json),
        'performance', json_build_object(
            'topPerformers', COALESCE(product_top_data, '[]'::json),
            'underperformers', COALESCE(product_bottom_data, '[]'::json)
        ),
        'forecastData', COALESCE(forecast_data, '[]'::json)
    );

    RETURN result;
END;
$$;
