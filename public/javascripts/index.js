
const checkboxNew = document.getElementById('checkbox-new')

function toggleNewExisting() {
    const newSelect = document.getElementById('select-exercise')
    const newInput = document.getElementById('input-exercise')
    newInput.classList.toggle('hidden') 
    newSelect.classList.toggle('hidden')
}

checkboxNew.addEventListener('change', toggleNewExisting)