import { renderPagination } from "../../../components/js/pagination.js";

async function getAllInvoices() {
  try {
    const res = await fetch("http://localhost:3000/api/invoices/", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message);
    }
    return data.data.invoices;
  } catch (error) {
    console.log(error);
  }
}

let listSales = [];

let currentPage = 1;
const pageSize = 5;

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const allBills = await getAllInvoices();
    allBills.forEach(bill => {
      listSales.push({
        _id: bill.invoiceID,
        total: bill.total,
        createdAt: bill.createdAt,
        prevStatus: bill.status,
        nowStatus: bill.paidAt ? "paid" : ""
      });
    });
    // Sắp xếp mặc định: ngày mới nhất trước
    listSales.sort((a, b) => a._id > b._id);

    renderTableByPage(listSales, currentPage);

    // Lọc khi thay đổi ngày
    document.getElementById("from-date").addEventListener("change", handleFilter);
    document.getElementById("to-date").addEventListener("change", handleFilter);

    // Tìm kiếm theo từ khóa
    document.getElementById("search-sale").addEventListener("input", handleFilter);

    // Highlight dòng được chọn
    document.addEventListener("click", function (e) {
      const row = e.target.closest("tr");
      if (!row || !row.parentElement.matches("tbody")) return;

      document.querySelectorAll("tbody tr").forEach(tr => tr.classList.remove("selected"));
      row.classList.add("selected");
    });

  } catch (error) {
    // showModalError("LỖI IN DANH SÁCH HOÁ ĐƠN", error.message);
    console.error(error.message);
  }
});

// Hàm lọc tổng hợp theo từ khóa và ngày
function handleFilter() {
  const keyword = document.getElementById("search-sale").value.trim().toLowerCase();
  const fromDate = document.getElementById("from-date").value;
  const toDate = document.getElementById("to-date").value;

  let filtered = [...listSales];

  // Lọc theo từ khóa
  if (keyword) {
    filtered = filtered.filter(item =>
      item._id.toLowerCase().includes(keyword) ||
      item.createdAt.toLowerCase().includes(keyword)
    );
  }

  // Lọc theo ngày nếu có
  filtered = filtered.filter(item => {
    const created = new Date(item.createdAt);
    let fromOK = true;
    let toOK = true;

    if (fromDate) {
      const from = new Date(fromDate);
      fromOK = created >= from;
    }

    if (toDate) {
      const to = new Date(toDate);
      to.setDate(to.getDate() + 1); // bao gồm cả ngày đến
      toOK = created < to;
    }

    return fromOK && toOK;
  });

  renderTableByPage(filtered, 1);
}

// Tạo bảng HTML từ dữ liệu
function createTable(data) {
  if (data.length === 0) {
    return `<p class="text-muted text-center mt-3">Không tìm thấy sách nào.</p>`;
  }

  let html = `
    <div class="table-responsive">
      <table class="table table-bordered text-center table-hover">
        <thead class="table-primary">
          <tr>
            <th>HOÁ ĐƠN</th>
            <th>THÀNH TIỀN</th>
            <th>NGÀY TẠO</th>
            <th>GHI CHÚ</th>
          </tr>
        </thead>
        <tbody>
  `;

  data.forEach(item => {
    let note = "";
    if (item.prevStatus === "debt") {
      if (item.nowStatus === "") {
        // note = "Ghi nợ";
        note = "<td style='color:red;'><b>Ghi nợ</b></td>"
      } else if (item.nowStatus === "paid") {
        // note = "Thu hồi ghi nợ";
        note = "<td style='color:#F4631E;'><b>Thu hồi ghi nợ</b></td>"
      }
    } else {
      // note = "Đã thanh toán";
      note = "<td style='color:green;'><b>Đã thanh toán</b></td>"
    }

    html += `
      <tr>
        <td>${item._id}</td>
        <td>${convertMoney(item.total)}</td>
        <td>${formatDate(item.createdAt)}</td>
        ${note}
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

// Render bảng vào giao diện
function renderTable(data) {
  const container = document.getElementById("sales-container");
  if (!container) {
    console.error("Không tìm thấy phần tử #sales-container");
    return;
  }
  container.innerHTML = createTable(data);
}

// Render bảng theo trang
function renderTableByPage(data, page) {
  currentPage = page;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedData = data.slice(start, end);

  renderTable(paginatedData);
  renderPagination(data.length, pageSize, currentPage, (newPage) => {
    renderTableByPage(data, newPage);
  });
}
