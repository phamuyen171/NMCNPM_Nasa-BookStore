async function fetchRevenueSummary(from, to) {
  const res = await fetch(`http://localhost:3000/api/report/revenue-summary?from=${from}&to=${to}`);
  return await res.json();
}

async function fetchBookStats(type, from, to) {
  const res = await fetch(`http://localhost:3000/api/report/book-stats?type=${type}&from=${from}&to=${to}`);
  return await res.json();
}

async function fetchCustomerStats(type, from, to) {
  const res = await fetch(`http://localhost:3000/api/report/customer-stats?type=${type}&from=${from}&to=${to}`);
  return await res.json();
}

function renderRevenuePieChart({ immediatePayment, debtRecovery }) {
  const total = immediatePayment + debtRecovery;
  const pieCanvas = document.getElementById('revenuePieChart');
  if (!pieCanvas) return;
  const pieCtx = pieCanvas.getContext('2d');
  if (window.revenuePieChartInstance) window.revenuePieChartInstance.destroy();
  window.revenuePieChartInstance = new Chart(pieCtx, {
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
          font: { size: 12, weight: 'bold' }
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}

function renderBookChart({ labels, importCount, soldCount, filterType }) {
  const chartCanvas = document.getElementById('bookColumnChart');
  if (!chartCanvas) return;
  const chartCtx = chartCanvas.getContext('2d');
  if (window.bookChartInstance) window.bookChartInstance.destroy();
  window.bookChartInstance = new Chart(chartCtx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        { label: 'Sách Nhập Vào', data: importCount, backgroundColor: '#4caf50' },
        { label: 'Sách Bán Ra', data: soldCount, backgroundColor: '#2196f3' }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: { callbacks: { label: context => `${context.dataset.label}: ${context.raw} cuốn` } }
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Số lượng sách' } },
        x: { title: { display: true, text: filterType === 'day' ? 'Ngày' : filterType === 'month' ? 'Tháng' : 'Năm' } }
      }
    }
  });
}

function renderCustomerChart({ labels, retailCount, wholesaleCount, filterType }) {
  const canvas = document.getElementById('customerColumnChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (window.customerChartInstance) window.customerChartInstance.destroy();
  window.customerChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        { label: 'Khách lẻ', data: retailCount, backgroundColor: '#ff9800' },
        { label: 'Khách sỉ', data: wholesaleCount, backgroundColor: '#673ab7' }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: { callbacks: { label: context => `${context.dataset.label}: ${context.raw} khách` } }
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Số lượng khách' } },
        x: { title: { display: true, text: filterType === 'day' ? 'Ngày' : filterType === 'month' ? 'Tháng' : 'Năm' } }
      }
    }
  });
}

async function initRevenuePieChart() {
  const now = new Date();
  const to = now.toISOString().slice(0, 10);
  const from = new Date(now.setDate(now.getDate() - 6)).toISOString().slice(0, 10);
  const data = await fetchRevenueSummary(from, to);
  renderRevenuePieChart(data);
}

function initBookChartEvents() {
  const filterSelect = document.getElementById('filterType');
  if (!filterSelect) return;
  async function updateChart() {
    const type = filterSelect.value;
    const now = new Date();
    const to = now.toISOString().slice(0, 10);
    let from;
    if (type === 'day') from = new Date(now.setDate(now.getDate() - 6)).toISOString().slice(0, 10);
    else if (type === 'month') from = new Date(now.setMonth(now.getMonth() - 5)).toISOString().slice(0, 10);
    else if (type === 'year') from = new Date(now.setFullYear(now.getFullYear() - 4)).toISOString().slice(0, 10);
    const data = await fetchBookStats(type, from, to);
    renderBookChart({ ...data, filterType: type });
  }
  updateChart();
  filterSelect.addEventListener('change', updateChart);
}

function initCustomerChartEvents() {
  const filterSelect = document.getElementById('filterCustomerType');
  if (!filterSelect) return;
  async function updateChart() {
    const type = filterSelect.value;
    const now = new Date();
    const to = now.toISOString().slice(0, 10);
    let from;
    if (type === 'day') from = new Date(now.setDate(now.getDate() - 6)).toISOString().slice(0, 10);
    else if (type === 'month') from = new Date(now.setMonth(now.getMonth() - 5)).toISOString().slice(0, 10);
    else if (type === 'year') from = new Date(now.setFullYear(now.getFullYear() - 4)).toISOString().slice(0, 10);
    const data = await fetchCustomerStats(type, from, to);
    renderCustomerChart({ ...data, filterType: type });
  }
  updateChart();
  filterSelect.addEventListener('change', updateChart);
}

document.addEventListener('DOMContentLoaded', () => {
  initRevenuePieChart();
  initBookChartEvents();
  initCustomerChartEvents();
});