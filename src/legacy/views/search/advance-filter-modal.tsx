/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useState, useCallback, useMemo, useEffect } from 'react';

import {
	CustomModal,
	Container,
	Row,
	Padding,
	Icon,
	Tooltip,
	Text,
	ModalHeader,
	Divider,
	ModalFooter
} from '@zextras/carbonio-design-system';
import { TFunction } from 'i18next';
import { concat, filter, map } from 'lodash';

import KeywordRow, { KeywordState } from './parts/keyword-row';
import TagRow from './parts/tag-row';
import ToggleFilters from './parts/toggle-filters';
import type { Query } from './search-types';
import { ZIMBRA_STANDARD_COLORS } from '../../../carbonio-ui-commons/constants';
import { getTags } from '../../../carbonio-ui-commons/store/zustand/tags';

export type AdvancedFilterModalProps = {
	open: boolean;
	onClose: () => void;
	t: TFunction;
	query: Query;
	isSharedFolderIncludedInitialValue: boolean;
	onSearchConfirm: (request: { query: Query; includeSharedFolders: boolean }) => void;
};

export const AdvancedFilterModal: FC<AdvancedFilterModalProps> = ({
	open,
	onClose,
	t,
	query,
	onSearchConfirm,
	isSharedFolderIncludedInitialValue
}): ReactElement => {
	const [otherKeywords, setOtherKeywords] = useState<KeywordState>([]);
	const [tag, setTag] = useState<KeywordState>([]);
	const tagOptions = useMemo(
		() =>
			map(getTags(), (item) => ({
				...item,
				label: item.name,
				customComponent: (
					<Row takeAvailableSpace mainAlignment="flex-start">
						<Row takeAvailableSpace mainAlignment="space-between">
							<Row mainAlignment="flex-end">
								<Padding right="small">
									<Icon icon="Tag" color={ZIMBRA_STANDARD_COLORS[item.color ?? 0].hex} />
								</Padding>
							</Row>
							<Row takeAvailableSpace mainAlignment="flex-start">
								<Tooltip label={item.name} overflowTooltip>
									<Text>{item.name}</Text>
								</Tooltip>
							</Row>
						</Row>
					</Row>
				)
			})),
		[]
	);
	const [isSharedFolderIncludedTobe, setIsSharedFolderIncludedTobe] = useState(
		isSharedFolderIncludedInitialValue
	);

	useEffect(() => {
		const updatedQuery = map(
			filter(query, (v) => !/^tag:/.test(v.label ?? '') && !v.isQueryFilter),
			(q) => ({ ...q, hasAvatar: false })
		);

		const tagFromQuery = map(
			filter(query, (v) => /^tag:/.test(v.label ?? '')),
			(q) => ({ ...q, hasAvatar: true, icon: 'TagOutline' })
		);
		setTag(tagFromQuery);

		setOtherKeywords(updatedQuery);
	}, [query]);
	useMemo(
		() => filter(otherKeywords, (q) => q.isGeneric === true || q.isQueryFilter === true).length,
		[otherKeywords]
	);
	const queryToBe = useMemo(
		() =>
			concat(
				otherKeywords,

				tag
			),
		[otherKeywords, tag]
	);

	const secondaryDisabled = useMemo(
		() => query.length === 0 && queryToBe.length === 0,
		[query.length, queryToBe.length]
	);

	const resetFilters = useCallback(() => {
		setOtherKeywords([]);
		setTag([]);
	}, []);

	const onConfirm = useCallback(() => {
		const tmp = [...otherKeywords];
		onSearchConfirm({ query: tmp, includeSharedFolders: isSharedFolderIncludedTobe });
		onClose();
	}, [otherKeywords, onSearchConfirm, isSharedFolderIncludedTobe, onClose]);

	const keywordRowProps = useMemo(
		() => ({
			otherKeywords,
			setOtherKeywords,
			query
		}),
		[otherKeywords, query]
	);
	const tagRowProps = useMemo(
		() => ({
			tagOptions,
			tag,
			setTag
		}),
		[tagOptions, tag, setTag]
	);

	const toggleFiltersProps = useMemo(
		() => ({
			query,
			setIsSharedFolderIncludedTobe,
			isSharedFolderIncludedTobe
		}),
		[query, isSharedFolderIncludedTobe]
	);
	return (
		<CustomModal
			open={open}
			onClose={onClose}
			maxHeight="90vh"
			size="medium"
			data-testid={'advanced-filter-modal'}
		>
			<ModalHeader
				onClose={onClose}
				title={t('title.advanced_filters', 'Advanced Filters')}
				showCloseIcon
			/>
			<Divider />
			<Container padding={{ horizontal: 'medium', vertical: 'small' }}>
				<ToggleFilters compProps={toggleFiltersProps} />
				<KeywordRow compProps={keywordRowProps} />
				<TagRow compProps={tagRowProps} />
			</Container>
			<Divider />
			<ModalFooter
				confirmLabel={t('action.search', 'Search')}
				confirmDisabled={queryToBe.length === 0}
				onConfirm={onConfirm}
				onSecondaryAction={resetFilters}
				secondaryActionDisabled={secondaryDisabled}
				secondaryActionLabel={t('action.reset_filters', 'Reset Filters')}
			></ModalFooter>
		</CustomModal>
	);
};

export default AdvancedFilterModal;
