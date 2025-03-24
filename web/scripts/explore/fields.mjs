import { createEl } from "../utils.mjs"

/**
 * @typedef {{ label: string }} FieldBase
 */

/**
 * @template {keyof HTMLElementTagNameMap} T
 * @typedef {FieldBase & { name: string, value?: string } & HTMLElementTagNameMap[T]} Field
 */

/**
 * Create a select field
 *
 * @typedef {FieldBase & { value: string }} SelectFieldValue
 * @typedef {Field<'select'> & { values: SelectFieldValue[] }} SelectField
 *
 * @param {SelectField} field
 * @returns {HTMLSelectElement & { setValues: (values: SelectFieldValue[]) => void }}
 */
export function createSelectField({ label, value: defaultValue, values, ...field }) {
	const el = createEl("select", { required: true, ...field })

	const valuePlaceholder = new Option(label, "", true)
	valuePlaceholder.hidden = true

	/**
	 * Yeah not the greatest way to do this but it just work
	 * @param {SelectFieldValue[]} values
	 */
	el.setValues = (values) => {
		el.replaceChildren(
			valuePlaceholder,
			...el.selectedOptions,
			...values.map(({ label, value }) => new Option(label, value, false, value == defaultValue))
		)
	}

	if (values) el.setValues(values)

	return el
}

/**
 * Create input field
 * @param {Field<'input'>} field
 */
export function createInputField(field) {
	const inputEl = createEl("input", { required: true, ...field })
	return inputEl
}

/**
 * Create either an input or select field
 * @param {SelectField | Field<'input'>} field
 */
function createField(field) {
	return field.values ? createSelectField(field) : createInputField(field)
}

/**
 * Create a field pair of key-value:
 * the key is defined in a select field and the value in a field depending on the key.
 *
 * @typedef {FieldBase & { groupName: string, name: string, value: string, fieldGroup: Set<number>, fields: (FieldBase & { field: Parameters<typeof createField>[0] })[]}} NamedFields
 * @param {NamedFields} field
 */
export function createNamedFields({ label, groupName, name, value, fields }) {
	const fieldNameEl = createSelectField({
		label,
		value: fields.findIndex((f) => f.field.name == name),
	})

	function setNames() {
		fieldNameEl.setValues(
			fields
				.map(({ field, ...attrs }, i) => ({
					...attrs,
					value: i,
					used: fieldNameEl.form && new FormData(fieldNameEl.form).has(`${groupName}.${field.name}`),
				}))
				.filter(({ used }) => !used)
		)
	}

	setNames()
	fieldNameEl.addEventListener("focus", setNames, true)

	/**
	 * Create new field based on the selected named field
	 * @param {Parameters<typeof createField>?} args
	 */
	function createNewField(args) {
		// Update input field
		const {
			field: { name, ...field },
		} = fields[fieldNameEl.value]
		return createField({
			name: `${groupName}.${name}`,
			...field,
			...args,
		})
	}

	let fieldInputEl = fields[fieldNameEl.value]
		? createNewField({ value })
		: createInputField({
				// Placeholder
				disabled: true,
				placeholder: "Option value",
			})

	// Set defaults
	fieldNameEl.addEventListener(
		"change",
		() => {
			const newFieldEl = createNewField()
			fieldInputEl.replaceWith(newFieldEl)
			fieldInputEl = newFieldEl
		},
		true
	)

	return {
		fieldNameEl,
		fieldInputEl,
	}
}
