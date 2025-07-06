document.addEventListener("click", (e) => {
  const target = e.target.closest(".change-status");
  if (target) {
    e.preventDefault();

    const staffId = target.dataset.id;
    const staffName = target.dataset.name;
    const staffStatus = target.dataset.value;

    if (staffStatus === "inactive"){
        showModalError("SA THẢI NHÂN VIÊN", `Nhân viên này <b>${staffName}</b> đã bị sa thải.`);
        return;
    }

    showModalDelete(
      "SA THẢI NHÂN VIÊN",
      `${staffName}`,
      async () => {
        try {
          const response = await fetch(`http://localhost:3000/api/staff/change-status/${staffId}`, {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
          });

          const data = await response.json();
          if (!response.ok) throw new Error(data.message);

          if (data.success) {
            const currentURL = window.location.href;
            showSuccessModal(
              'SA THẢI NHÂN VIÊN',
              `Sa thải nhân viên <b>${staffName}</b> thành công`,
              [{ text: 'Xem danh sách', link: currentURL }]
            );
          } else {
            showModalError('SA THẢI NHÂN VIÊN', data.message);
          }
        } catch (error) {
          showModalError('SA THẢI NHÂN VIÊN', error.message);
        }
      },
    () => showModalError("SA THẢI NHÂN VIÊN", `Nhập đúng <b>${staffName}</b> để xác thực.`)
    );
  }
});

