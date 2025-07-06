// ========================Hàm xử lý biểu đồ=============================
function generateDateLabels(filterType) {
  const labels = [];
  const now = new Date();
  if (filterType === "day") {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      labels.push(d.toISOString().slice(0, 10));
    }
  } else if (filterType === "month") {
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
  } else if (filterType === "year") {
    const years = new Set();
    invoices.forEach(i => years.add(new Date(i.date).getFullYear()));
    importOrders.forEach(i => years.add(new Date(i.createdAt).getFullYear()));
    labels.push(...Array.from(years).sort());
  }
  return labels;
}

function formatDateByFilter(date, filterType) {
  if (filterType === "day") return date.toISOString().slice(0, 10);
  if (filterType === "month") return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  if (filterType === "year") return `${date.getFullYear()}`;
}

function countBooksPerTime({ filterType, invoices, invoiceDetails, importOrders }) {
  const labels = generateDateLabels(filterType);
  const soldCount = new Array(labels.length).fill(0);
  const importCount = new Array(labels.length).fill(0);
  const invoiceDateMap = {};

  invoices.forEach(i => {
    invoiceDateMap[i._id] = new Date(i.date);
  });

  invoiceDetails.forEach(detail => {
    const invoiceDate = invoiceDateMap[detail.invoice];
    if (!invoiceDate) return;
    const key = formatDateByFilter(invoiceDate, filterType);
    const idx = labels.indexOf(key);
    if (idx !== -1) soldCount[idx] += detail.quantity;
  });

  importOrders.forEach(order => {
    if (order.status !== "confirmed") return;
    const createdAt = new Date(order.createdAt);
    const key = formatDateByFilter(createdAt, filterType);
    const idx = labels.indexOf(key);
    if (idx !== -1) {
      order.items.forEach(item => {
        importCount[idx] += item.quantity;
      });
    }
  });

  return { labels, soldCount, importCount };
}

// =============================Biểu đồ tròn===============================
const listRevenue = [
    { invoiceID: "W0001", date: "2025-07-05T11:50:11.798+00:00", paidAt: "2025-07-05T11:50:11.798+00:00", total: 183746 },
    { invoiceID: "R0001", date: "2025-07-05T11:50:11.798+00:00", paidAt: "2025-07-05T11:50:11.798+00:00", total: 1945 },
    { invoiceID: "R0002", date: "2025-07-05T11:50:11.798+00:00", paidAt: "2025-07-05T11:50:11.798+00:00", total: 9865 },
    { invoiceID: "W0003", date: "2025-07-01T11:50:11.798+00:00", paidAt: "2025-07-03T11:50:11.798+00:00", total: 12312 },
    { invoiceID: "W0004", date: "2025-07-05T11:50:11.798+00:00", paidAt: "2025-07-06T11:50:11.798+00:00", total: 143526 },
];

function renderRevenuePieChart(listRevenue) {
  let immediatePayment = 0;
  let debtRecovery = 0;

  listRevenue.forEach(item => {
    if (item.date === item.paidAt) immediatePayment += item.total;
    else debtRecovery += item.total;
  });

  const total = immediatePayment + debtRecovery;
  const pieCanvas = document.getElementById('revenuePieChart');
  if (!pieCanvas) return;

  const pieCtx = pieCanvas.getContext('2d');
  new Chart(pieCtx, {
    type: 'pie',
    data: {
      labels: ['Thanh toán ngay', 'Thu hồi nợ'],
      datasets: [{
        data: [immediatePayment, debtRecovery],
        backgroundColor: ['#0f47af', '#4f7fde'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.raw;
              const percent = ((value / total) * 100).toFixed(1);
              return `${context.label}: ${value.toLocaleString('vi-VN')} VNĐ (${percent}%)`;
            }
          }
        },
        datalabels: {
          color: '#fff',
          align: 'center',
          anchor: 'center',
          formatter: (value) => {
            const percent = ((value / total) * 100).toFixed(1);
            return `${value.toLocaleString('vi-VN')} VNĐ\n(${percent}%)`;
          },
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}

// =============================Biểu đồ sách=======================================
const invoices = [
    { _id: "R0001", date: "2025-07-01T10:00:00Z" },
    { _id: "W0001", date: "2025-07-02T11:00:00Z" },
    { _id: "W0002", date: "2025-07-03T12:00:00Z" },
];

const invoiceDetails = [
    { invoice: "R0001", bookTitle: "Book A", quantity: 2 },
    { invoice: "R0001", bookTitle: "Book B", quantity: 1 },
    { invoice: "W0001", bookTitle: "Book A", quantity: 100 },
    { invoice: "W0001", bookTitle: "Book B", quantity: 200 },
    { invoice: "W0002", bookTitle: "Book C", quantity: 150 },
];

const importOrders = [
    {
      createdAt: "2025-07-01T08:00:00Z",
      status: "confirmed",
      items: [
        { bookId: "b01", quantity: 100 },
        { bookId: "b02", quantity: 50 }
      ]
    },
    {
      createdAt: "2025-07-02T09:00:00Z",
      status: "confirmed",
      items: [
        { bookId: "b03", quantity: 70 }
      ]
    }
];

function renderBookChart(filterType) {
  const { labels, soldCount, importCount } = countBooksPerTime({
    filterType,
    invoices,
    invoiceDetails,
    importOrders
  });

  const chartCanvas = document.getElementById('bookColumnChart');
  if (!chartCanvas) return;

  const chartCtx = chartCanvas.getContext('2d');
  if (window.bookChartInstance) window.bookChartInstance.destroy();

  window.bookChartInstance = new Chart(chartCtx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Sách Nhập Vào',
          data: importCount,
          backgroundColor: '#4caf50'
        },
        {
          label: 'Sách Bán Ra',
          data: soldCount,
          backgroundColor: '#2196f3'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: context => `${context.dataset.label}: ${context.raw} cuốn`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Số lượng sách'
          }
        },
        x: {
          title: {
            display: true,
            text: filterType === 'day' ? 'Ngày' : filterType === 'month' ? 'Tháng' : 'Năm'
          }
        }
      }
    }
  });
}

function initBookChartEvents() {
  const filterSelect = document.getElementById('filterType');
  if (!filterSelect) return;
  renderBookChart(filterSelect.value);
  filterSelect.addEventListener('change', () => {
    renderBookChart(filterSelect.value);
  });
}

// =====================Biểu đồ khách hàng==============================
const customers = [
  { _id: "c001", type: "retail", createdAt: "2025-02-20T00:00:00.000Z" },
  { _id: "c002", type: "wholesale", createdAt: "2025-02-20T00:00:00.000Z" },
  { _id: "c003", type: "retail", createdAt: "2025-04-05T00:00:00.000Z" },
  { _id: "c004", type: "wholesale", createdAt: "2025-04-05T00:00:00.000Z" },
  { _id: "c005", type: "retail", createdAt: "2025-07-03T00:00:00.000Z" },
  { _id: "c006", type: "wholesale", createdAt: "2025-07-03T00:00:00.000Z" },
  { _id: "c007", type: "retail", createdAt: "2025-07-02T00:00:00.000Z" }
];

function countCustomersPerTime(customers, filterType) {
  const labels = generateDateLabels(filterType);
  const retailCount = new Array(labels.length).fill(0);
  const wholesaleCount = new Array(labels.length).fill(0);

  customers.forEach(cust => {
    const date = new Date(cust.createdAt);
    const key = formatDateByFilter(date, filterType);
    const idx = labels.indexOf(key);
    if (idx !== -1) {
      if (cust.type === "retail") retailCount[idx]++;
      else if (cust.type === "wholesale") wholesaleCount[idx]++;
    }
  });

  return { labels, retailCount, wholesaleCount };
}

function renderCustomerChart(filterType) {
  const { labels, retailCount, wholesaleCount } = countCustomersPerTime(customers, filterType);

  const canvas = document.getElementById('customerColumnChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (window.customerChartInstance) window.customerChartInstance.destroy();

  window.customerChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Khách lẻ',
          data: retailCount,
          backgroundColor: '#ff9800'
        },
        {
          label: 'Khách sỉ',
          data: wholesaleCount,
          backgroundColor: '#673ab7'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: context => `${context.dataset.label}: ${context.raw} khách`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Số lượng khách' }
        },
        x: {
          title: {
            display: true,
            text: filterType === 'day' ? 'Ngày' : filterType === 'month' ? 'Tháng' : 'Năm'
          }
        }
      }
    }
  });
}

function initCustomerChartEvents() {
  const filterSelect = document.getElementById('filterCustomerType');
  if (!filterSelect) return;
  renderCustomerChart(filterSelect.value);
  filterSelect.addEventListener('change', () => {
    renderCustomerChart(filterSelect.value);
  });
}

// =======================DOM CONTENTLOADED===================
document.addEventListener('DOMContentLoaded', () => {
  renderRevenuePieChart(listRevenue);
  initBookChartEvents();
  initCustomerChartEvents();
});


