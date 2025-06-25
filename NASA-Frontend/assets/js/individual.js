
let originstaffInfo;
let current = {};

function formatDate(dateStr) {
    const date = new Date(dateStr);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng tính từ 0
    const year = String(date.getFullYear()); // Lấy 2 số cuối

    return `${day}/${month}/${year}`;
}

async function getStaffData(userInfo){
    try {
        const res = await fetch(`http://localhost:3000/api/staff/get-staff-by-username/${userInfo.username}`);
        if (!res.ok){
            throw new Error("Không tìm thấy thông tin nhân viên");
        }
        const data = await res.json();
        return data.data;
    } catch(error){
        console.log("Lỗi khi lấy thông tin nhân viên: ", error.message);
    }
}

window.addEventListener("DOMContentLoaded", async function () {

    userInfo = JSON.parse(localStorage.getItem("user"));

    role_dict = {
        "accountant": "Kế toán",
        "staff": "Nhân viên bán hàng",
        "manager": "Quản lý cửa hàng"
    };
    originstaffInfo = await getStaffData(userInfo);
//   console.log(formatDate(originstaffInfo.DoB));
    document.getElementById("staffImage").src =  `http://localhost:3000/api/image/${originstaffInfo.image}`;
    document.getElementById("staffName").textContent = originstaffInfo.fullName.toUpperCase();
    document.getElementById("name-input").value = originstaffInfo.fullName;
    document.getElementById("address-input").value = originstaffInfo.address;
    document.getElementById("phone-input").value = originstaffInfo.phone;
    document.getElementById("CCCD-input").value = originstaffInfo.CCCD;
    document.getElementById("birth-input").value = formatDate(originstaffInfo.DoB); 
    const positionSelect = document.getElementById("position-select");
    positionSelect.querySelectorAll("option").forEach(option => {
        if (option.value === originstaffInfo.role) {
            option.selected = true;
            document.getElementById("role-string").textContent = role_dict[originstaffInfo.role] + " - " + originstaffInfo.username;
        }
        else {
            option.selected = false;
        }
    });

    document.getElementById("email-input").value = originstaffInfo.email;
    document.getElementById("username-input").value = originstaffInfo.username;
    document.getElementById("startDate-input").value = formatDate(originstaffInfo.startDate);

    const inputFields = [
        { id: "address-input", key: "address" },
        { id: "phone-input", key: "phone" },
        { id: "birth-input", key: "DoB" }
    ];

    let isChanged = false;
    inputFields.forEach(field => {
        document.getElementById(field.id).addEventListener("input", () => {
            isChanged = inputFields.some(f => {
                if (document.getElementById(f.id).value.trim() !== originstaffInfo[f.key]){
                    current[f.key] = document.getElementById(f.id).value.trim();
                    return true;
                }
                return false;
            });
            document.getElementById("edit-button").disabled = !isChanged;
            
        });
    });
    // console.log(updatedData);
    document.getElementById('image-file').addEventListener('change', function (event) {
        noChange = false;
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = function (e) {
            const previewImage = document.getElementById('staffImage');
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
        };

        reader.readAsDataURL(file); // đọc file ảnh thành base64

        isChanged = true;
        document.getElementById("edit-button").disabled = !isChanged;

    });
});

document.getElementById("edit-button").addEventListener("click", () => {
    updateStaffInfo(originstaffInfo._id, current);
});

async function updateStaffInfo(staffId, updatedData){
    showModalConfirm("CẬP NHẬP THÔNG TIN NHÂN VIÊN", `cập nhập thông tin`, "", () => {
        if (Object.keys(updatedData).length !== 0) {
            fetch(`http://localhost:3000/api/staff/update-staff/${staffId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({current: updatedData})
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    isChanged = false;
                    if (!document.getElementById("image-file").files[0]) {
                        showSuccessModal(
                            "CẬP NHẬP THÔNG TIN NHÂN VIÊN",
                            `Cập nhật thông tin thành công!`,
                            [
                                {
                                text: 'Đóng',
                                link: window.location.href
                                }
                            ]
                            )
                        }
                    }
            })
            .catch(err => {
                showModalError("LỖI", `Không thể kết nối đến server: ${err.message}`);
                console.error(err);
                return;
            });

        }
        
        if (!document.getElementById("image-file").files[0]) {
            // Nếu không có file ảnh mới, chỉ cập nhật thông tin
            return;
        }
        const formData = new FormData();
        const inputImg = document.getElementById("image-file");
        formData.append('image', inputImg.files[0]);

        fetch(`http://localhost:3000/api/staff/update-staff-image/${staffId}`, {
            method: "PUT",
            body: formData
        })
        .then(res => res.json())
        .then(async data => {
            if (!data.success) {
                throw new Error(data.message || "Không thể cập nhật ảnh đại diện");
            }
            const newStaffInfo = await getStaffData(userInfo);
            let newUserInfo = JSON.parse(localStorage.getItem("user"));
            localStorage.removeItem("user");
            newUserInfo.image = newStaffInfo.image;
            localStorage.setItem("user", JSON.stringify(newUserInfo));
            showSuccessModal(
                "CẬP NHẬP THÔNG TIN NHÂN VIÊN",
                `Cập nhật thông tin thành công!`,
                [
                    {
                    text: 'Đóng',
                    link: window.location.href
                    }
                ]
            )
        })
        .catch(err => {
            showModalError("LỖI", `${err.message}`);
            console.error(err);
            return;
        });
    });
}