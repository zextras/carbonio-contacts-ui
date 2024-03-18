/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useEffect, useMemo } from 'react';

import {
	Container,
	IconButton,
	Input,
	Padding,
	Row,
	Select
} from '@zextras/carbonio-design-system';
import { filter, find, map, omit, omitBy, reduce, set } from 'lodash';

import { op } from './form-reducer';
import FormSection from './form-section';

export const ContactEditorRow = ({ children, wrap }) => (
	<Row
		orientation="horizontal"
		mainAlignment="space-between"
		crossAlignment="flex-start"
		width="fill"
		wrap={wrap || 'nowrap'}
	>
		{children}
	</Row>
);

const capitalize = (lower) => lower.replace(/^\w/, (c) => c.toUpperCase());

export const CustomMultivalueField = ({
	name,
	label,
	types,
	typeField,
	typeLabel,
	subFields,
	fieldLabels,
	wrap,
	value,
	dispatch
}) => {
	const typeCounts = useMemo(
		() =>
			reduce(
				types,
				(acc, type) => ({
					...acc,
					[type.value]: filter(value, (v) => v[typeLabel] === type.value).length
				}),
				{}
			),
		[value, typeLabel, types]
	);

	const emptyValue = useMemo(
		() =>
			reduce(
				subFields,
				(acc, val) => set(acc, val, ''),
				typeField ? { [typeField]: types[0].value } : {}
			),
		[subFields, typeField, types]
	);

	const generateNewTypedId = useCallback(
		(type) => {
			const substring = `${type}${capitalize(name)}`;
			const recursiveIdIncrement = (candidateId, increment) => {
				if (value[candidateId]) {
					return recursiveIdIncrement(`${substring}${increment}`, increment + 1);
				}
				return candidateId;
			};
			return recursiveIdIncrement(
				`${substring}${typeCounts[type] > 0 ? typeCounts[type] + 1 : ''}`,
				2
			);
		},
		[value, name, typeCounts]
	);

	const generateNewUntypedId = useCallback(() => {
		const recursiveIdIncrement = (candidateId, increment) => {
			if (value[candidateId] || candidateId === 'email1') {
				return recursiveIdIncrement(`${name}${increment}`, increment + 1);
			}
			return candidateId;
		};
		return recursiveIdIncrement(!value[name] ? name : name + 2, 1);
	}, [value, name]);

	const addValue = useCallback(() => {
		dispatch({
			type: op.setRowInput,
			payload: {
				...value,
				[types && types[0].value ? generateNewTypedId(types[0].value) : generateNewUntypedId()]:
					emptyValue
			},
			name
		});
	}, [dispatch, emptyValue, generateNewTypedId, generateNewUntypedId, name, types, value]);

	const isLastElement = (mulObj) => {
		let count = 0;
		Object.keys(mulObj).forEach((prop) => {
			if (!mulObj[prop].isRemove) {
				count += 1;
			}
		});
		return count === 0;
	};
	const removeValue = useCallback(
		(index) => {
			const newValue = { ...value };
			const obj = newValue[index];
			const updatedObj = { isRemove: 'true' };
			Object.keys(obj).forEach((prop) => {
				prop === 'type' ? (updatedObj.type = obj.type) : (updatedObj[prop] = '');
			});
			newValue[index] = updatedObj;
			dispatch({
				type: op.setRowInput,
				payload: newValue,
				name
			});
		},
		[dispatch, name, value]
	);

	const updateValue = useCallback(
		(newString, subField, id) => {
			if (newString === value[id][subField]) return;
			if (subField === typeField) {
				dispatch({
					type: op.setRowInput,
					payload: {
						...omit(value, [id]),
						[generateNewTypedId(newString)]: {
							...value[id],
							type: newString
						}
					},
					name
				});
			} else {
				dispatch({
					type: op.setRowInput,
					payload: {
						...value,
						[id]: { ...value[id], [subField]: newString }
					},
					name
				});
			}
		},
		[value, name, generateNewTypedId, dispatch, typeField]
	);

	useEffect(() => {
		if (Object.values(value).length === 0 || isLastElement(value)) {
			addValue();
		}
	}, [addValue, value]);
	const filteredValue = omitBy(value, (ele) => ele.isRemove);

	return (
		<FormSection label={label}>
			{map(Object.entries(filteredValue), ([id, item], index) => (
				<ContactEditorRow wrap={wrap ? 'wrap' : 'nowrap'} key={`${label}${id}`}>
					{map(subFields, (subField, subIndex) => (
						<Padding
							right="small"
							top="small"
							key={`${fieldLabels[subIndex]}${id}`}
							style={{ width: wrap ? '32%' : '100%', flexGrow: 1 }}
						>
							<Input
								inputName={name}
								backgroundColor="gray5"
								label={fieldLabels[subIndex]}
								defaultValue={item[subField]}
								onChange={(ev) =>
									dispatch({
										type: op.setSelect,
										payload: { ev: ev.target, id, subField }
									})
								}
							/>
						</Padding>
					))}
					<Container
						style={{ flexGrow: 1, minWidth: typeField ? '12.5rem' : '6.5rem' }}
						width={typeField ? 'calc(32% + 0.5rem)' : '6.5rem'}
						orientation="horizontal"
						mainAlignment="space-between"
						crossAlignment="flex-start"
						padding={{ top: 'small', right: 'small' }}
					>
						<Padding right="small" style={{ width: 'calc(100% - 5.5rem)' }}>
							{typeField && typeLabel && types && types.length > 0 && (
								<Select
									items={types}
									label={typeLabel}
									onChange={(val) => updateValue(val, typeField, id)}
									defaultSelection={find(types, ['value', value[id][typeField]])}
								/>
							)}
						</Padding>
						<Container
							orientation="horizontal"
							mainAlignment="flex-end"
							height="fit"
							width="5.5rem"
							style={{ minWidth: '5.5rem' }}
						>
							{index >= Object.entries(filteredValue).length - 1 ? (
								<>
									<Padding right="small">
										<IconButton
											icon="Plus"
											customSize={{
												iconSize: 'medium',
												paddingSize: 'medium'
											}}
											iconColor="gray6"
											backgroundColor="primary"
											onClick={() => addValue()}
										/>
									</Padding>
									<IconButton
										icon="Minus"
										iconColor="gray6"
										customSize={{
											iconSize: 'medium',
											paddingSize: 'medium'
										}}
										backgroundColor="secondary"
										onClick={() => removeValue(id)}
									/>
								</>
							) : (
								<IconButton
									icon="Minus"
									iconColor="gray6"
									backgroundColor="secondary"
									onClick={() => removeValue(id)}
								/>
							)}
						</Container>
					</Container>
				</ContactEditorRow>
			))}
		</FormSection>
	);
};
