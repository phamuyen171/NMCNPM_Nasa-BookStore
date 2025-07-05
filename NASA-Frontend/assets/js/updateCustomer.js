document.addEventListener("DOMContentLoaded", () => {
    const customer = JSON.parse(localStorage.getItem("updateCustomerData"));
    if (!customer) return;

    document.getElementById("company-name").value = customer.companyName || "";
    document.getElementById("tax-code").value = customer.taxId || "";
    document.getElementById("address").value = customer.address || "";
    document.getElementById("represent-name").value = customer.name || "";
    document.getElementById("phone").value = customer.phone || "";
    document.getElementById("discount").value = customer.discountPercentage + "%" || "";

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
        if (confirm("Bạn có chắc chắn muốn xóa khách hàng này không?")) {
            const res = await fetch(`http://localhost:3000/api/customers/${customer._id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            });
            const data = await res.json();
            if (res.ok) {
                alert("Đã xóa thành công");
                window.location.href = './customer.html';
            } else {
                alert("Lỗi xóa: " + data.message);
            }
        }
    });

    // Nút THU HỒI CHIẾT KHẤU
    document.getElementById("btn-reset-discount").addEventListener("click", async () => {
        const res = await fetch(`http://localhost:3000/api/customers/${customer._id}/reset-discount`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" }
        });
        const data = await res.json();
        if (res.ok) {
            alert("Đã thu hồi mức chiết khấu");
            location.reload();
        } else {
            alert("Lỗi: " + data.message);
        }
    });

    // Nút CẬP NHẬT THÔNG TIN
    document.getElementById("btn-update").addEventListener("click", async () => {
        const updated = {
            companyName: document.getElementById("company-name").value,
            taxId: document.getElementById("tax-code").value,
            address: document.getElementById("address").value,
            name: document.getElementById("represent-name").value,
            phone: document.getElementById("phone").value,
            discountPercentage: document.getElementById("discount").value,
        };

        const res = await fetch(`http://localhost:3000/api/customers/${customer._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated)
        });

        const data = await res.json();
        if (res.ok) {
            alert("Cập nhật thành công!");
        } else {
            alert("Cập nhật thất bại: " + data.message);
        }
    });
});
