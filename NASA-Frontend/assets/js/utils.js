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