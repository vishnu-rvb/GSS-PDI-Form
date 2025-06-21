function clearForm() {
    document.getElementById('form').reset();
}
function submitForm(event){
    event.preventDefault();
    const URL = 'url';
    const formData = new FormData(event.target);
    const data = {
    };
    console.log(data);
    fetch(URL, {method: 'POST',headers: {'Content-Type':'application/json'},body: JSON.stringify(data)})
    .then(response=>{console.log('Response:', response);alert('Coil location updated');clearForm();})
    .catch(error => {console.error('Error:', error);alert('Error submitting data');});
}

document.getElementById('form').addEventListener('submit',submitForm);