import { renderPagination } from "../../../components/js/pagination.js";

const listManageDebt = [
    {
        "invoiceID": "W0002",
        "total": 5000000,
        "date": "2025-07-04T15:50:18.496+00:00",
        "dueDate": "2025-07-20T15:50:18.496+00:00",
        "notified": "",
        "customerInfo": "TNHH Chị em rọt",
        "status": "debt"
    },
    {
        "invoiceID": "W0003",
        "total": 7000000,
        "date": "2025-07-02T15:50:18.496+00:00",
        "dueDate": "2025-07-10T15:50:18.496+00:00",
        "notified": "",
        "customerInfo": "Công ty TNHH Thương mại XYZ",
        "status": "debt"
    },
    {
        "invoiceID": "W0004",
        "total": 12000000,
        "date": "2025-06-25T15:50:18.496+00:00",
        "dueDate": "2025-07-01T15:50:18.496+00:00",
        "notified": "",
        "customerInfo": "TNHH Chị em rọt",
        "status": "debt"
    }
];

// ======================Xử lý trạng thái
function getStatusText(dueDateStr) {
  const today = new Date();
  const dueDate = new Date(dueDateStr);

  const timeDiff = dueDate - today;
  const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  if (dueDate < today) return "Quá hạn";
  if (dayDiff <= 5) return "Sắp đến hạn";
  return "Chưa đến hạn";
}

function getStatusStyle(statusText) {
  switch (statusText) {
    case "Quá hạn":
      return 'color: #ff0000; background-color: #fdcdcd; padding: 4px 8px; border-radius: 4px;';
    case "Sắp đến hạn":
      return 'color: rgb(255, 166, 0); background-color: rgb(253, 251, 205); padding: 4px 8px; border-radius: 4px;';
    case "Chưa đến hạn":
    default:
      return 'color: #1a3a9c; background-color: #c1c4f4; padding: 4px 8px; border-radius: 4px;';
  }
}

function createTable(bills) {
  if (bills.length === 0) {
    return `<p class="text-muted">Không tìm thấy hoá đơn phù hợp.</p>`;
  }

  const paidInvoices = JSON.parse(localStorage.getItem("paidInvoices") || "[]");
  const notifiedInvoices = JSON.parse(localStorage.getItem("notifiedInvoices") || "[]");

  let html = `
    <div class="table-responsive">
      <table class="table table-bordered text-center table-hover">
        <thead class="table-primary">
          <tr class="table-title">
            <th>MÃ HĐ</th>
            <th>THÀNH TIỀN</th>
            <th>NGÀY TẠO</th>
            <th>NGÀY ĐẾN HẠN</th>
            <th>KHÁCH HÀNG</th>
            <th>TÌNH TRẠNG</th>
            <th>CHI TIẾT</th>
          </tr>
        </thead>
        <tbody>
  `;

  bills.forEach(bill => {
    // Gán status = "paid" nếu invoiceID nằm trong localStorage.paidInvoices
    if (paidInvoices.includes(bill.invoiceID)) {
      bill.status = "paid";
    }

    // Ẩn bill nếu đã thanh toán
    if (bill.status === "paid") return;

    const statusText = getStatusText(bill.dueDate);
    const statusStyle = getStatusStyle(statusText);
    const hasNotified = notifiedInvoices.includes(bill.invoiceID);

    html += `
      <tr>
        <td>${bill.invoiceID}</td>
        <td>${convertMoney(bill.total)}</td>
        <td>${formatDate(bill.date)}</td>
        <td>${formatDate(bill.dueDate)}</td>
        <td>${bill.customerInfo}</td>
        <td><span style="${statusStyle}; font-weight: bold;">${statusText}</span></td>
        <td>
          ${hasNotified ? '<div class="text-muted fst-italic small">Đã gửi thông báo</div>' : ''}
          <a href="./manageDetailDebt.html?invoiceID=${bill.invoiceID}&status=${encodeURIComponent(statusText)}" style="text-decoration: underline;">Chi tiết</a>
        </td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  return html;
}



function renderTable(bills) {
  const container = document.getElementById("debts-container");
  container.innerHTML = createTable(bills);
}
function renderTableByPage(data, page) {
  currentPage = page;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedBills = data.slice(start, end);

  renderTable(paginatedBills);
  renderPagination(data.length, pageSize, currentPage, (newPage) => {
    renderTableByPage(data, newPage);
  });
}

let currentPage = 1;
const pageSize = 8;
let allBills;

document.addEventListener("DOMContentLoaded", async function () {
  try {
    // allBills = await getAllInvoices();
    allBills = listManageDebt;

    renderTableByPage(allBills, currentPage);

    // Chọn dòng
    document.addEventListener("click", function (e) {
      const row = e.target.closest("tr");
      if (!row || !row.parentElement.matches("tbody")) return;

      document.querySelectorAll("tbody tr").forEach(tr => tr.classList.remove("selected"));
      row.classList.add("selected");
    });

    // Tìm kiếm
    document.getElementById("search-bill").addEventListener("input", function () {
      const keyword = this.value.trim().toLowerCase();
      const filtered = allBills.filter(bill =>
        (bill.invoiceID && bill.invoiceID.toLowerCase().includes(keyword)) ||
        (bill.customerInfo && bill.customerInfo.toLowerCase().includes(keyword))
      );
      renderTableByPage(filtered, 1);
    });

    // Lắng nghe filter
    document.querySelectorAll('.manage-debt').forEach(link => {
      link.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelectorAll('.manage-debt').forEach(l => l.classList.remove('bill-active'));
        this.classList.add('bill-active');

        const filterType = this.getAttribute('data-filter');
        applyFilters(filterType);
      });
    });

    // Nếu có lọc ngày thì dùng thêm (nếu có input)
    const dateFilterInput = document.getElementById("filter-date");
    if (dateFilterInput) {
      dateFilterInput.addEventListener("change", () => {
        const activeFilter = document.querySelector('.manage-debt.bill-active');
        const filterType = activeFilter?.getAttribute('data-filter') || 'all';
        applyFilters(filterType);
      });
    }

  } catch (error) {
    showModalError("LỖI IN DANH SÁCH HOÁ ĐƠN", error.message);
  }
});

function applyFilters(currentFilterType) {
  let filtered = allBills;

  if (currentFilterType === 'due-soon') {
    filtered = filtered.filter(bill => {
      const status = getStatusText(bill.dueDate);
      return status === "Sắp đến hạn";
    });
  } else if (currentFilterType === 'overdue') {
    filtered = filtered.filter(bill => {
      const status = getStatusText(bill.dueDate);
      return status === "Quá hạn";
    });
  } // else 'all' => giữ nguyên

  renderTableByPage(filtered, 1);
}

