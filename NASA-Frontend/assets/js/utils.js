async function getRule(){
    try{
        const res = await fetch("http://localhost:3000/api/rules/", {
            method: "GET"
        });
        const data = await res.json();
        if (!data.success){
            console.log("Lấy thông tin quy định thất bại.")
            return {};
        }
        const rules = data.data[0];
        return rules;
    }
    catch(error){
        console.log(error.message);
        return {};
    }
}

function toISODate(ddmmyyyy) {
  let [day, month, year] = ddmmyyyy.split('/');
  if (!day || !month || !year) {
    [day, month, year] = ddmmyyyy.split('-');
  }
  return new Date(year, month -1, day);
}

function formatDate(dateStr) {
    const date = new Date(dateStr);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng tính từ 0
    const year = String(date.getFullYear()); // Lấy 2 số cuối

    return `${day}/${month}/${year}`;
}

async function getInvoice(invoiceID){
  try{
    const res = await fetch(`http://localhost:3000/api/invoices/?keyword=${invoiceID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!data.success){
      throw new Error(data.message);
    }
    return data.data.invoices[0];
  } catch (error) {
    console.log(error);
  }
}

async function getDetailedInvoice(invoiceData){
  try{
    const res = await fetch(`http://localhost:3000/api/invoices/${invoiceData._id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!data.success){
      throw new Error(data.message);
    }
    return data.data.items;
  } catch (error) {
    console.log(error);
  }
}

function convertMoney(value){
  const formatted = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value);
  return formatted;
}

function parseCurrencyVND(str) {
  // Xóa tất cả ký tự không phải số
  return Number(str.replace(/[^\d]/g, ""));
}