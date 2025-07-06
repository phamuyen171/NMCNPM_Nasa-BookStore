window.addEventListener('DOMContentLoaded', async () => {
  const invoice = JSON.parse(localStorage.getItem('finalInvoice'));
  const previousPoints = parseInt(localStorage.getItem('previousPoints')) || 0;

  if (!invoice) {
    // alert("Không tìm thấy dữ liệu hóa đơn.");
    showModalError("LỖI TẠO HÓA ĐƠN", "Không tìm thấy dữ liệu hóa đơn.");
    return;
  }

  // Gán thông tin chung
  document.getElementById('ma-hoa-don').innerText = invoice.invoiceID;
  document.getElementById('ngay-tao').innerText = invoice.createdAt;
  document.getElementById('nhan-vien').innerText = invoice.staffCode;
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
      <td>${convertMoney(product.price)}</td>
      <td>${product.quantity}</td>
      <td>${convertMoney(product.total)}</td>
    `;
    tbody.appendChild(row);
  });

  // Tổng số lượng và tạm tính
  document.getElementById('total-qty').innerText = invoice.totalQty;
  document.getElementById('total-price').innerText = convertMoney(invoice.subTotal);

  // Giảm giá (nếu có)
  if (invoice.discount > 0) {
    document.getElementById('discount-row').classList.remove('d-none');
    document.getElementById('discount-amount').innerText = convertMoney(invoice.discount);
  }
  document.getElementById('discount-separator').classList.remove('d-none');
  document.getElementById('final-price-row').classList.remove('d-none');
  document.getElementById('final-price').innerText = convertMoney(invoice.finalTotal);

  // Điểm tích lũy
  if (invoice.isCustomer) {
    document.getElementById('earned-points').innerText = `+${invoice.earnedPoints} điểm`;
    document.getElementById('total-points').innerText = `${previousPoints + invoice.earnedPoints - invoice.usedPoints} điểm`;
  } else {
    document.getElementById('diem-tich-luy').style.display = "none";
    document.getElementById('tong-tich-luy').style.display = "none";
  }

  const fetch_data_invoice = {
    "invoiceID": invoice.invoiceID,
    "date": new Date(),
    "paidAt": new Date(),
    "subtotal": invoice.subTotal,
    "totalDiscount": invoice.discount,
    "total": invoice.finalTotal,
    "status": "paid",
    "customerPhone": invoice.customerPhone,
    "customerType": "retail",
    "points": invoice.earnedPoints,
    "pointsUsed": invoice.usedPoints,
    "paymentMethod": "cash",
    "createdBy": invoice.staffCode,
    "productList": invoice.productList,
    "isDeleted": false
  }

  if (invoice.isCreatingNewCustomer) {
    const newCustomer = {
      "phone": invoice.customerPhone,
      "name": invoice.customerName,
      "type": 'retail',
      "idCard": '123456789',
      "companyName": '',
      "taxId": '',
      "address": '',
      "discountPercentage": ''
    };
    try {
      const res = await fetch("http://localhost:3000/api/customers/add", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify(newCustomer)
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message);
      }
    } catch (error) {
      showModalError("LỖI THÊM KHÁCH HÀNG MỚI", error.message);
      return;
    }
  }

  try {
    const res = await fetch("http://localhost:3000/api/invoices/", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify(fetch_data_invoice)
    });
    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message);
    }

    document.getElementById('success').classList.remove('d-none');
    document.getElementById('success').classList.add('d-flex');
  } catch (error) {
    showModalError("LỖI TẠO HÓA ĐƠN BÁN LẺ", error.message);
  }

  // Sau khi hiển thị xong, xóa localStorage nếu muốn
  localStorage.removeItem('finalInvoice');
  localStorage.removeItem('previousPoints');
});
