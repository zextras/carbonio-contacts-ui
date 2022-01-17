/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useState, useCallback, useMemo, useEffect } from 'react';
import { CustomModal, Container, ChipInput } from '@zextras/carbonio-design-system';
import { TFunction } from 'i18next';
import { filter, includes, map } from 'lodash';
import ModalFooter from '../secondary-bar/commons/modal-footer';
import { ModalHeader } from '../secondary-bar/commons/modal-header';

type AdvancedFilterModalProps = {
	open: boolean;
	onClose: () => void;
	t: TFunction;
	query: Array<{ label: string; value?: string }>;
	updateQuery: (arg: any) => void;
};
type keywordState = Array<{
	label: string;
	hasAvatar?: boolean;
	value?: string;
	isQueryFilter?: boolean;
	isGeneric?: boolean;
}>;

const AdvancedFilterModal: FC<AdvancedFilterModalProps> = ({
	open,
	onClose,
	t,
	query,
	updateQuery
}): ReactElement => {
	const [otherKeywords, setOtherKeywords] = useState<keywordState>([]);
	const filterQueryArray = useMemo(() => [], []);

	const keywordChipOnAdd = useCallback(
		(label) => ({
			label,
			hasAvatar: false,
			isGeneric: true
		}),
		[]
	);
	const onChange = useCallback((keywords) => {
		setOtherKeywords(keywords);
	}, []);
	useEffect(() => {
		const updatedQuery = map(
			filter(query, (v) => !includes(filterQueryArray, v.value)),
			(q) => ({ ...q, hasAvatar: false })
		);
		setOtherKeywords(updatedQuery);
	}, [query, filterQueryArray]);

	const totalKeywords = useMemo(
		() => filter(otherKeywords, (q) => q.isGeneric === true || q.isQueryFilter === true).length,
		[otherKeywords]
	);

	const disabled = useMemo(() => totalKeywords === 0, [totalKeywords]);

	const resetFilters = useCallback(() => {
		setOtherKeywords([]);
	}, []);

	const onConfirm = useCallback(() => {
		const tmp = [...otherKeywords];
		updateQuery(tmp);
		onClose();
	}, [updateQuery, onClose, otherKeywords]);
	return (
		<CustomModal open={open} onClose={onClose} maxHeight="90vh" size="medium">
			<Container padding={{ bottom: 'medium' }}>
				<ModalHeader onClose={onClose} title={t('title.advanced_filters', 'Advanced Filters')} />
				<Container padding={{ horizontal: 'medium', vertical: 'small' }}>
					<Container padding={{ bottom: 'small', top: 'medium' }}>
						<ChipInput
							placeholder="Keyword"
							background="gray5"
							value={otherKeywords}
							onChange={onChange}
							onAdd={keywordChipOnAdd}
							defaultValue={query}
						/>
					</Container>
				</Container>
				<ModalFooter
					onConfirm={onConfirm}
					disabled={disabled}
					secondaryDisabled={disabled}
					label={t('action.search', 'Search')}
					secondaryLabel={t('action.reset_filters', 'Reset Filters')}
					secondaryAction={resetFilters}
					secondaryBtnType="outlined"
					secondaryColor="primary"
					paddingTop="small"
				/>
			</Container>
		</CustomModal>
	);
};

export default AdvancedFilterModal;
