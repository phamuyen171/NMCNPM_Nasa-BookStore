import { renderPagination } from "../../../components/js/pagination.js";

async function getAllInvoices(){
  try{
    const res = await fetch("http://localhost:3000/api/invoices/", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!data.success){
      throw new Error(data.message);
    }
    return data.data.invoices;
  } catch (error) {
    console.log(error);
  }
}

function createTable(bills) {
  if (bills.length === 0) {
    return `<p class="text-muted">Không tìm thấy hoá đơn phù hợp.</p>`;
  }

  let html = `
    <div class="table-responsive">
      <table class="table table-bordered text-center table-hover">
        <thead class="table-primary">
          <tr class="table-title">
            <th>MÃ HĐ</th>
            <th>LOẠI HĐ</th>
            <th>THÀNH TIỀN</th>
            <th>NGÀY TẠO</th>
            <th>NHÂN VIÊN TẠO</th>
            <th>KHÁCH HÀNG</th>
            <th>TÌNH TRẠNG</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
  `;

  bills.forEach(bill => {
    const typeText = bill.customerType === 'retail' ? 'Bán lẻ' : 'Bán sỉ';
    const statusText = bill.status === 'paid' ? 'Đã thanh toán' : 'Ghi nợ';
    const detailPage = bill.customerType === 'retail' ? 'detailRetailBill.html' : 'detailWholesaleBill.html';

    // Style cho trạng thái
    let statusStyle = '';
    if (bill.status === 'paid' && bill.customerType === 'wholesale') {
      statusStyle = 'color: #1a3a9c; background-color: #c1c4f4; padding: 4px 8px; border-radius: 4px;';
    } else if (bill.status === 'debt') {
      statusStyle = 'color: #ff0000; background-color: #fdcdcd; padding: 4px 8px; border-radius: 4px;';
    }else{
        statusStyle = 'display: none;';
    }

    html += `
      <tr>
        <td>${bill.invoiceID}</td>
        <td>${typeText}</td>
        <td>${convertMoney(bill.total)}</td>
        <td>${formatDate(bill.date)}</td>
        <td>${bill.createdBy}</td>
        <td>${bill.customerInfo}</td>
        <td><span style="${statusStyle}; font-weight: bold;">${statusText}</span></td>
        <td><a href="./${detailPage}?invoiceID=${bill.invoiceID}" style="text-decoration: underline;">Xem</a></td>
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
  const container = document.getElementById("bills-container");
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
  try{
    allBills = await getAllInvoices();
    allBills.forEach(bill => {
      bill.customerInfo = bill.customerType === "retail"
        ? bill.customerPhone || "Không"
        : bill.companyName;
    });

    renderTableByPage(allBills, currentPage);

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
    document.getElementById("search-bill").addEventListener("input", function () {
      const keyword = this.value.trim().toLowerCase();
      const filtered = allBills.filter(bill =>
        bill.invoiceID.toLowerCase().includes(keyword) ||
        bill.createdBy.toLowerCase().includes(keyword) ||
        bill.customerInfo.toLowerCase().includes(keyword)
      );
      renderTableByPage(filtered, currentPage);
    });
  }
  catch (error){
    showModalError("LỖI IN DANH SÁCH HOÁ ĐƠN", error.message)
  }
});

document.querySelectorAll('.retail-bill').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();

    // Xoá class bill-active ở tất cả link
    document.querySelectorAll('.retail-bill').forEach(l => l.classList.remove('bill-active'));

    // Thêm class cho link được bấm
    this.classList.add('bill-active');

    // Lấy loại filter
    const filterType = this.getAttribute('data-filter');

    applyFilters(filterType);

    
    document.getElementById("filter-date").addEventListener("change", () => {
      applyFilters();
    });
  });
});

function applyFilters(currentFilterType) {
  let filtered = allBills;

  // Filter theo loại
  if (currentFilterType === 'retail') {
    filtered = filtered.filter(b => b.customerType === 'retail');
  } else if (currentFilterType === 'wholesale') {
    filtered = filtered.filter(b => b.customerType === 'wholesale');
  } else if (currentFilterType === 'paid') {
    filtered = filtered.filter(b => b.customerType === 'wholesale' && b.status === 'paid');
  } else if (currentFilterType === 'debt') {
    filtered = filtered.filter(b => b.customerType === 'wholesale' && b.status === 'debt');
  }

  // Filter theo ngày nếu có chọn
  const selectedDate = document.getElementById("filter-date").value;
  if (selectedDate && currentFilterType !== "all") {
    filtered = filtered.filter(bill => bill.date.split("T")[0] === selectedDate);
  }

  renderTableByPage(filtered, 1);
}

