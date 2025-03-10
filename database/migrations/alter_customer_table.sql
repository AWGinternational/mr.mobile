
-- First, alter the customer table (note: no parentheses after table name)
ALTER TABLE customer
ADD COLUMN credit_score DECIMAL(5,2) DEFAULT 70.00,
ADD COLUMN loan_limit DECIMAL(10,2),
ADD COLUMN active_loans INT DEFAULT 0,
ADD COLUMN total_loans INT DEFAULT 0,
ADD COLUMN last_loan_date DATE,
ADD COLUMN risk_category ENUM('LOW', 'MEDIUM', 'HIGH') DEFAULT 'MEDIUM';

-- Then create the customer_loan_history table with correct reference
CREATE TABLE customer_loan_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    loan_count INT DEFAULT 0,
    total_amount_borrowed DECIMAL(10,2) DEFAULT 0,
    total_amount_paid DECIMAL(10,2) DEFAULT 0,
    average_payment_time INT,
    credit_score DECIMAL(5,2),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer(id)
);

-- Create index for better performance
CREATE INDEX idx_customer_loan_history_customer_id ON customer_loan_history(customer_id);
