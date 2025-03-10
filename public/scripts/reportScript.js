document.addEventListener('DOMContentLoaded', async function () {
    const reportForm = document.getElementById('reportForm');
    if (reportForm) {
        reportForm.addEventListener('submit', handleReportSubmission);
    }
    const backButton=document.getElementById('back-button');
    if(backButton){
        backButton.addEventListener("click",goBack);
    }
})

async function handleReportSubmission(event) {
    event.preventDefault();
    
    const reportType = document.getElementById("reportType").value;
    const fromDate = document.getElementById("fromDate").value;
    const toDate = document.getElementById("toDate").value;
    const reportOutput = document.getElementById("report-output");

    // Clear previous content and show loading state
    reportOutput.innerHTML = '<div class="loading">Loading...</div>';

    try {
        console.log('Sending request:', { reportType, fromDate, toDate });

        const response = await fetch('/api/reports/generateReport', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reportType, fromDate, toDate })
        });

        const data = await response.json();
        console.log('Response:', data);

        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate report');
        }

        if (!data.reportData || !Array.isArray(data.reportData)) {
            throw new Error('Invalid data format received');
        }

        if (data.reportData.length === 0) {
            reportOutput.innerHTML = '<p class="no-data">No data found for the selected period</p>';
            return;
        }

        displayTable(data.reportData, reportType);

    } catch (error) {
        console.error('Error:', error);
        reportOutput.innerHTML = `
            <div class="error">
                Error: ${error.message}
                <br>
                <small>Please try again or contact support if the problem persists.</small>
            </div>
        `;
    }
}

function displayTable(data) {
    const reportOutput = document.getElementById("report-output");
    if (!reportOutput || !data || data.length === 0) {
        reportOutput.innerHTML = '<p class="no-data">No data available for the selected period</p>';
        return;
    }

    reportOutput.innerHTML = '';
    const table = document.createElement("table");
    table.className = "report-table";

    // Define columns to show and columns to total for each report type
    const reportType = document.getElementById("reportType").value;
    const reportColumns = {
        sales: ['date', 'categoryName', 'productName', 'sku', 'quantity', 'price', 'discount', 'cost', 'profit', 'total'],
        stock: ['date', 'category_name', 'product_name', 'supplier_name', 'sku', 'price', 'cost', 'quantity', 'total'],
        commission: ['date', 'phone', 'amount', 'profit', 'service', 'company', 'discount', 'discountAmount']
    };

    // Define which columns should be totaled based on report type
    const columnsToTotal = {
        sales: ['price', 'cost', 'quantity', 'total'],
        stock: ['price', 'cost', 'quantity', 'total'],
        commission: ['amount', 'profit', 'discount']
    };

    // Filter columns based on report type
    const columnsToShow = reportColumns[reportType] || Object.keys(data[0]);

    // Initialize totals for the specified columns
    const totals = {};
    if (columnsToTotal[reportType]) {
        columnsToTotal[reportType].forEach(key => {
            totals[key] = 0; // Initialize totals to 0
        });
    }

    // Create header row
    const headerRow = table.insertRow(0);
    columnsToShow.forEach(key => {
        const th = document.createElement("th");
        th.textContent = key.toUpperCase();
        headerRow.appendChild(th);
    });

    // Create data rows and calculate totals
    data.forEach(row => {
        const tr = table.insertRow();
        columnsToShow.forEach(key => {
            const td = tr.insertCell();
            const value = row[key];

            if (key === 'date') {
                td.textContent = formatDate(value); // Format date
                td.style.textAlign = 'left';
            } else if (typeof value === 'number' || !isNaN(parseFloat(value))) {
                const numericValue = parseFloat(value) || 0; // Ensure value is a number
                td.textContent = numericValue.toFixed(2); // Display with 2 decimal places
                td.style.textAlign = 'right';

                // Add to totals if the column is in columnsToTotal
                if (columnsToTotal[reportType] && columnsToTotal[reportType].includes(key)) {
                    totals[key] += numericValue;
                }
            } else {
                td.textContent = value || ''; // Display non-numeric values as-is
            }
        });
    });

    // Add totals row if there are columns to total
    if (columnsToTotal[reportType] && columnsToTotal[reportType].length > 0) {
        const totalsRow = table.insertRow();
        totalsRow.className = 'totals-row';
        columnsToShow.forEach(key => {
            const td = totalsRow.insertCell();
            td.style.backgroundColor = '#ef8354';
            td.style.color = 'white';
            td.style.fontWeight = 'bold';

            if (key === 'date') {
                td.textContent = 'TOTAL';
                td.style.textAlign = 'left';
            } else if (columnsToTotal[reportType].includes(key)) {
                td.textContent = totals[key].toFixed(2); // Display total with 2 decimal places
                td.style.textAlign = 'right';
            } else {
                td.textContent = ''; // Leave empty for non-totaled columns
            }
        });
    }

    reportOutput.appendChild(table);
}


const posDropdownBtn = document.getElementById("pos-dropdown-btn");
const posDropdownContent = document.getElementById("pos-dropdown-content");

// Toggle dropdown on button click
posDropdownBtn.addEventListener("click", function (event) {
    event.preventDefault(); // Prevent the default link behavior
    if (posDropdownContent.style.display === "flex") {
        posDropdownContent.style.display = "none"; // Hide dropdown if already open
    } else {
        posDropdownContent.style.display = "flex"; // Show dropdown
    }
});


function formatDate(inputDate) {
    const date = new Date(inputDate);
  
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1; // Months are zero-based
    const year = date.getUTCFullYear();
  
    // Pad single-digit day and month with a leading zero
    const formattedDay = day < 10 ? `0${day}` : day;
    const formattedMonth = month < 10 ? `0${month}` : month;

    return `${formattedDay}-${formattedMonth}-${year}`;
}

function goBack() {
  window.history.back();
}

// Remove or comment out the fetchUserData function since we're not using it anymore