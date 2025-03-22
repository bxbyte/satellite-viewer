/**
 * @typedef {{ label: string }} FieldBase
 */

/**
 * @template {keyof HTMLElementTagNameMap} T
 * @typedef {FieldBase & { name: string } & HTMLElementTagNameMap[T]} Field
 */

/**
 * @template {keyof HTMLElementTagNameMap} T
 * @param {T} type 
 * @param {HTMLElementTagNameMap[T]} params
 * @returns {HTMLElementTagNameMap[T]}
 */
export function createEl(type, params) {
  const el = document.createElement(type);
  Object.entries(params).forEach(([k, v]) => el[k] = v)
  return el
}

/**
 * @typedef {FieldBase & { value: string, selected: boolean }} SelectFieldValue
 * @typedef {Field<'select'> & { values: SelectFieldValue[] }} SelectField
 * 
 * @param {SelectField} field
 * @returns {HTMLSelectElement & { setValues: (values: SelectFieldValue[]) => void }}
 */
export function createSelectField({label, values, ...field}) {
  const el = createEl("select", { required: true, ...field })

  const valuePlaceholder = new Option(label, "", true);
  valuePlaceholder.hidden = true;

  /**
   * 
   * @param {SelectFieldValue[]} values 
   */
  el.setValues = (values) => {
    el.replaceChildren(
      valuePlaceholder,
      ...el.selectedOptions,
      ...values.map(
          ({label, value, selected}) =>
          new Option(label, value, false, selected),
      ),
    );
  };

  if (values) el.setValues(values);

  return el;
}


/**
 * 
 * @param {Field<'input'>} field 
 */
export function createInputField(field) {
  return createEl("input", { required: true, ...field })
}

/**
 * 
 * @param {SelectField | Field<'input'>} field 
 */
function createField(field) {
  return field.values
    ? createSelectField(field)
    : createInputField(field)
}

/**
 * @typedef {FieldBase & { groupName: string, fieldGroup: Set<number>, fields: FieldBase & { field: Parameters<typeof createField>[0][] }}} NamedFields
 * @param {NamedFields} field 
 */
export function createNamedFields({label, groupName, fieldGroup = new Set(), fields}) {
  const fieldNameEl = createSelectField({ label });

  const setNames = () => {
    fieldNameEl.setValues(
      fields
        .map(({field, ...attrs}, i) => ({
          ...attrs,
          value: i
        }))
        .filter((_, i) => !fieldGroup.has(i))
      )
  };

  // Placeholder before choosing option
  let fieldNameValue,
    fieldInputEl = createInputField({
      disabled: true,
      placeholder: "Option value",
    });

  const setField = () => {
    if (!fieldNameEl.value) return;

    // Update input field
    const { field: {name, ...field} } = fields[fieldNameEl.value];
    const newFieldEl = createField({
      name: `${groupName}.${name}`,
      ...field,
    })
    fieldInputEl.replaceWith(newFieldEl);
    fieldInputEl = newFieldEl;
    
    // Update group
    fieldGroup.delete(fieldNameValue)
    fieldNameValue = parseInt(fieldNameEl.value)
    fieldGroup.add(fieldNameValue)
  };

  fieldNameEl.addEventListener("focus", setNames, true);
  fieldNameEl.addEventListener("change", setField, true);

  // Set defaults
  setNames();
  setField()

  return {
    fieldGroup,
    fieldNameEl,
    fieldInputEl
  }
}