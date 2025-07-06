document.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-staff")) {
    e.preventDefault();

    const staffId = e.target.dataset.id;
    const staffName = e.target.dataset.name;
    console.log(staffId)

    showModalDelete(
        "XÓA NHÂN VIÊN", 
        staffName, 
        async () => {
            fetch(`http://localhost:3000/api/staff/delete-staff/${staffId}`, {
                method: 'DELETE',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': 'Bearer ' + localStorage.getItem('token') 
                }
            })
            .then(async response => {
                const data = await response.json();
                if (!response.ok) {
                    
                    throw new Error(data.message);
                }
                return data;
            })
            .then(data => {
                if (data.success) {
                    const currentURL = window.location.href;
                    showSuccessModal(
                        'XÓA NHÂN VIÊN',
                        `Xóa nhân viên <b>${staffName}</b> thành công`,
                        [
                            {
                                text: 'Xem danh sách',
                                link: currentURL
                            }                        
                        ]
                    )
                }
                else {
                    showModalError('XÓA NHÂN VIÊN', data.message)
                }
            })
            .catch(error => {
                showModalError('XÓA NHÂN VIÊN', error.message)
            });
        },
        () => showModalError("XÓA NHÂN VIÊN", `Nhập đúng <b>${staffName}</b> để xác thực.`)
    );
  }
});
