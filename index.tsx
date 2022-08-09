import { Checkbox, Group, MantineColor, MultiSelect, MultiSelectProps, SelectItem, Text } from '@mantine/core'
import { useEffect, useMemo, useState } from 'react'
import { filter, intersection, map, union, uniq } from 'lodash'

const _elementsInGroups = (data, groupBy) =>
	map(filter(data, { groupBy }).filter((option) => option.value !== groupBy), 'value')

interface MultiSelectCheckboxProps {
	dataInit:Array<SelectItem>,
	checkable: Boolean,
	checkableGroup: Boolean,
	checkboxColor:MantineColor,
	multiSelectLabel:String
}

export default function SelectCheckboxComponent({
	dataInit = [],
	checkable = false,
	checkableGroup = false,
	checkboxColor = 'dark',
	multiSelectLabel = 'selected items',
	...props
}: Partial<MultiSelectProps & MultiSelectCheckboxProps>) {
	const [ data, setData ] = useState(dataInit)
	const [ selected, setSelected ] = useState([])
	const [ allGroups, setAllGroups ] = useState([])

	useEffect(
		() => {
			let dataGroup = []
			if (!checkableGroup) setData(dataInit)

			if (checkableGroup) {
				dataGroup = dataInit.map((el) => {
					const { group, ...otherData } = el
					return { ...otherData, groupBy: group ? group : 'other' }
				})

				let groups = uniq(map(dataGroup, 'groupBy'))

				setAllGroups(groups)

				groups = groups.map((group) => ({ value: group, label: group, groupBy: group, isGroup: true }))

				const groupAllData = groups
					.map((group) => [ { ...group }, ...filter(dataGroup, { groupBy: group.groupBy }) ])
					.flat()

				setData(groupAllData)
			}
		},
		[ dataInit, checkableGroup ]
	)

	const SelectItem = ({ image, label, value, description, groupBy, isGroup = false, ...others }) => {
		const selectedOption = selected.includes(value)

		const optionsInGroups = _elementsInGroups(data, groupBy)

		const intersectionOption = intersection(optionsInGroups, selected)

		return (
			<Group {...others}>
				<Checkbox
					color={checkboxColor}
					checked={isGroup ? intersectionOption.length : selectedOption}
					size="sm"
					ml={isGroup ? undefined : checkableGroup ? 'md' : undefined}
					onChange={() => {}}
					styles={{ input: { cursor: 'pointer' } }}
				/>

				<Text size="sm" color="dimmed">
					{label} {isGroup ? `(${optionsInGroups.length})` : null}
				</Text>
			</Group>
		)
	}

	const ValueComponent = ({ value }) => {
		const isFirst = selected[0] === value
		if (!isFirst) return null

		return (
			<Text size="sm" color="dimmed">
				{selected.length} {multiSelectLabel}
			</Text>
		)
	}

	const allProps = checkable
		? {
				searchable: true,
        value:selected,
				itemComponent: SelectItem,
				onChange: (ArrEl) => {
					if (!checkable) {
						setSelected(ArrEl)
						return
					}
					const selectedGroup = intersection(allGroups, ArrEl)[0]
					if (selectedGroup) {
						const elementsInGroups = _elementsInGroups(data, selectedGroup)
						const intersectionOption = intersection(elementsInGroups, selected)

						let allData = union(selected, elementsInGroups)
						if (intersectionOption.length && selectedGroup) {
							allData = allData.filter((el) => !elementsInGroups.includes(el))
						}

						setSelected(allData)
					} else {
						setSelected(ArrEl)
					}
				},
				filter: (value, selected, item) =>
					value ? item.value.toLowerCase().includes(value.toLowerCase()) : true,
				valueComponent: selected.length > 1 ? ValueComponent : undefined,
				...props,
			}
		: props

	return (
		<MultiSelect
			data={data}
			label="Your favorite frameworks/libraries"
			placeholder="Pick all that you like"
			{...allProps}
		/>
	)
}
