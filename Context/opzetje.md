I use this app for tracking progress on my workouts. I want to rebuild it completely and I need your help for writing down the context before starting on it. These are some of the ideas:

- It should be built mobileFirst
- I want to keep my own db of exercises, but have a form to add more. When adding more, I want to be able to search for exercises using this free api: https://oss.exercisedb.dev/docs#tag/exercises/GET/api/v1/exercises/search, to find an exercise, then be able to add my own properties in that same form.
- I want to be able to manage my own db, edit exercises, remove ones, add moore
- I need a data model for my own exercises db. properties I'd like to include:
    ```
    {
        id: string
        exerciseDbData: {
            exerciseId: string
            name: string
            gifUrl: Urlstring
            targetMuscles: Muscle[]
            bodyParts: Bodypart[]
            equipments: Equipment[]
            secondaryMuscles: Muscle[]
            Instructions: string[]
        },
        sets: {
            min: number
            max: number
        }
        weight: {
            min: number
            max: number
        },
        reps: {
            min: number
            max: number
        }
        rest: {
            min: number (seconds)
            max: number (seconds)
        }
        routine: push | pull | legs | cardio | core
    }
    ```
    - id
    - exerciseDb:
        - all exercise db properties
    - sets
    - Look at src/components/ExerciseForm.svelte for the desired form inputs
    - for searching the external api, i want a simple search field that returns results that you can then pick one out of.
    - it should be very clean and simple, use the screenshots and current code for the desired UI style:
    - I want to keep the current timer feature as is
    - I want to keep a flat of log each set I do for maximum compatibility of analysis and data visualisation options:
      - id
      - timestamp
      - exerciseId
      - weight
      - reps
    - In the ui, I like the current idea of selecting a routine -> exercise. Then fill in weight + reps, save a set. update reps and weights, add another set, update weight + reps and add another set, etc. until i finished the exercise. then i press post.
    - all sets data should then be posted to the db
    - the form should have progressive disclosure:
      - screen 1: select routine & exercise
      - screen 2: See routine & exercise in the top. use the sliders or input fields to select/fill in weight and reps and ability to commit a set. (see badges of each set as currently is the case, with a cross to remove.)
      - screen 3: summary of sets and a post button. After posting, it should go back to an overview of the exercises of that day. with a button to start on a new exercise which opens the progressive form again. The form should have a subnav with a plus button. Clicking that plus button opens another tab, so you can do 2 or at most 3 exercises at the same time, switch between them. When an exercise in one of those tabs is submitted, it should show a green checkmark in the tab. When all open tabs are submitted, they close and you get back to the overview of exercises for that day
    - I want a top level navigation with these options:
      - workout, moves you to the overview of the current day. with a zero state for when you havent started and always showing a button to start working on a new exercise.
      - previous workouts:
        - lists previous days that have exercises logged. In the overview, you see a button for each day, with in the label, the day and focus area based on the highest count routine of the exercises done that day. Clicking the button, opens a view with the exercises, reps, weights etc done that day
    - The whole app and postgres db should be able to run on my raspberry pi in a docker container.

    technical requirements:
    - svelte + sveltekit for the app
    - postgres db
    - typescript where possible.
    - test-driven development: 
    - e2e and unit tests.