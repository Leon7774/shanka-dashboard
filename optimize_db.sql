-- Add indices to speed up the views
CREATE INDEX IF NOT EXISTS idx_sales_country ON sales ("Country");
CREATE INDEX IF NOT EXISTS idx_sales_description ON sales ("Description");
CREATE INDEX IF NOT EXISTS idx_sales_invoicedate ON sales ("InvoiceDate");
CREATE INDEX IF NOT EXISTS idx_sales_invoice_no ON sales ("InvoiceNo");
