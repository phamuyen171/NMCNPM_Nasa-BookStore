const urlParams = new URLSearchParams(window.location.search);
const invoiceID = urlParams.get('invoiceID');

// Gọi API theo invoiceID
console.log('Đang load chi tiết hóa đơn:', invoiceID);

async function getBillDetailMock() {
  const invoice = await getInvoice(invoiceID);
  const invoiceDetail = await getDetailedInvoice(invoice);
  let companyData;
  try{
      const response = await fetch(`http://localhost:3000/api/customers/company-info/${invoice.companyName}`);
      const data = await response.json();
      if (!data.success){
          throw new Error(data.message);
      }
      companyData = data.data;

  } catch (error){
      console.log(error.message);
  }
  return {
    companyName: invoice.companyName,
    invoiceID,
    createdBy: invoice.createdBy,
    invoiceFormNumber: invoice.invoiceFormNumber,
    date: invoice.date,
    dueDate: invoice.dueDate,
    paidAt: invoice.paidAt,
    subtotal: invoice.subtotal,
    totalDiscount: invoice.totalDiscount,
    discountPercentage: invoice.discountPercentage,
    total: invoice.total,
    status: invoice.status, // hoặc "debt"
    customerPhone: invoice.customerPhone,
    customerType: invoice.customerType,
    paymentMethod: invoice.paymentMethod,
    productList: invoiceDetail,
    buyerPhone: invoice.customerPhone,
    taxId: companyData.taxId,
    address: companyData.address
  };
}

document.addEventListener("DOMContentLoaded", async () => {
  const data = await getBillDetailMock();

  // Render số hóa đơn, ngày tạo
  document.getElementById('so-hoa-don').innerText = data.invoiceID;
  document.getElementById('mau-so').innerText = data.invoiceFormNumber;
  document.querySelector('.invoice-title p.text-center').innerText = `Ngày lập: ${formatDate(data.date)}`;

  // Thông tin người mua
  const invoiceBox = document.querySelector('.invoice-box');
  const buyerInfoDiv = document.createElement('div');
  buyerInfoDiv.classList.add('ms-4', 'mb-3');
  buyerInfoDiv.innerHTML = `
    <p><strong>SĐT người đại diện:</strong> ${data.buyerPhone}</p>
    <p><strong>Tên đơn vị:</strong> ${data.companyName}</p>
    <p><strong>Mã số thuế:</strong> ${data.taxId}</p>
    <p><strong>Địa chỉ:</strong> ${data.address}</p>
  `;
  invoiceBox.insertBefore(buyerInfoDiv, document.getElementById('invoice-table'));

  // Render sản phẩm
  const tbody = document.querySelector('#invoice-table tbody');
  tbody.innerHTML = '';
  data.productList.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.bookTitle}</td>
      <td>${item.quantity}</td>
      <td>${Number(item.pricePerUnit).toLocaleString('vi-VN')}</td>
      <td>${Number(item.subtotal).toLocaleString('vi-VN')}</td>
    `;
    tbody.appendChild(row);
  });

  // Tạm tính
  const subtotalRow = document.createElement('tr');
  subtotalRow.innerHTML = `
    <td colspan="4" class="text-end fw-bold">Tạm tính</td>
    <td class="fw-bold">${data.subtotal}</td>
  `;
  tbody.appendChild(subtotalRow);

  // Chiết khấu
  const discountRow = document.createElement('tr');
  discountRow.innerHTML = `
    <td colspan="4" class="text-end fw-bold">Chiết khấu</td>
    <td class="fw-bold">${data.discountPercentage}%</td>
  `;
  tbody.appendChild(discountRow);

  // Thành tiền sau chiết khấu
  const finalPriceRow = document.createElement('tr');
  finalPriceRow.innerHTML = `
    <td colspan="4" class="text-end fw-bold">Thành tiền</td>
    <td class="fw-bold">${data.total}</td>
  `;
  tbody.appendChild(finalPriceRow);

  // Tình trạng thanh toán
  const billStatus = document.getElementById('bill-status');
  if (data.status === 'paid') {
    billStatus.innerHTML = '<strong>Đã Thanh Toán</strong>';
    billStatus.style.color = '#1a3a9c';
    billStatus.style.backgroundColor = '#c1c4f4';
  } else if (data.status === 'debt') {
    billStatus.innerHTML = '<strong>Ghi Nợ</strong>';
    billStatus.style.color = '#ff0000';
    billStatus.style.backgroundColor = '#fdcdcd';
    billStatus.onclick = () => {
      // di chuyển tới trang quản lý ghi nợ
      window.location.href='#'
    };
  }
});