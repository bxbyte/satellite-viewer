import { throttleFn, getElement } from "../utils.mjs";
import { createInput, createSelect } from "./inputs.mjs";
import { APIs, defaultAPI } from "../api/index.mjs";

export class SearchForm {
  /**
   *
   * @param {HTMLFormElement} formEl
   */
  constructor(formEl) {
    this.api = defaultAPI;
    this.formEl = formEl;

    this.optionsEl = this.#getFieldEl("options", true);
    this.searchResultsEl = this.#getFieldEl("results", true);
    this.urlInputEl = this.#getFieldEl("url");

    const apiNameEl = this.#getFieldEl("apiName");
    apiNameEl.append(
      ...Object.keys(APIs).map(
        (apiName) =>
          new Option(apiName, apiName, null, apiName == this.api.name),
      ),
    );
    apiNameEl.addEventListener("input", () => this.refreshAPI());

    this.addOptionEl = this.#getFieldEl("add-option");
    this.addOptionEl.addEventListener("click", () => {
      this.addOption();
    });

    this.formEl.addEventListener("input", () => this.refreshURL());

    this.resetOptions();
    this.refreshURL();
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

  refreshURL() {
    const { params = {} } = this.data;
    this.urlInputEl.value = this.api.buildURL(params);
    this.urlInputEl.scrollTo({ left: this.urlInputEl.scrollWidth });
  }

  refreshOptions() {
    this.addOptionEl.disabled =
      this.optionsEl.childElementCount >= this.api.optionsName.size;
    this.refreshURL();
  }

  resetOptions() {
    this.optionsEl.innerHTML = "";
    this.addOption();
    this.refreshOptions();
  }

  refreshAPI() {
    const { apiName } = this.data;
    if (this.api.name == apiName) return;
    this.api = APIs[apiName];
    this.resetOptions();
  }

  /**
   * @type {SearchForm['api']['options']}
   */
  get availableApiOptions() {
    const { params = {} } = this.data;
    return Object.fromEntries(
      [...this.api.optionsName.difference(new Set(Object.keys(params)))].map(
        (k) => [k, this.api.options[k]],
      ),
    );
  }

  addOption() {
    const optRowEl = this.optionsEl.appendChild(document.createElement("li"));

    const select = optRowEl.appendChild(createSelect("Select an option", "*"));
    const setOptionValues = () => select.setOptions(this.availableApiOptions);
    select.addEventListener("focus", setOptionValues, false);
    setOptionValues();

    const optRemoveBtnEl = optRowEl.appendChild(
      document.createElement("button"),
    );
    optRemoveBtnEl.type = "button";
    optRemoveBtnEl.addEventListener("click", () => {
      optRowEl.remove();
      this.refreshOptions();
    });

    // Placeholder before choosing option
    let optInputEl = optRowEl.appendChild(
      createInput({ disabled: true, placeholder: "Option value" }),
    );
    const setOptionInput = () => {
      const option = this.api.options[select.value];
      if (!option) return;

      const newOptInputEl = option.attrs
        ? createInput({
            name: `params.${select.value}`,
            ...option.attrs,
          })
        : createSelect("Option value", `params.${select.value}`, option.values);

      optInputEl.replaceWith(newOptInputEl);
      optInputEl = newOptInputEl;
    };
    select.addEventListener("change", setOptionInput);
    setOptionInput();

    // Update option list
    this.refreshOptions();
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
    this.formEl.addEventListener(
      "submit",
      throttleFn(async () => {
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
      }),
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
