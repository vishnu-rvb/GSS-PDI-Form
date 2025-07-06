function addRow(type) {
    const template = document.getElementById(`template-${type}`);
    const container = document.getElementById(`${type}-container`);

    if (template && container) {
    const clone = template.content.cloneNode(true);
    container.appendChild(clone);
    }
    else if(template){console.error(`container for ${type} not found`);}
    else {console.error(`template for ${type} not found`);}
}

function clearForm() {
    document.getElementById('form').reset();
}

function submitForm(event){
    event.preventDefault();
    const URL = 'url';
    const formData = new FormData(event.target);

    // Collect PDI Inspectors
    const Inputs_PDI_inspectors = document.querySelectorAll('#inspectors-container input[name="PDI inspector"]');
    const data_PDI_inspectors = Array.from(Inputs_PDI_inspectors).map(input=>input.value.trim()).filter(value=>(value!==''));
    // Collect Issues
    const Rows_Issues = document.querySelectorAll('#issues-container .dynamic-row');
    const data_Issues = Array.from(Rows_Issues).map( row =>{
        const inputs = row.querySelectorAll('input');
        return {
            issue: inputs[0]?.value.trim(),
            qty: parseInt(inputs[1]?.value) || 1,
            status: inputs[2]?.value.trim()
        };
    });

    const data = {
        Project_Reference_number: formData.get('Project Reference number'),
        Customer_name: formData.get('Customer name'),
        Container_number: formData.get('Container number'),
        Container_ID: formData.get('Container ID'),
        Container_size: formData.get('Container size'),
        Date: formData.get('Date'),
        Shift: formData.get('Shift'),
        PDI_inspectors: data_PDI_inspectors,
        Issues: data_Issues,
        Status: formData.get('Status')
    };
    console.log(data);
    //fetch(URL, {method: 'POST',headers: {'Content-Type':'application/json'},body: JSON.stringify(data)})
    //.then(response=>{console.log('Response:', response);alert('PDI details updated');clearForm();})
    //.catch(error=>{console.error('Error:', error);alert('Error submitting data');});
}

document.getElementById('form').addEventListener('submit',submitForm);