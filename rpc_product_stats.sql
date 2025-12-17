-- Function to get paginated product stats
CREATE OR REPLACE FUNCTION get_product_stats(
    p_page INT DEFAULT 1,
    p_page_size INT DEFAULT 10,
    p_search TEXT DEFAULT '',
    p_sort_desc BOOLEAN DEFAULT TRUE,
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_exclude_negative BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
    product TEXT,
    sales FLOAT,
    quantity FLOAT,
    price FLOAT,
    total_count BIGINT
) AS $$
DECLARE
    v_offset INT;
BEGIN
    v_offset := (p_page - 1) * p_page_size;

    RETURN QUERY
    WITH filtered_sales AS (
        SELECT
            "Description",
            "Quantity",
            "UnitPrice",
            "Quantity" * "UnitPrice" AS "TotalAmount"
        FROM sales
        WHERE
            ("Description" IS NOT NULL) AND
            (p_search IS NULL OR p_search = '' OR "Description" ILIKE '%' || p_search || '%') AND
            (p_start_date IS NULL OR "InvoiceDate" >= p_start_date) AND
            (p_end_date IS NULL OR "InvoiceDate" <= p_end_date)
    ),
    aggregated AS (
        SELECT
            "Description" as product_name,
            SUM("TotalAmount") as total_sales,
            SUM("Quantity") as total_quantity,
            AVG("UnitPrice") as avg_price
        FROM filtered_sales
        GROUP BY "Description"
    ),
    final_filtered AS (
        SELECT * FROM aggregated
        WHERE
            (NOT p_exclude_negative OR total_sales > 0)
    ),
    total_rows AS (
        SELECT COUNT(*) as cnt FROM final_filtered
    )
    SELECT
        a.product_name,
        CAST(a.total_sales AS FLOAT),
        CAST(a.total_quantity AS FLOAT),
        CAST(a.avg_price AS FLOAT),
        tr.cnt
    FROM final_filtered a
    CROSS JOIN total_rows tr
    ORDER BY
        CASE WHEN p_sort_desc THEN a.total_sales END DESC,
        CASE WHEN NOT p_sort_desc THEN a.total_sales END ASC
    LIMIT p_page_size
    OFFSET v_offset;
END;
$$ LANGUAGE plpgsql;
