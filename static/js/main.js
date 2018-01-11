
/*
USER FLOW:

1. Welcome to {{location::name}}! What's your name?
    - Fetch the top 10 users with that (case-insensitive) exact-match name
2. If any users exist && been_here_before is checked:
    - Ask "are any of these you?" with the school name w/ each user
        - If a match exists, log a new Attendance model for the user with the current date and break;
        - Else, go to 3
   Else, go to 3
3. Ask for: (things marked USER PROPERTY are direct props on users, others are under user_info)
    - Name (USER PROPERTY)
    - School Name (from a static list, with "other" as option. The DB will store as string, but for uniformity's sake Frontend will provide choices.
    - Grade Level (USER PROPERTY)
    - Parent Name
    - Parent Email
    - Parent Phone (optional)
    - Demographics
        - Choose not to share
        - Gender (Male, Female, Nonbinary, Other)
        - Race (reference something else for choices...)
4. POST the user model with current date as the create_iso_date
5. POST an attendance model
*/

(function() {

    // stuff

    let active_step = 0

    function update_step(val) {
        if (val > active_step) {
            document.body.classList.remove(`active_step_${active_step}`)
            active_step = val
            document.body.classList.add(`active_step_${active_step}`)
        } else {
            throw 'New active step cannot be before the old step'
        }
    }

    function start() {
        update_step(1)
    }

})()
