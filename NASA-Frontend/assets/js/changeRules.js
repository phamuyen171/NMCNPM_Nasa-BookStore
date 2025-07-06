function convertAfterChange(tagId) {
  const tag = document.getElementById(tagId);
  tag.addEventListener("blur", () => {
    tag.value = convertMoney(tag.value);
  });
}


async function showRuleInfo(){
    try{
        const res = await fetch("http://localhost:3000/api/rules/", {
            method: "GET"
        });
        const data = await res.json();
        if (!data.success){
            showModalError("LỖI THAY ĐỔI QUY ĐỊNH", data.message);
            return;
        }
        const rules = data.data[0];
        document.getElementById('minImportBook').value = rules.book.minImportBook;
        document.getElementById('maxImportBook').value = rules.book.maxImportBook;
        document.getElementById('maxImportableBook').value = rules.book.maxImportableBook;

        document.getElementById('maxLowDebt').value = convertMoney(rules.debt.maxLowDebt);
        document.getElementById('timeLowDebt').value = rules.debt.timeLowDebt;
        document.getElementById('maxHighDebt').value = convertMoney(rules.debt.maxHighDebt);
        document.getElementById('timeHighDebt').value = rules.debt.timeHighDebt;

        document.getElementById('minBillValue').value = convertMoney(rules.point.minBillValue);
        document.getElementById('minPointToUse').value = rules.point.minPointToUse;
        document.getElementById('cashToPoint').value = convertMoney(rules.point.cashToPoint);
        document.getElementById('pointToCash').value = convertMoney(rules.point.pointToCash);
        document.getElementById('minUsedLevel').value = rules.point.minUsedLevel;
    }
    catch(error){
        console.log(error.message);
    }
}

async function updateRules(rules){
    try{
        const res = await fetch("http://localhost:3000/api/rules/", {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(rules)
        });

        const data = await res.json();

        if(!data.success){
            showModalError("LỖI THAY ĐỔI QUY ĐỊNH", data.message);
            return;
        }
        showSuccessModal(
            'THAY ĐỔI QUY ĐỊNH',
            'Thay đổi quy định thành công!',
            [
                {
                    text: 'Xem quy định',
                    link: 'changeRules.html'
                }
            ]
        );
    } catch (error){
        console.log(error.message);
    }
}
const tagConvertList = ['maxLowDebt', 'maxHighDebt', 'minBillValue', 'cashToPoint', 'pointToCash', 'minUsedLevel']
document.addEventListener("DOMContentLoaded", function () {
    let checkRole = false;
    const user = JSON.parse(localStorage.getItem("user"));
    if (user.role !== "staff"){
      if (user.role === "manager") {
        document.getElementById("notice").style.display = "none";
        checkRole = true;
      }
    } else {
        document.getElementById("report-btn").style.display = "none";
    }
    showRuleInfo();
    tagConvertList.forEach(id => convertAfterChange(id)); // ✅ Gọi 1 lần
    // cập nhập
    const update_btn = document.getElementById('update-btn');
    if (update_btn) {
        
        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', e => {
                if (checkRole) update_btn.disabled = false;
            });
        });
        update_btn.addEventListener('click', async ()=>{
            const book = {
                "minImportBook": document.getElementById('minImportBook').value,
                "maxImportBook": document.getElementById('maxImportBook').value,
                "maxImportableBook": document.getElementById('maxImportableBook').value
            };
            const debt = {
                "maxLowDebt": parseCurrencyVND(document.getElementById('maxLowDebt').value),
                "timeLowDebt": document.getElementById('timeLowDebt').value,
                "maxHighDebt": parseCurrencyVND(document.getElementById('maxHighDebt').value),
                "timeHighDebt": document.getElementById('timeHighDebt').value
            };
            const point = {
                "minBillValue": parseCurrencyVND(document.getElementById('minBillValue').value),
                "minPointToUse": document.getElementById('minPointToUse').value,
                "cashToPoint": parseCurrencyVND(document.getElementById('cashToPoint').value),
                "pointToCash": parseCurrencyVND(document.getElementById('pointToCash').value),
                "minUsedLevel": document.getElementById('minUsedLevel').value
            };

            const rules = { "book": book, "debt": debt, "point": point};

            showModalConfirm("THAY ĐỔI QUY ĐỊNH", "thay đổi quy định", "", () => {
                updateRules(rules);
            });
        });
    }

});