document.addEventListener("click", (e) => {
  if (e.target.classList.contains("reset-password")) {
    e.preventDefault();

    const staffUsername = e.target.dataset.username;
    const staffName = e.target.dataset.name;

    showModalDelete(
        "RESET MẬT KHẨU", 
        staffName, 
        async () => {
            fetch(`http://localhost:3000/api/auth/reset-password/${staffUsername}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
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
                        'RESET MẬT KHẨU',
                        `Reset mật khẩu cho nhân viên <b>${staffName}</b> thành mặc định theo dạng: <b>NASA@<4 số cuối CCCD></b> thành công`,
                        [
                            {
                                text: 'Xem danh sách',
                                link: currentURL
                            }                        
                        ]
                    )
                }
                else {
                    showModalError('RESET MẬT KHẨU', data.message)
                }
            })
            .catch(error => {
                showModalError('RESET MẬT KHẨU', error.message)
            });
        },
        () => showModalError("RESET MẬT KHẨU", `Nhập đúng <b>${staffName}</b> để xác thực.`)
    );
  }
});
