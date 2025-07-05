import { renderPagination } from "../../../components/js/pagination.js";

// Dữ liệu mẫu
const listImportBooks = [
  {
    "_id": "1a2b3c",
    "title": "Giáo Trình Toán Cao Cấp",
    "publisher": "NXB Giáo Dục Việt Nam",
    "createdAt": "2025-06-11T13:56:28.522+00:00",
    "priceImport": 22.24,
    "quantityImport": 10,
    "total": 222.40
  },
  {
    "_id": "4d5e6f",
    "title": "Lập Trình Python Cơ Bản",
    "publisher": "NXB Trẻ",
    "createdAt": "2025-06-20T09:15:12.104+00:00",
    "priceImport": 18.50,
    "quantityImport": 5,
    "total": 92.50
  },
  {
    "_id": "7g8h9i",
    "title": "Kỹ Thuật Số và Ứng Dụng",
    "publisher": "NXB Khoa Học & Kỹ Thuật",
    "createdAt": "2025-07-01T17:42:05.711+00:00",
    "priceImport": 35.75,
    "quantityImport": 3,
    "total": 107.25
  }
];

let currentPage = 1;
const pageSize = 5;

document.addEventListener("DOMContentLoaded", () => {
  try {
    // Sắp xếp mặc định: ngày mới nhất trước
    listImportBooks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    renderTableByPage(listImportBooks, currentPage);

    // Lọc khi thay đổi ngày
    document.getElementById("from-date").addEventListener("change", handleFilter);
    document.getElementById("to-date").addEventListener("change", handleFilter);

    // Tìm kiếm theo từ khóa
    document.getElementById("search-import").addEventListener("input", handleFilter);

    // Highlight dòng được chọn
    document.addEventListener("click", function (e) {
      const row = e.target.closest("tr");
      if (!row || !row.parentElement.matches("tbody")) return;

      document.querySelectorAll("tbody tr").forEach(tr => tr.classList.remove("selected"));
      row.classList.add("selected");
    });

  } catch (error) {
    showModalError("LỖI IN DANH SÁCH NHẬP SÁCH", error.message);
  }
});

// Hàm lọc tổng hợp theo từ khóa và ngày
function handleFilter() {
  const keyword = document.getElementById("search-import").value.trim().toLowerCase();
  const fromDate = document.getElementById("from-date").value;
  const toDate = document.getElementById("to-date").value;

  let filtered = [...listImportBooks];

  // Lọc theo từ khóa
  if (keyword) {
    filtered = filtered.filter(item =>
      item.title.toLowerCase().includes(keyword) ||
      item.publisher.toLowerCase().includes(keyword) ||
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
            <th>TÊN SÁCH</th>
            <th>NHÀ XUẤT BẢN</th>
            <th>NGÀY NHẬP</th>
            <th>ĐƠN GIÁ NHẬP</th>
            <th>SỐ LƯỢNG NHẬP</th>
            <th>THÀNH TIỀN</th>
          </tr>
        </thead>
        <tbody>
  `;

  data.forEach(item => {
    html += `
      <tr>
        <td>${item.title}</td>
        <td>${item.publisher}</td>
        <td>${new Date(item.createdAt).toLocaleDateString('vi-VN')}</td>
        <td>${item.priceImport.toFixed(2)}</td>
        <td>${item.quantityImport}</td>
        <td>${item.total.toFixed(2)}</td>
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
  const container = document.getElementById("importBooks-container");
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
