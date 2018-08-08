const ADMIN_HEADERS = {
    'X-Admin-Pass': null,
}

const $ = document.querySelector.bind(document)
const $$ = (arg) => {
    return Array.prototype.slice.apply(
        document.querySelectorAll(arg)
    )
}

const set_allowed_state = _ => {
    const main = $('main')
    main.classList.remove('allowed_false')
    main.classList.add('allowed_true')

    get_event_label().then(value => {
        $('#event_label').value = value
    }).catch(e => {
        // we're alerting upstream
    })

    get_event_dates().then(dates => {
        set_event_dates(dates)
    }).catch(e => {
        // we're alerting upstream
    })
}

// make a wrapper for admin requests with the right header and /api/ URI prefix

const save_event_label = _ => {
    const event_slug_input = $('#event_label').value
    if (event_slug_input) {
        fetch(`/api/update_event_label?event_label=${event_slug_input}`, {
            headers: ADMIN_HEADERS,
            method: 'POST',
        }).then(resp => {
            alert(`Success! Events are now set as ${event_slug_input.toUpperCase()}.`)
        }).catch(e => {
            alert('Error: ' + e.toString())
        })
    } else {
        alert('The event label seems invalid. Could you try again?')
    }
}

const get_event_label = _ => {
    return new Promise((res, rej) => {
        fetch('/api/get_event_label', {
            headers: ADMIN_HEADERS,
        }).then(resp => {
            return resp.json()
        }).then(resp_json => {
            res(resp_json.event_label || '')
        }).catch(e => {
            alert('Error: ' + e.toString())
            rej()
        })
    })
}

const get_event_dates = _ => {
    return new Promise((res, rej) => {
        fetch('/api/get_event_dates', {
            headers: ADMIN_HEADERS,
        }).then(resp => {
            return resp.json()
        }).then(resp_json => {
            res(resp_json.event_dates || [])
        }).catch(e => {
            alert('Error: ', e.toString())
            rej()
        })
    })
}

const set_event_dates = event_dates => {
    const createOptionEl = isoDate => {
        const el = document.createElement('option')
        el.value = isoDate
        el.textContent = isoDate
        return el
    }
    const optionEls = event_dates.map(createOptionEl)
        .sort().reverse() // reverse chron.
    const frag = document.createDocumentFragment()
    for (const el of optionEls) frag.appendChild(el)

    $('#event_date').appendChild(frag)
}

const download_csv = _ => {
    const event_date_input = $('#event_date').value
    if (event_date_input) {
        fetch(`/api/download_attendance_csv?event_date=${event_date_input}`, {
            headers: ADMIN_HEADERS,
        }).then(resp => {
            return resp.text()
        }).then((csv) => {
            // Create text file with csv as content, and download
            const link = document.createElement('a')
            link.style.display = 'none'
            link.download = `coderdojo_${event_date_input}.csv`
            link.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }).catch(e => {
            alert('Error: ' + e.toString())
        })
    }
}

const validate_password = _ => {
    const password_value = $('#password').value
    ADMIN_HEADERS['X-Admin-Pass'] = password_value
    const clear_pw = _ => {
        $('#password').value = ''
        $('#password').focus()
    }
    fetch(`/api/validate_password`, {
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            password_value: password_value,
        }),
        method: 'POST',
    }).then(resp => {
        return resp.json()
    }).then(json => {
        if (json) {
            set_allowed_state()
        } else {
            alert('Password was incorrect. Please try again.')
            clear_pw()
        }
    }).catch(e => {
        alert('We weren\'t able to log you in. Please try again.')
        clear_pw()
    })
}

// Bind events
$('.saveEventLabelButton').addEventListener('click', save_event_label)
$('.downloadButton').addEventListener('click', download_csv)
$('.authButton').addEventListener('click', validate_password)

// Enter to log in on the password field
$('#password').addEventListener('keypress', evt => {
    if (evt.keyCode && evt.keyCode === 13) {
        validate_password()
    }
})

