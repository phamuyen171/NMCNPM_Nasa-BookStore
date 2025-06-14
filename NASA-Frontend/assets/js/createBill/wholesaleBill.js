let taxId;
const companyNameTag = document.getElementById('name');
companyNameTag.addEventListener("keydown", async (e)=>{
    if (e.key === "Enter"){
        const companyName = companyNameTag.value.trim();
        try{
            const response = await fetch(`http://localhost:3000/api/customers/company-info/${companyName}`);
            const data = await response.json();
            if (!data.success){
                throw new Error(data.message);
            }
            taxId = data.data.taxId;
            document.getElementById('code-tax').value = taxId;
            document.getElementById('address').value = data.data.address;
        } catch (error){
            showModalError("LỖI LẤY THÔNG TIN ĐƠN VỊ BÁN Sỉ", error.message);
        }
    }
});

async function checkRepresentative(companyName, taxId, name, phone){
    try{
        // console.log(JSON.stringify({companyName, taxId, name, phone}));
        const res = await fetch("http://localhost:3000/api/customers/check-representative", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({companyName, taxId, name, phone})
        });
        const data = await res.json();
        if (!data.success){
            throw new Error(data.message);
        }
    }
    catch (error){
        showModalError("LỖI LẤY THÔNG TIN ĐƠN VỊ BÁN SỈ", error.message);
    }
}

const personNameTag = document.getElementById('person-name');
personNameTag.addEventListener("keydown", async (e) => {
    if (e.key === "Enter"){
        let name = personNameTag.value.trim();

        let phone = document.getElementById('phone').value.trim();
        if (!phone){
            return;
        }
        checkRepresentative(companyNameTag.value.trim(), taxId, name, phone);

    }
});

const personPhoneTag = document.getElementById('phone');
personPhoneTag.addEventListener("keydown", async (e) => {
    if (e.key === "Enter"){
        let phone = personPhoneTag.value.trim();

        let name = document.getElementById('person-name').value.trim();
        if (!name){
            return;
        }
        checkRepresentative(companyNameTag.value.trim(), taxId, name, phone)

    }
});