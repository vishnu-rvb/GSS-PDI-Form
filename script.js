function toggleFormState(disabled) {
    const form = document.getElementById('form');
    const elements = form.querySelectorAll('input, select, button, textarea');
    elements.forEach(i =>{i.disabled = disabled;});
}

function showLoading(show) {
    let loadingOverlay = document.getElementById('loading-overlay');
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.innerHTML = `<div class="loading-box">Loading...</div>`;
        document.body.appendChild(loadingOverlay);
    }
    loadingOverlay.style.display = (show ? 'flex' : 'none');
}

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

async function compressImages(Images) {
    let Images_c=[]
    const compressionOptions = {
        maxSizeMB: 2,
        maxWidthOrHeight: 1024,
        useWebWorker: true
    };
    try {
    Images_c= await Promise.all(
        Images.map(Image => imageCompression(Image, compressionOptions))
    );
    }
    catch (err) {
        alert('Error compressing images');
        console.error(err);
        return;
    }
    return Images_c;
}

function clearForm() {
    document.getElementById('form').reset();
}

async function submitForm(event){
    event.preventDefault();
    const URL = 'https://prod-00.centralindia.logic.azure.com:443/workflows/549c8634d35547fd816ae21d607110ab/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=z0Tw_0SxfoKUpBKZ6F-usJ1v4PuubE2QudT9ULdUmAI';
    const formData = new FormData(event.target);

    // Collect PDI Inspectors
    const Inputs_PDI_inspectors = document.querySelectorAll('#inspectors-container input[name="PDI inspector"]');
    const data_PDI_inspectors = Array.from(Inputs_PDI_inspectors).map(input=>input.value.trim()).filter(value=>(value!==''));
    // Collect Issues
    const Rows_Issues = document.querySelectorAll('#issues-container .dynamic-row');
    const data_Issues = Array.from(Rows_Issues).map( row =>{
        const issueInput = row.querySelector('input[name="issue"]');
        const qtyInput = row.querySelector('input[name="qty"]');
        const statusSelect = row.querySelector('select[name="status"]');
        return {
            issue: issueInput?.value.trim(),
            qty: parseInt(qtyInput?.value) || 1,
            status: statusSelect?.value.trim()
        };
    });

    const data = {
        Project_Reference_number: formData.get('Project Reference number').toUpperCase(),
        Customer_name: formData.get('Customer name'),
        Container_number: formData.get('Container number'),
        Container_ID: formData.get('Container ID').toUpperCase(),
        Container_size: formData.get('Container size'),
        Date: formData.get('Date'),
        Shift: formData.get('Shift'),
        PDI_inspectors: data_PDI_inspectors,
        Issues: data_Issues,
        Status: formData.get('Status')
    };

    //Collect images
    const Input_PDI_report_images= document.getElementById('input-PDI report images');
    const Inputs_PDI_loading_images= document.getElementById('input-PDI loading images');
    const reportImgs = Array.from(Input_PDI_report_images.files);
    const loadingImgs = Array.from(Inputs_PDI_loading_images.files);

    let reportImgs_c = await compressImages(reportImgs);
    let loadingImgs_c = await compressImages(loadingImgs);

    // Create multipart/form-data payload
    const payload = new FormData();
    payload.append('json', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    reportImgs_c.forEach((file,index)=>
        payload.append('PDI_report_images', file, `PDI report ${index}.${file.name.split('.').pop()}`)
    );
    loadingImgs_c.forEach((file,index)=>
        payload.append('PDI_loading_images', file, `Loading image ${index}.${file.name.split('.').pop()}`)
    );

    console.log(Array.from(payload.entries()));

    toggleFormState(true);
    showLoading(true);

    try{
        const response= await fetch(URL,{method:'POST',body:payload});
        console.log('Response:', response);
        if (response.ok){
            alert('PDI details updated');
            //clearForm();
        }
        else {
            alert('Failed to submit details');
            //clearForm();
        }
    }
    catch (error){
        console.error('Error:', error);
        alert('Error submitting data');
    }
    finally{
    toggleFormState(false);
    showLoading(false);
    }
}

document.getElementById('form').addEventListener('submit', submitForm);

