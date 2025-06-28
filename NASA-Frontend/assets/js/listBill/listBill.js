import { renderPagination } from "../../../components/js/pagination.js";

const bills = [
    {
        invoiceID: '00001',
        customerType: 'retail',
        total: 78.41,
        date: '2025-06-19T14:11:10.638+00:00',
        createdBy: 'S0001',
        customerInfo: '0834567239',
        status: 'paid'
    },
    {
        invoiceID: '00002',
        customerType: 'wholesale',
        total: 1190.74,
        date: '2025-03-14T14:11:10.638+00:00',
        createdBy: 'S0002',
        customerInfo: 'Đại lý Soul Books',
        status: 'debt'
    },
    {
        invoiceID: '00003',
        customerType: 'wholesale',
        total: 2968.32,
        date: '2025-01-31T14:11:10.638+00:00',
        createdBy: 'S0003',
        customerInfo: 'Trường ĐH Khoa học tự nhiên',
        status: 'paid'
    }
];

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
    const typeText = bill.customerType === 'retail' ? 'Bán lẻ' : 'CTGT';
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
        <td>${bill.total}</td>
        <td>${new Date(bill.date).toLocaleDateString('vi-VN')}</td>
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

document.addEventListener("DOMContentLoaded", async function () {
  try{
    let allBills = bills;

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
    showModalError("LỖI IN DANH SÁCH NHÂN VIÊN", error.message)
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
    let filteredBills = [];

    if (filterType === 'all') {
      filteredBills = bills;
    } else if (filterType === 'retail') {
      filteredBills = bills.filter(bill => bill.customerType === 'retail');
    } else if (filterType === 'wholesale') {
      filteredBills = bills.filter(bill => bill.customerType === 'wholesale');
    } else if (filterType === 'paid') {
      filteredBills = bills.filter(bill => bill.customerType === 'wholesale' && bill.status === 'paid');
    } else if (filterType === 'debt') {
      filteredBills = bills.filter(bill => bill.customerType === 'wholesale' && bill.status === 'debt');
    }

    // Reset về trang 1
    renderTableByPage(filteredBills, 1);
  });
});

