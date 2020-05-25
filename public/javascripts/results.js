async function showResults() {
    const resultsContainer = document.getElementById('results-container')
    
    const results = await fetch('/api').then(response => response.json())
    console.log(results)

    let transformedResults = {}

    for (let result of results) {
        if (!transformedResults[transformDate(result.date)]) {
            transformedResults[transformDate(result.date)] = []
        }        
        transformedResults[transformDate(result.date)].push(result)  
    }

    console.log(transformedResults)
    

    function transformDate(date) {
        const dateObject = new Date(date)
        const day = dateObject.getDate()
        const month = dateObject.getMonth() + 1
        const year = dateObject.getFullYear()
        return `${day}${month}${year}`
    }
    
    // for (let result of results) {
    //     const h2 = document.createElement('h2')
    //     h2.innerText = result.date

    //     const newTable = document.createElement('table')

    //     const caption = document.createElement('caption')
    //     caption.innerText = result.muscle

    //     const thead = document.createElement('thead')
    // }
}

showResults()