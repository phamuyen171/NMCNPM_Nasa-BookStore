window.addEventListener('DOMContentLoaded', () => {
  const invoice = JSON.parse(localStorage.getItem('finalInvoice'));
  const previousPoints = parseInt(localStorage.getItem('previousPoints')) || 0;

  if (!invoice) {
    alert("Không tìm thấy dữ liệu hóa đơn.");
    return;
  }

  // Gán thông tin chung
  document.getElementById('ma-hoa-don').innerText = invoice.invoiceID;
  document.getElementById('ngay-tao').innerText = invoice.createdAt;
  document.getElementById('nhan-vien').innerText = invoice.staff;
  document.getElementById('ten-khach-hang').innerText = invoice.customerName || 'Không có';
  document.getElementById('sdt-khach-hang').innerText = invoice.customerPhone || 'Không có';

  // Gán bảng sản phẩm
  const tbody = document.querySelector('#invoice-table tbody');
  tbody.innerHTML = '';
  invoice.productList.forEach((product, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${product.title}</td>
      <td>${product.price.toLocaleString()}₫</td>
      <td>${product.quantity}</td>
      <td>${product.total.toLocaleString()}₫</td>
    `;
    tbody.appendChild(row);
  });

  // Tổng số lượng và tạm tính
  document.getElementById('total-qty').innerText = invoice.totalQty;
  document.getElementById('total-price').innerText = invoice.subTotal.toLocaleString() + '₫';

  // Giảm giá (nếu có)
  if (invoice.discount > 0) {
    document.getElementById('discount-row').classList.remove('d-none');
    document.getElementById('discount-amount').innerText = invoice.discount.toLocaleString() + '₫';
  }
  document.getElementById('discount-separator').classList.remove('d-none');
  document.getElementById('final-price-row').classList.remove('d-none');
  document.getElementById('final-price').innerText = invoice.finalTotal.toLocaleString() + '₫';

  // Điểm tích lũy
  document.getElementById('earned-points').innerText = `+${invoice.earnedPoints} điểm`;
  document.getElementById('total-points').innerText = `${previousPoints + invoice.earnedPoints} điểm`;

  // Sau khi hiển thị xong, xóa localStorage nếu muốn
  localStorage.removeItem('finalInvoice');
  localStorage.removeItem('previousPoints');
});
