const urlParams = new URLSearchParams(window.location.search);
const invoiceID = urlParams.get("invoiceID");
const statusText = urlParams.get("status"); // "CHƯA ĐẾN HẠN", "SẮP ĐẾN HẠN", "QUÁ HẠN"

let statusDebt = "";
if (statusText === "Quá hạn"){
    statusDebt = "QUÁ HẠN";
} 
else if (statusText === "Sắp đến hạn"){
    statusDebt = "SẮP ĐẾN HẠN"
}
else{
    statusDebt = "CHƯA ĐẾN HẠN"
}

console.log('Đang load chi tiết hóa đơn:', invoiceID);

async function getBillDetailMock() {
  const invoice = await getInvoice(invoiceID);
  const invoiceDetail = await getDetailedInvoice(invoice);
  let companyData;

  try {
    const response = await fetch(`http://localhost:3000/api/customers/company-info/${invoice.companyName}`);
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message);
    }
    companyData = data.data;
  } catch (error) {
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
    status: invoice.status,
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
      <td>${convertMoney(item.pricePerUnit)}</td>
      <td>${convertMoney(item.subtotal)}</td>
    `;
    tbody.appendChild(row);
  });

  // Tạm tính
  const subtotalRow = document.createElement('tr');
  subtotalRow.innerHTML = `
    <td colspan="4" class="text-end fw-bold">Tạm tính</td>
    <td class="fw-bold">${convertMoney(data.subtotal)}</td>
  `;
  tbody.appendChild(subtotalRow);

  // Chiết khấu
  const discountRow = document.createElement('tr');
  discountRow.innerHTML = `
    <td colspan="4" class="text-end fw-bold">Chiết khấu</td>
    <td class="fw-bold">${data.discountPercentage}%</td>
  `;
  tbody.appendChild(discountRow);

  // Thành tiền
  const finalPriceRow = document.createElement('tr');
  finalPriceRow.innerHTML = `
    <td colspan="4" class="text-end fw-bold">Thành tiền</td>
    <td class="fw-bold">${convertMoney(data.total)}</td>
  `;
  tbody.appendChild(finalPriceRow);

  // Hiển thị trạng thái thanh toán
  const billStatus = document.getElementById('bill-status');
  billStatus.innerHTML = `<strong>${statusDebt}</strong>`;

  const notifyBtn = document.querySelector('.btn:nth-child(1)');
  const markPaidBtn = document.querySelector('.btn:nth-child(2)');

  if (statusDebt === "QUÁ HẠN") {
    billStatus.style.color = '#ff0000';
    billStatus.style.backgroundColor = '#fdcdcd';

    // const dueDate = new Date(data.dueDate);
    // const dangerDate = new Date(dueDate.getTime() + 10 * 24 * 60 * 60 * 1000);
    // const warning = document.createElement("p");
    // warning.className = "text-center mt-3 text-danger fw-bold";
    // warning.innerText = `Khách hàng nếu không thanh toán trước ${formatDate(dangerDate)} sẽ bị chuyển thành nợ xấu.`;
    // notifyBtn.parentElement.insertAdjacentElement("afterend", warning);

  } else if (statusDebt === "SẮP ĐẾN HẠN") {
    billStatus.style.color = '#ff0000';
    billStatus.style.backgroundColor = '#fdcdcd';

    // cả hai nút vẫn tương tác được - không cần xử lý thêm

  } else if (statusDebt === "CHƯA ĐẾN HẠN") {
    billStatus.style.color = '#1a3a9c';
    billStatus.style.backgroundColor = '#c1c4f4';

    notifyBtn.style.backgroundColor = "gray";
    notifyBtn.style.color = "white";
    notifyBtn.disabled = true;
    notifyBtn.style.pointerEvents = "none";

    const note = document.createElement("p");
    note.className = "text-center mt-3 text-danger fw-bold";
    note.innerText = "Chỉ được gửi thông báo cho khách hàng khi hệ thống chuyển hóa đơn sang trạng thái SẮP ĐẾN HẠN hoặc QUÁ HẠN.";
    notifyBtn.parentElement.insertAdjacentElement("afterend", note);
  }

  //==============================Gửi thông báo====================
  document.getElementById("send-notify").addEventListener("click", async function () {
    if (invoiceID) {
        try {
          const res = await fetch("http://localhost:3000/api/invoices/send-email", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({companyName: data.companyName, invoiceID: data.invoiceID}),
          });
          const resData = await res.json();
          if (!resData.success){
            throw new Error(resData.message);
          }
          
          // Cập nhật localStorage (mô phỏng lưu trạng thái notified)
          const notified = JSON.parse(localStorage.getItem("notifiedInvoices") || "[]");
          if (!notified.includes(invoiceID)) {
              notified.push(invoiceID);
              localStorage.setItem("notifiedInvoices", JSON.stringify(notified));
          }

          // Mở modal xác nhận
          showSuccessModal(
              "THÀNH CÔNG",
              "Đã xuất tập tin PDF lưu thông tin chi tiết hóa đơn và khoản nợ.",
              [
                  {
                      text: "XEM DANH SÁCH GHI NỢ",
                      link: "./manageDebt.html"
                  }
              ]
          );
        } catch (err) {
            showModalError("LỖI GỬI THÔNG BÁO", "Không thể gửi thông báo lên hệ thống.");
        }
    }
  });

  //=============================Đánh dấu=========================  
  document.getElementById("mark-paid").addEventListener("click", function () {
    showModalConfirm(
        "CẬP NHẬP TRẠNG THÁI THANH TOÁN",
        "cập nhật trạng thái <b>“ĐÃ THANH TOÁN”</b> cho hóa đơn", "../../",
        async () => {
          // Lưu invoiceID vào localStorage
          // const paidInvoices = JSON.parse(localStorage.getItem("paidInvoices") || "[]");

          // Chuyển sang trang quản lý nợ
          // window.location.href = "./manageDebt.html";
          // fetch api đánh dấu thanh toán
          console.log(invoiceID);
          try{
            const res = await fetch(`http://localhost:3000/api/invoices/${invoiceID}/mark-as-paid`, { method: "PATCH"});
            const resData = await res.json();
            if (!resData.success){
              throw new Error(resData.message);
            }
            // if (!paidInvoices.includes(invoiceID)) {
            //   paidInvoices.push(invoiceID);
            //   localStorage.setItem("paidInvoices", JSON.stringify(paidInvoices));
            // }
            showSuccessModal(
                'CẬP NHẬP TRẠNG THÁI THANH TOÁN',
                'cập nhật trạng thái <b>“ĐÃ THANH TOÁN”</b> cho hóa đơn thành công!',
                [
                    {
                        text: 'Xem danh sách ghi nợ',
                        link: 'manageDebt.html'
                    }
                ]
            );
          } catch(error){
            showModalError("LỖI CẬP NHẬP TRẠNG THÁI THANH TOÁN", "Đã có lỗi khi cập nhập. Vui lòng thử lại sau.");
            console.error(error.message);
          }
          
        }
    );
  });
});
