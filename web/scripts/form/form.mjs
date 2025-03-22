import { throttleFn, getElement } from "../utils.mjs";
import { createNamedFields, createEl } from "./fields.mjs";
import { APIs, defaultAPI, matchAPIFromUrl } from "../api/index.mjs";

export class SearchForm {
  /**
   *
   * @param {HTMLFormElement} formEl
   */
  constructor(formEl) {
    this.api = defaultAPI;
    this.formEl = formEl;

    this.fieldsEl = this.#getFieldEl("options", true);
    this.searchResultsEl = this.#getFieldEl("results", true);
    this.urlInputEl = this.#getFieldEl("url");

    const apiNameEl = this.#getFieldEl("apiName");
    apiNameEl.append(
      ...Object.keys(APIs).map(
        (apiName) =>
          new Option(apiName, apiName, null, apiName == this.api.name),
      ),
    );
    apiNameEl.addEventListener("input", () => this.updAPI());

    this.addFieldEl = this.#getFieldEl("add-option");
    this.addFieldEl.addEventListener("click", () => {
      this.addField();
    });

    this.formEl.addEventListener("input", () => this.updURL());

    this.addField(this.api.defaultField);
    this.updURL();
  }

  /**
   *
   * @template {boolean} T
   * @param {string} fieldName
   * @param {T} list
   * @returns {T extends true ? HTMLUListElement : (HTMLInputElement | HTMLSelectElement)}
   */
  #getFieldEl(fieldName, list = false) {
    return getElement(
      `[name='${fieldName}']` + (list ? " ul" : ""),
      this.formEl,
    );
  }

  updURL() {
    const { params = {} } = this.data;
    this.urlInputEl.value = this.api.buildURL(params);
    this.urlInputEl.scrollTo({ left: this.urlInputEl.scrollWidth });
  }

  updFieldsCount() {
    this.addFieldEl.disabled = this.addFieldEl.childElementCount >= this.api.fields.length;
  }

  rstFields() {
    this.fieldsEl.innerHTML = "";
  }

  updAPI() {
    const { apiName } = this.data;
    if (this.api.name == apiName) return;
    this.api = APIs[apiName];
    this.rstFields();
    this.addField(this.api.defaultField);
    this.updURL();
  }

  /**
   * 
   * @param {URL} url 
   */
  updFromURL(url) {
    const api = matchAPIFromUrl(url)
    if (!api) throw new Error("URL doesn't match any API")
    this.api = api
    this.rstFields()
    url.searchParams.forEach((v, k) => {
      if (api.entrypoint.searchParams.has(k)) return
      this.addField(k, v)
    })
    this.updURL()
  }

  /**
   * 
   * @param {string?} name 
   * @param {string?} value 
   * @returns 
   */
  addField(name, value) {
    const fieldRow = document.createElement("li");
    
    let { fieldInputEl, fieldNameEl } = createNamedFields({
      label: "Select API options",
      groupName: "params",
      fields: this.api.fields,
      name,
      value,
    })

    // Update url when field change
    fieldNameEl.addEventListener("change", () => this.updURL(), true)

    // Delete button
    const optRemoveBtnEl = createEl(
      "button", {
        type: 'button',
        onclick: () => {
          fieldRow.remove();
          this.updFieldsCount();
          this.updURL();
        }
    });

    fieldRow.append(fieldNameEl, optRemoveBtnEl, fieldInputEl)
    this.fieldsEl.appendChild(fieldRow)
    this.updFieldsCount()

    return fieldRow
  }

  /**
   * @type {{apiName: string, url: string, search: string, params: Record<string, *>}}
   */
  get data() {
    const data = {};
    new FormData(this.formEl).forEach((v, k) => {
      const keys = k.split(".");
      keys.reduce((acc, name, index) => {
        if (index === keys.length - 1) {
          acc[name] = v;
        } else {
          acc[name] = acc[name] || {};
        }
        return acc[name];
      }, data);
    });
    return data;
  }

  /**
   * @param {(satellites: import("../satellite.mjs").Satellite[]) => void} callback
   */
  set onresults(callback) {
    const search = throttleFn(async () => {
      const { url } = this.data;
      if (!url) return;

      // API call
      this.isLoading = true;
      const satellites = await this.api.search(url);
      this.isLoading = false;

      // Update view
      this.satellites = satellites;

      // Update callback
      callback(satellites);
    })

    this.formEl.addEventListener(
      "submit",
      (ev) => {
        ev.preventDefault()
        search();
      }
    );
  }

  /**
   *
   * @param {boolean} isLoading
   */
  set isLoading(isLoading) {
    this.formEl.classList.toggle("loading", isLoading);
  }

  /**
   *
   * @param {import("../satellite.mjs").Satellite[]} satellites
   */
  set satellites(satellites) {
    this.searchResultsEl.parentElement.dataset.totalItems = satellites.length;
    const rows = satellites.map(({ name }) => {
      const row = document.createElement("li");
      row.innerText = name;
      return row;
    });
    this.searchResultsEl.replaceChildren(...rows);
  }
}
