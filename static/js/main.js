let active_step = 0

const $ = document.querySelector.bind(document)
const $$ = (arg) => {
    return Array.prototype.slice.apply(
        document.querySelectorAll(arg)
    )
}

function name_input() {
    return $('#user_name').value || ''
}

function been_here_before_checked() {
    return $('#user_here_before').checked
}

function get_selected_previous_user_id() {
    const selected = $('[name=user_previous_options]:checked')
    return selected && selected.value
}

function userRow(userModel) {
    const inputLabel = `user_previous_option_${userModel.id}`

    const userOptionDiv = document.createElement('li')
    userOptionDiv.classList.add('userOption')

    const userOptionInput = document.createElement('input')
    userOptionInput.setAttribute('type', 'radio')
    userOptionInput.setAttribute('name', 'user_previous_options')
    userOptionInput.setAttribute('id', inputLabel)
    userOptionInput.setAttribute('value', userModel.id)

    const userOptionLabel = document.createElement('label')
    userOptionLabel.setAttribute('for', inputLabel)
    userOptionLabel.textContent = `${userModel.name} (from  ${userModel.user_info.school})`

    userOptionDiv.appendChild(userOptionInput)
    userOptionDiv.appendChild(userOptionLabel)

    return userOptionDiv
}

function logAttendance(user_id) {
    const name = name_input() && name_input().trim()
    const first_name = name && name.split(' ')[0].toString()
    if (first_name) $('#name').textContent = first_name[0].toUpperCase() + first_name.substr(1)

    fetch('/api/attendances/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: user_id,
            iso_date: new Date().toISOString(),
            dojo_slug: 'strike', // TODO: generalize this
        }),
    }).catch(() => {
        alert('Something went wrong. If this keeps happening, please talk to a Dojo mentor.')
    })
}

// hooks
const hooks = {
    after_1: function() {
        if (!name_input()) {
            alert('Please tell us your name.')
            return false
        }

        if (been_here_before_checked()) {
            fetch(`/api/users/?full_name_search=${name_input().trim()}`)
            .then(resp => resp.json(), () => { })
            .then(users => {
                const frag = document.createDocumentFragment()

                if (users.length) {
                    for (const el of users.map(userRow)) {
                        frag.appendChild(el)
                    }
                    $('.existingUsersList').appendChild(frag)
                } else {
                    document.body.classList.add('skipped-2')
                    increment_step(true)
                }
            })
            return true
        } else {
            increment_step(true)
            document.body.classList.add('skipped-2')
            return true
        }
    },
    after_2: function() {
        const uid = get_selected_previous_user_id()
        if (uid) {
            logAttendance(uid)
            increment_step(true)
            document.body.classList.add('skipped-3')
        }
        return true
    },
    after_3: function() {
        const userInfoProps = {
            race: $('#user_info_race').value,
            gender: $('#user_info_gender').value,
            school: $('#user_info_school').value,

            parent_name: $('#user_info_parent_name').value,
            parent_email: $('#user_info_parent_email').value,
            parent_phone: $('#user_info_parent_phone').value,
        }
        const userProps = {
            name: name_input(),
            grade_level: $("#user_info_grade_level").value,
            created_iso_date: new Date().toISOString(),

            user_info: userInfoProps,
        }

        // VALIDATION!
        const REQUIRED_FIELDS = {
            '#user_name': 'student\'s name',
            '#user_info_school': 'school name',
            '#user_info_grade_level': 'student\'s grade level',
            '#user_info_parent_name': 'parent name',
            '#user_info_parent_email': 'parent email',
            '#user_info_parent_phone': 'parent phone number',
        }
        for (const id in REQUIRED_FIELDS) {
            if (!$(id).value) {
                alert(`The ${REQUIRED_FIELDS[id]} is required.`)
                return false // don't flip the next step just yet
            }
        }

        fetch('/api/users/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userProps),
        }).then(resp => {
            return resp.json()
        }).then(resp => {
            logAttendance(resp.id)
        }).catch(() => {
            alert('Something went wrong. If this keeps happening, please talk to a Dojo mentor.')
        })

        return true
    },
}

function increment_step(force) {
    const hook = hooks[`after_${active_step}`];
    if (force || !hook || (hook && hook())) {
        document.body.classList.remove(`active_step_${active_step}`);
        active_step++;
        document.body.classList.add(`active_step_${active_step}`);
    }
}

function start() {
    increment_step()
}

// Event bindings
for (const el of $$('.nextButton')) {
    el.addEventListener('click',  evt => increment_step())
}

// Start app
start()
