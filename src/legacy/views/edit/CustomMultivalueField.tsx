/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
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
import { capitalize, filter, find, map, omit, omitBy, reduce, set } from 'lodash';

import { op } from 'legacy/views/edit/form-reducer';
import { FormSection } from 'legacy/views/edit/form-section';

type FieldValue = Record<string, string | boolean | undefined>;

type TypeOption = {
	label: string;
	value: string;
};

type CustomMultivalueFieldProps = {
	name: string;
	label: string;
	types?: TypeOption[];
	typeField?: string;
	typeLabel?: string;
	subFields: string[];
	fieldLabels: string[];
	wrap?: boolean;
	value: Record<string, FieldValue>;
	dispatch: (action: { type: string; payload: any; name: string }) => void;
};

export const CustomMultivalueField: React.FC<CustomMultivalueFieldProps> = ({
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
					[type.value]: filter(value, (v) => v[typeLabel ?? ''] === type.value).length
				}),
				{} as Record<string, number>
			),
		[value, typeLabel, types]
	);

	const emptyValue = useMemo(
		() =>
			reduce(
				subFields,
				(acc, val) => set(acc, val, ''),
				typeField && types && types.length > 0 ? { [typeField]: types[0].value } : {}
			),
		[subFields, typeField, types]
	);

	const generateNewTypedId = useCallback(
		(type: string): string => {
			const substring = `${type}${capitalize(name)}`;
			const recursiveIdIncrement = (candidateId: string, increment: number): string => {
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

	const generateNewUntypedId = useCallback((): string => {
		const recursiveIdIncrement = (candidateId: string, increment: number): string => {
			if (value[candidateId] || candidateId === 'email1') {
				return recursiveIdIncrement(`${name}${increment}`, increment + 1);
			}
			return candidateId;
		};
		return recursiveIdIncrement(!value[name] ? name : name + 2, 1);
	}, [value, name]);

	const addValue = useCallback(() => {
		const typeValue = types?.[0]?.value;

		dispatch({
			type: op.setRowInput,
			payload: {
				...value,
				[typeValue ? generateNewTypedId(typeValue) : generateNewUntypedId()]: emptyValue
			},
			name
		});
	}, [dispatch, emptyValue, generateNewTypedId, generateNewUntypedId, name, types, value]);

	const isLastElement = (mulObj: Record<string, FieldValue>): boolean => {
		let count = 0;
		Object.keys(mulObj).forEach((prop) => {
			if (!mulObj[prop].isRemove) {
				count += 1;
			}
		});
		return count === 0;
	};

	const removeValue = useCallback(
		(index: string) => {
			const newValue = { ...value };
			const obj = newValue[index];
			const updatedObj: FieldValue = { isRemove: 'true' };
			Object.keys(obj).forEach((prop) => {
				if (prop === 'type') {
					updatedObj.type = obj.type as string;
				} else {
					updatedObj[prop] = '';
				}
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
		(newString: string, subField: string, id: string) => {
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
				<Row
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					width="fill"
					wrap={wrap ? 'wrap' : 'nowrap'}
					key={`${label}${id}`}
				>
					{map(subFields, (subField, subIndex) => (
						<Padding
							right="small"
							top="small"
							key={`${fieldLabels[subIndex]}${id}`}
							style={{ width: wrap ? '32%' : '100%', flexGrow: 1 }}
						>
							<Input
								inputName={name}
								background="gray5"
								label={fieldLabels[subIndex]}
								defaultValue={item[subField] as string}
								onChange={(ev): void =>
									dispatch({
										type: op.setSelect,
										payload: { ev: ev.target, id, subField },
										name
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
									// Only call updateValue if val is not null; the type is fragile
									onChange={(val): void => {
										if (val !== null) {
											updateValue(val, typeField, id);
										}
									}}
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
											onClick={(): void => addValue()}
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
										onClick={(): void => removeValue(id)}
									/>
								</>
							) : (
								<IconButton
									icon="Minus"
									iconColor="gray6"
									backgroundColor="secondary"
									onClick={(): void => removeValue(id)}
								/>
							)}
						</Container>
					</Container>
				</Row>
			))}
		</FormSection>
	);
};
