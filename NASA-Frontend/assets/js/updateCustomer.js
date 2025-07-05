document.addEventListener("DOMContentLoaded", () => {
    let customer = JSON.parse(localStorage.getItem("updateCustomerData"));
    if (!customer) return;

    document.getElementById("company-name").value = customer.companyName || "";
    document.getElementById("tax-code").value = customer.taxId || "";
    document.getElementById("address").value = customer.address || "";
    document.getElementById("represent-name").value = customer.name || "";
    document.getElementById("phone").value = customer.phone || "";
    document.getElementById("discount").value = customer.discountPercentage + "%" || "";
    document.getElementById("debtLimit").value = convertMoney(customer.debtLimit) || "";

    const btnDelete = document.getElementById("btn-delete");
    const btnResetDiscount = document.getElementById("btn-reset-discount");
    const btnUpdate = document.getElementById("btn-update");

    if (customer._noteFlag === true) {
      btnDelete.style.display = "inline-block";
      btnResetDiscount.style.display = "inline-block";
    } else {
      btnDelete.style.display = "none";
      btnResetDiscount.style.display = "none";
    }
    btnUpdate.style.display = "inline-block";

    // Nút XÓA
    document.getElementById("btn-delete").addEventListener("click", async () => {
        showModalDelete(
            "XÓA KHÁCH HÀNG", 
            customer.companyName, 
            async () => {
                try{
                    const res = await fetch(`http://localhost:3000/api/customers/delete-customer/${customer._id}`, {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" }
                    });
                    const data = await res.json();
                    if (!res.ok) {
                        throw new Error(data.message);
                    } 
                    showSuccessModal(
                        'XÓA KHÁCH HÀNG SỈ',
                        `Xóa khách hàng <b>${customer.companyName}</b> thành công`,
                        [{ text: 'Xem danh sách', link: "./customer.html" }]
                    );
                } catch(error){
                    showModalError("LỖI XÓA KHÁCH HÀNG SỈ", error.message);
                }
            },
            () => showModalError("XÓA KHÁCH HÀNG SỈ", `Nhập đúng <b>${customer.companyName}</b> để xác thực.`)
        );
    });

    // Nút THU HỒI CHIẾT KHẤU
    document.getElementById("btn-reset-discount").addEventListener("click", async () => {
        
        showModalConfirm("THU HỒI CHIẾT KHẤU", `thu hồi chiết khấu cho khách hàng`, "../../",
            async() =>{
                const res = await fetch(`http://localhost:3000/api/customers/reset-discount/${customer._id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" }
                });
                const data = await res.json();
                if (res.ok) {
                    updateLocalStorage(customer, {discountPercentage: data.data.discountPercentage});
                    showSuccessModal(
                    'THU HỒI CHIẾT KHẤU KHÁCH HÀNG SỈ',
                    `Thu hồi chiết khấu khách hàng <b>${document.getElementById("company-name").value}</b> thành công`,
                    [{ text: 'Xem danh sách', link: "./customer.html" }, { text: 'Tiếp tục cập nhập', link: window.location.href}]
                    );
                } else {
                    alert("Lỗi: " + data.message);
                }
            }
        );
    });

    // Nút CẬP NHẬT THÔNG TIN
    document.getElementById("btn-update").addEventListener("click", async () => {
        const updated = {
            // companyName: document.getElementById("company-name").value,
            // taxId: document.getElementById("tax-code").value,
            address: document.getElementById("address").value,
            name: document.getElementById("represent-name").value,
            phone: document.getElementById("phone").value,
            discountPercentage: Number(document.getElementById("discount").value.replace("%", "")),
            debtLimit: parseCurrencyVND(document.getElementById("debtLimit").value)
        };

        const res = await fetch(`http://localhost:3000/api/customers/update-customer/${customer._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated)
        });

        const data = await res.json();
        if (res.ok) {
            // alert("Cập nhật thành công!");
            updateLocalStorage(customer, updated);
            showSuccessModal(
              'CẬP NHẬP KHÁCH HÀNG SỈ',
              `Cập nhập thông tin khách hàng <b>${document.getElementById("company-name").value}</b> thành công`,
              [{ text: 'Xem danh sách', link: "./customer.html" }, { text: 'Tiếp tục', link: window.location.href}]
            );
        } else {
            // alert("Cập nhật thất bại: " + data.message);
            showModalError("LỖI CẬP NHẬP KHÁCH HÀNG", data.message);
        }
    });
});

function updateLocalStorage(customer, updated){
    customer = {
        ...customer,
        address: updated.address? updated.address : customer.address,
        name: updated.name? updated.name : customer.name,
        phone: updated.phone? updated.phone : customer.phone,
        discountPercentage: updated.discountPercentage !== null? updated.discountPercentage : customer.discountPercentage,
        debtLimit: updated.debtLimit? updated.debtLimit : customer.debtLimit
    };

    localStorage.setItem('updateCustomerData', JSON.stringify(customer));

}
