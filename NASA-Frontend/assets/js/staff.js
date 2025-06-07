import { renderPagination } from "../../components/js/pagination.js";

const staffs = [
  {
    "id": "S0001",
    "name": "Thái Bảo",
    "birthdate": "1999-01-01",
    "position": "Nhân viên bán hàng",
    "email": "tbao@nasa.gmail.com",
    "phone": "08203400128",
    "cccd": "08203400128",
    "status": "Đang làm"
  },
  {
    "id": "S0002",
    "name": "Phạm Thoại",
    "birthdate": "1999-01-01",
    "position": "Nhân viên bán hàng",
    "email": "pthoai@nasa.gmail.com",
    "phone": "08203400128",
    "cccd": "08203400128",
    "status": "Đang làm"
  },
  {
    "id": "S0003",
    "name": "Phạm Ngọc Bảo Uyên",
    "birthdate": "2000-12-12",
    "position": "Nhân viên bán hàng",
    "email": "kailyuyenpham@gmail.com",
    "phone": "05402124024",
    "cccd": "05402124024",
    "status": "Đã sa thải"
  },
  {
    "id": "S0004",
    "name": "Nguyễn Văn A",
    "birthdate": "1990-05-01",
    "position": "Thủ kho",
    "email": "vana@nasa.com",
    "phone": "0912345678",
    "cccd": "123456789",
    "status": "Đang làm"
  },
  {
    "id": "S0005",
    "name": "Trần Thị B",
    "birthdate": "1985-11-11",
    "position": "Kế toán",
    "email": "tranb@nasa.com",
    "phone": "0987654321",
    "cccd": "987654321",
    "status": "Đang làm"
  },
  {
    "id": "S0006",
    "name": "Lê Văn C",
    "birthdate": "1993-08-20",
    "position": "Bảo vệ",
    "email": "levanc@nasa.com",
    "phone": "0911222333",
    "cccd": "1122334455",
    "status": "Đã sa thải"
  },
  {
    "id": "S0007",
    "name": "Hoàng Thị D",
    "birthdate": "1995-03-30",
    "position": "Nhân viên bán hàng",
    "email": "hoangd@nasa.com",
    "phone": "0909123456",
    "cccd": "5566778899",
    "status": "Đang làm"
  },
  {
    "id": "S0008",
    "name": "Hiền Vy",
    "birthdate": "1995-03-30",
    "position": "Nhân viên bán hàng",
    "email": "hvyd@nasa.com",
    "phone": "0909123456",
    "cccd": "5566778899",
    "status": "Đang làm"
  }
];

let currentPage = 1;
const pageSize = 7;

document.addEventListener("DOMContentLoaded", function () {
  let allStaffs = staffs;
  

//   fetch("/api/staff/get-staff-by-page")
//     .then(response => response.json())
//     .then(data => {
//       allStaffs = data;
//       renderTable(allStaffs);
//     })
//     .catch(err => {
//       console.error("Lỗi khi tải danh sách nhân viên:", err);
//     });
    renderTableByPage(allStaffs, currentPage);

    //sự kiện click vào các dòng
    document.addEventListener("click", function (e) {
        const row = e.target.closest("tr");
        if (!row || !row.parentElement.matches("tbody")) return;

        // Xóa class 'selected' khỏi tất cả hàng
        document.querySelectorAll("tbody tr").forEach(tr => tr.classList.remove("selected"));
        
        // Thêm class 'selected' cho hàng được click
        row.classList.add("selected");
  });

  // Lắng nghe sự kiện nhập vào ô tìm kiếm
  document.getElementById("search-staff").addEventListener("input", function () {
     const keyword = this.value.trim().toLowerCase();
     const filtered = allStaffs.filter(staff =>
      staff.id.toLowerCase().includes(keyword) ||
      staff.name.toLowerCase().includes(keyword)
    );
    renderTableByPage(filtered, currentPage);
  });

  function renderTableByPage(data, page) {
  currentPage = page;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedStaffs = data.slice(start, end);

  renderTable(paginatedStaffs);
  renderPagination(data.length, pageSize, currentPage, (newPage) => {
    renderTableByPage(data, newPage);
  });
}

  function renderTable(staffs) {
    const container = document.getElementById("staffs-container");
    container.innerHTML = createTable(staffs);
  }
  
  function createTable(staffs) {
    if (staffs.length === 0) {
      return `<p class="text-muted">Không tìm thấy nhân viên phù hợp.</p>`;
    }

    let html = `
      <div class="table-responsive">
        <table class="table table-bordered text-center table-hover">
          <thead class="table-primary">
            <tr>
              <th>MÃ NHÂN VIÊN</th>
              <th>HỌ VÀ TÊN</th>
              <th>NGÀY SINH</th>
              <th>CHỨC VỤ</th>
              <th>EMAIL</th>
              <th>SỐ ĐIỆN THOẠI</th>
              <th>CCCD</th>
              <th>MẬT KHẨU</th>
              <th>TÌNH TRẠNG</th>
            </tr>
          </thead>
          <tbody>
    `;

    staffs.forEach(staff => {
      html += `
        <tr>
          <td>${staff.id}</td>
          <td>${staff.name}</td>
          <td>${formatDate(staff.birthdate)}</td>
          <td>${staff.position}</td>
          <td>${staff.email}</td>
          <td>${staff.phone}</td>
          <td>${staff.cccd}</td>
          <td><a href="#">Reset</a></td>
          <td>
            ${staff.status === "Đã sa thải"
              ? `<span class="badge bg-danger">Đã sa thải</span>`
              : ""
            }
          </td>
        </tr>
      `;
    });

    html += `</tbody></table></div>`;
    return html;
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN");
  }
});

