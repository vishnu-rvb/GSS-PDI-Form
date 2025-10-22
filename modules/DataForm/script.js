function disableForm(disabled) {
    const form = document.getElementById('form');
    const elements = form.querySelectorAll('input, select, button, textarea');
    //elements.forEach(i =>{i.disabled = disabled;});
    for (const i of elements){i.disabled=disabled;};
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

async function compressImages(Images,method='parallel') {
    let Images_c=[]
    const compressionOptions = {
        maxSizeMB: 2,
        maxWidthOrHeight: 1024,
        useWebWorker: true
    };
    try {
        switch(method){
        case 'parallel':
            Images_c= await Promise.all(
                Images.map(i => imageCompression(i,compressionOptions))
            );
            return Images_c;
        case 'sequential':
            for(const i of Images){
                const i_c = await imageCompression(i,compressionOptions);
                Images_c.push(i_c);
            };
            return Images_c;
        case 'batching':
            const batchSize=5;
            for(let i=0;i<Images.length;i+=batchSize){
                const batch = Images.slice(i, i + batchSize);
                const batch_c = await Promise.all(
                    batch.map(j => imageCompression(j,compressionOptions))
                );
                Images_c.push(...batch_c);
            };
            return Images_c;
        };
    }
    catch (err) {
        alert('Error compressing images');
        console.error(err);
        return Images;
    };
}

function clearForm() {
    document.getElementById('form').reset();
}

function setPhotoStatus(x,y){
    let PhotoStatus='';
    if(x>=1){PhotoStatus+='Y';}
    else{PhotoStatus+='N';}
    if(y>=1){PhotoStatus+='Y';}
    else{PhotoStatus+='N';}
    return PhotoStatus;
}

function get_PDI_inspectors(){
    const elements = document.querySelectorAll('#inspectors-container input[name="PDI inspector"]');
    const data=Array.from(elements).map(input=>input.value.toLowerCase().trim()).filter(value=>(value!==''));
    return data;
}

function get_Issues(){
    const elements = document.querySelectorAll('#issues-container .dynamic-row');
    let data = Array.from(elements)
    data=data.map(row =>{
        const issueInput = row.querySelector('input[name="issue"]');
        const qtyInput = row.querySelector('input[name="qty"]');
        const statusSelect = row.querySelector('select[name="status"]');
        return {
            issue: issueInput?.value.trim(),
            qty: parseInt(qtyInput?.value) || 1,
            status: statusSelect?.value.trim()
        };
    });
    data=data.filter(i=>i.issue!=='');
    return data;
}

function cleanText(orgText,method){
    let text=`${orgText}`;
    switch(method){
        case 'Project Reference number':
            text=text.toUpperCase();
            text=text.replace(/[\/\\]/g, ','); //replaces /,\
            text=text.replace('.','');
            text=text.trim();
            return text;
        case 'Customer name':
            text=text.toLowerCase();
            text=text.trim();
            return text;
        case 'Container number':
            text=text.trim();
            text=parseInt(text,radix=10)
            return text;
        case 'Container ID':
            text=text.toUpperCase();
            text=text.replace(/[() ]/g, ""); //replaces (, ,)
            text=text.trim();
            return text;
        case 'uploader':
            text=text.toLowerCase();
            text=text.trim();
            return text;
    };

}

async function submitForm(event){
    event.preventDefault();
    const URL = 'https://prod-00.centralindia.logic.azure.com:443/workflows/549c8634d35547fd816ae21d607110ab/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=z0Tw_0SxfoKUpBKZ6F-usJ1v4PuubE2QudT9ULdUmAI';
    const formData = new FormData(event.target);
    try{
        disableForm(true);
        showLoading(true);       
        const data_PDI_inspectors = get_PDI_inspectors(); // Collect PDI Inspectors
        if(data_PDI_inspectors.length==0){
            alert("PDI inspector name missing!");
            return;}
        const data_Issues = get_Issues();// Collect Issues

        //Collect images
        const Input_PDI_report_images= document.getElementById('input-PDI report images');
        const Inputs_PDI_loading_images= document.getElementById('input-PDI loading images');
        const reportImgs = Array.from(Input_PDI_report_images.files);
        const loadingImgs = Array.from(Inputs_PDI_loading_images.files);
        const PhotoStatus=setPhotoStatus(reportImgs.length,loadingImgs.length);

        const data = {
            Project_Reference_number: cleanText(formData.get('Project Reference number'),'Project Reference number'),
            Customer_name: cleanText(formData.get('Customer name'),'Customer name'),
            Container_number: cleanText(formData.get('Container number'),'Container number'),
            Container_ID: cleanText(formData.get('Container ID'),'Container ID'),
            Container_size: formData.get('Container size'),
            Date: formData.get('Date'),
            Shift: formData.get('Shift'),
            PDI_inspectors: JSON.stringify(data_PDI_inspectors),
            Issues: JSON.stringify(data_Issues),
            Status: formData.get('Status'),
            uploader: cleanText(formData.get('uploader'),'uploader'),
            photoStatus: PhotoStatus
        };
        
        // Create multipart/form-data payload
        const payload = new FormData();
        payload.append('json', new Blob([JSON.stringify(data)], { type: 'application/json' }));
        let reportImgs_c = await compressImages(reportImgs);
        for (let i=0;i<reportImgs_c.length;i++){
                payload.append('PDI_report_images', reportImgs_c[i], `PDI report ${i+1} ${reportImgs_c[i].name}`);
        };
        let loadingImgs_c = await compressImages(loadingImgs);
        for (let i=0;i<loadingImgs_c.length;i++){
                payload.append('PDI_loading_images', loadingImgs_c[i], `Loading image ${i+1} ${loadingImgs_c[i].name}`);
        };
        console.log(Array.from(payload.entries()));
        
        const response= await fetch(URL,{method:'POST',body:payload});
        console.log('Response:', response);
        if (response.ok){alert('PDI details updated');}
        else {alert('Failed to submit details');};
    }
    catch (error){
        console.error('Error:', error);
        alert('Error submitting data');
    }
    finally{
        
        disableForm(false);
        showLoading(false);

    }
}

document.getElementById('form').addEventListener('submit', submitForm);

