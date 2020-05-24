const checkboxNew = document.getElementById('checkbox-new')
const newSelect = document.getElementById('existing-exercise')
const newInput = document.getElementById('new-exercise')
const elementsToRestore = document.querySelectorAll('.restore-this')

checkboxNew.addEventListener('change', () => {    
    newInput.classList.toggle('hidden') 
    newSelect.classList.toggle('hidden')
})

elementsToRestore.forEach(element => {    
    element.addEventListener('change', () => {
        if (element.nodeName === 'INPUT') localStorage.setItem(element.id, element.value)
        if (element.nodeName === 'SELECT') localStorage.setItem(element.id, element.selectedIndex)    
    })
})

elementsToRestore.forEach(element => {    
    if (element.nodeName === 'INPUT') element.value = localStorage.getItem(element.id)
    if (element.nodeName === 'SELECT') element.selectedIndex = localStorage.getItem(element.id)
})