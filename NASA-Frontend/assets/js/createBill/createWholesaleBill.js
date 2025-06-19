document.addEventListener("DOMContentLoaded", () => {
  // Lấy dữ liệu từ localStorage
  const createdDate = localStorage.getItem('createdDate') || '';
  const invoiceId = localStorage.getItem('invoiceId') || '';
  const buyerName = localStorage.getItem('buyerName') || '';
  const companyName = localStorage.getItem('companyName') || '';
  const taxId = localStorage.getItem('taxId') || '';
  const address = localStorage.getItem('address') || '';
  const invoiceData = JSON.parse(localStorage.getItem('invoiceData') || '[]');
  const totalQty = localStorage.getItem('totalQty') || 0;
  const totalPrice = localStorage.getItem('totalPrice') || 0;

  // Đưa thông tin vào tiêu đề hoá đơn
  document.getElementById('so-hoa-don').innerText = invoiceId;
  document.getElementById('mau-so').innerText = '01GTKT0/001'; // Gắn mã mẫu hoá đơn nếu có
  document.querySelector('.invoice-title p.text-center').innerText = `Ngày lập: ${createdDate}`;

  // Tạo bảng sản phẩm
  const tbody = document.querySelector('#invoice-table tbody');
  tbody.innerHTML = '';
  invoiceData.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.title}</td>
      <td>${item.quantity}</td>
      <td>${Number(item.price).toLocaleString('vi-VN')}</td>
      <td>${Number(item.total).toLocaleString('vi-VN')}</td>
    `;
    tbody.appendChild(row);
  });

  // Thêm thông tin người mua hàng phía trên bảng
  const invoiceBox = document.querySelector('.invoice-box');
  const buyerInfoDiv = document.createElement('div');
  buyerInfoDiv.classList.add('ms-4', 'mb-3');
  buyerInfoDiv.innerHTML = `
    <p><strong>Họ tên người mua:</strong> ${buyerName}</p>
    <p><strong>Tên đơn vị:</strong> ${companyName}</p>
    <p><strong>Mã số thuế:</strong> ${taxId}</p>
    <p><strong>Địa chỉ:</strong> ${address}</p>
  `;
  invoiceBox.insertBefore(buyerInfoDiv, document.getElementById('invoice-table'));

  // Tạm tính
    const subtotalRow = document.createElement('tr');
    subtotalRow.innerHTML = `
    <td colspan="4" class="text-end fw-bold">Tạm tính</td>
    <td class="fw-bold">${Number(totalPrice).toLocaleString('vi-VN')}</td>
    `;

    // Chiết khấu 10%
    const discountRate = 0.1;
    const discountAmount = totalPrice * discountRate;

    const discountRow = document.createElement('tr');
    discountRow.innerHTML = `
    <td colspan="4" class="text-end fw-bold">Chiết khấu</td>
    <td class="fw-bold">10%</td>
    `;

    // Thành tiền sau chiết khấu
    const finalAmount = totalPrice - discountAmount;

    const finalPriceRow = document.createElement('tr');
    finalPriceRow.innerHTML = `
    <td colspan="4" class="text-end fw-bold">Thành tiền</td>
    <td class="fw-bold">${Number(finalAmount).toLocaleString('vi-VN')}</td>
    `;

    // Thêm các dòng này vào bảng
    tbody.appendChild(subtotalRow);
    tbody.appendChild(discountRow);
    tbody.appendChild(finalPriceRow);
});

const btnPayNow = document.querySelector('.btn-thanh-toan-ngay');
const btnDebt = document.querySelector('.btn-ghi-no');

if (btnPayNow && btnDebt) {
  btnPayNow.addEventListener('click', () => {
    localStorage.setItem('statusPay', 'Đã thanh toán');
    window.location.href = 'finalWholesaleBill.html';
  });

  btnDebt.addEventListener('click', () => {
    localStorage.setItem('statusPay', 'Ghi nợ');
    window.location.href = 'finalWholesaleBill.html';
  });
}

const statusEl = document.getElementById('status-pay');
if (statusEl) {
  const statusPay = localStorage.getItem('statusPay') || 'Chưa xác định';
  statusEl.innerText = ' ' + statusPay;

  // Reset class trước khi gán lại
  statusEl.classList.remove('text-primary', 'text-danger', 'fw-bold');

  // Font đậm và lớn
  statusEl.classList.add('fw-bold');
  statusEl.style.fontSize = '1.2rem'; // hoặc 'large'

  // Gán màu theo trạng thái
  if (statusPay === 'Đã thanh toán') {
    statusEl.style.color = '#1a3a9c';
  } else if (statusPay === 'Ghi nợ') {
    statusEl.classList.add('text-danger'); // màu đỏ
  }
}
