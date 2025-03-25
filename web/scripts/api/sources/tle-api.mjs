import { Satellite } from "../../satellite.mjs"
import { API } from "../api.mjs"

export const TleApi = new API({
	name: "TLE API",
	entrypoint: new URL("https://tle.ivanstanojevic.me/api/tle"),
	requiredParam: "search",
	params: [
		{
			label: "Search by name",
			field: {
				name: "search",
				type: "text",
				placeholder: "e.g. ISS",
			},
		},
		{ // For future functionalities
			label: "Sort by",
			field: {
				name: "sort",
				values: [
					{ value: 'id', label: 'Identifier' },
					{ value: 'name', label: 'Name' },
					{ value: 'popularity', label: 'Popularity' },
					{ value: 'inclination', label: 'Inclination' },
					{ value: 'eccentricity', label: 'Eccentricity' },
					{ value: 'period', label: 'Period' },
				]
			},
		},
		{
			label: "Sort direction",
			field: {
				name: "sort-dir",
				values: [
					{ value: 'asc', label: 'Ascending' },
					{ value: 'desc', label: 'Descending' },
				]
			},
		},
	],
	load: async (res) =>
		(await res.json()).member.map(({ line2, name }) => {
			const satellite = Satellite.from2LE(line2)
			satellite.name = name
			return satellite
		}),
})
