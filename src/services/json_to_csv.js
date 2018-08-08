const json_to_csv = users_json => {

    const COLUMN_MAP = {
        'Full Name': ['name'],
        'Grade Level': ['grade_level'],
        'First Attendance': ['created_iso_date'],
        'Race': ['user_info', 'race'],
        'Gender': ['user_info', 'gender'],
        'School': ['user_info', 'school'],
        'Parent Name': ['user_info', 'parent_name'],
        'Parent Email': ['user_info', 'parent_email'],
        'Parent Phone': ['user_info', 'parent_phone'],
    }

    const csv_escape_string = str => {
        return str.replace(',', ';')
    }

    // a recursive property accessor
    const getR = (object, key_array) => {
        let ret_val
        if (key_array.length === 1) {
            ret_val = object[key_array[0]]
        } else if (key_array.length === 2) {
            ret_val = object[key_array[0]] && object[key_array[0]][key_array[1]]
        } else {
            let last_value = object
            for (const key of key_array) {
                if (last_value === undefined) return
                last_value = last_value[key]
            }
            ret_val = last_value
        }

        // to prevent undefined values from being joined into a CSv string
        if (ret_val === undefined) ret_val = ''

        return ret_val
    }

    // conversion logic
    const csvRows = []
    csvRows.push(
        Object.keys(COLUMN_MAP).join(',')
    )
    const COLUMN_KEYS = Object.values(COLUMN_MAP)
    for (const userItem of users_json) {
        const csvItems = []
        for (const key_array of COLUMN_KEYS) {
            csvItems.push(csv_escape_string(getR(userItem, key_array)))
        }
        csvRows.push(csvItems.join(','))
    }
    const csvText = csvRows.join('\r\n')

    return csvText
}

module.exports = json_to_csv

