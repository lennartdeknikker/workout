async function showResults() {
    const resultsContainer = document.getElementById('results-container')
    const results = await fetch('/api').then(response => response.json())
    const transformedResults = transformResults(results)
    const shownProperties = ['exercise', 'weight', 'sets', 'reps']

    for (let item in transformedResults) {
        const result = transformedResults[item]
        
        const dayContainer = document.createElement('div')
        dayContainer.classList.add('day-container')
        const h2 = document.createElement('h2')
        h2.innerText = result.date
        dayContainer.appendChild(h2)

        for (let item in result.groups) {
            const group = result.groups[item]            
            const newTable = document.createElement('table')
            const caption = document.createElement('caption')
            caption.innerText = group.name
            const thead = document.createElement('thead')
            const theadTr = document.createElement('tr')
            for (let property of shownProperties) {
                const th = document.createElement('th')
                th.innerText = property
                theadTr.appendChild(th)
            }
            const tbody = document.createElement('tbody')

            thead.appendChild(theadTr)
            newTable.appendChild(caption)
            newTable.appendChild(thead)
                        
            for (let exercise in group.exercises) {
                const exerciseData = group.exercises[exercise]
                
                for (let weightGroup in exerciseData.weights) {
                    const weightGroupData = exerciseData.weights[weightGroup]                    

                    for (let repsGroup in weightGroupData.reps) {
                        const repsGroupData = weightGroupData.reps[repsGroup]
                        console.log('repsGroupData', repsGroupData)
                        
                        const newRow = document.createElement('tr')
                        newRow.dataset.exercise = exerciseData.name
                        newRow.dataset.weight = `${weightGroupData.weight}-${exerciseData.name}`


                        const exerciseTh = document.createElement('th')
                        const weightTd = document.createElement('td')
                        const setsTd = document.createElement('td')
                        const repsTd = document.createElement('td')

                        const existingRowForExercise = tbody?.querySelector(`[data-exercise='${exerciseData.name}'`)
                        if (!existingRowForExercise) {                       
                            exerciseTh.innerText = exerciseData.name
                        } 
                        
                        const existingRowForThisWeightForThisExercise = tbody?.querySelector(`[data-weight='${weightGroupData.weight}-${exerciseData.name}'`)
                        if (!existingRowForThisWeightForThisExercise) {
                            weightTd.innerText = weightGroupData.weight
                        }

                        setsTd.innerText = repsGroupData.sets
                        repsTd.innerText = repsGroupData.reps 
                    
                        newRow.appendChild(exerciseTh)
                        newRow.appendChild(weightTd)
                        newRow.appendChild(setsTd)
                        newRow.appendChild(repsTd) 
                        tbody.appendChild(newRow)  
                    }                    
                }                
            }
            newTable.appendChild(tbody)
            dayContainer.appendChild(newTable)
        }
        resultsContainer.appendChild(dayContainer)
    }
}

function transformResults(results) {

    let transformedResults = {}

    for (let result of results) {
        const id = transformDate(result.date)
        if (!transformedResults[id]) {
            transformedResults[id] = {}
            transformedResults[id].date = id
            transformedResults[id].groups = []
        }
        if (!transformedResults[id].groups[result.muscle]) {
            transformedResults[id].groups[result.muscle] = {}
            transformedResults[id].groups[result.muscle].name = result.muscle
            transformedResults[id].groups[result.muscle].exercises = []
        }
        if (!transformedResults[id].groups[result.muscle].exercises[result.exercise]) {
            transformedResults[id].groups[result.muscle].exercises[result.exercise] = {}
            transformedResults[id].groups[result.muscle].exercises[result.exercise].name = result.exercise
            transformedResults[id].groups[result.muscle].exercises[result.exercise].weights = []
        }
        if (!transformedResults[id].groups[result.muscle].exercises[result.exercise].weights[result.weight]) {
            transformedResults[id].groups[result.muscle].exercises[result.exercise].weights[result.weight] = {}
            transformedResults[id].groups[result.muscle].exercises[result.exercise].weights[result.weight].weight = result.weight
            transformedResults[id].groups[result.muscle].exercises[result.exercise].weights[result.weight].reps = []
        }
        if (!transformedResults[id].groups[result.muscle].exercises[result.exercise].weights[result.weight].reps[result.reps]) {
            transformedResults[id].groups[result.muscle].exercises[result.exercise].weights[result.weight].reps[result.reps] = {}
            transformedResults[id].groups[result.muscle].exercises[result.exercise].weights[result.weight].reps[result.reps].reps = result.reps
            transformedResults[id].groups[result.muscle].exercises[result.exercise].weights[result.weight].reps[result.reps].sets = 0
            transformedResults[id].groups[result.muscle].exercises[result.exercise].weights[result.weight].reps[result.reps].logs = []
        }         
        transformedResults[id].groups[result.muscle].exercises[result.exercise].weights[result.weight].reps[result.reps].sets++        
        transformedResults[id].groups[result.muscle].exercises[result.exercise].weights[result.weight].reps[result.reps].logs.push(result)  
    }

    console.log(transformedResults)
    return transformedResults
}


function transformDate(date) {
    const dateObject = new Date(date)
    const day = dateObject.getDate()
    const month = dateObject.getMonth() + 1
    const year = dateObject.getFullYear()
    return `${day}-${month}-${year}`
}

showResults()