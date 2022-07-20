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
	TextWithTooltip,
	Padding,
	Icon
} from '@zextras/carbonio-design-system';
import { TFunction } from 'i18next';
import { concat, filter, map } from 'lodash';
import { getTags, ZIMBRA_STANDARD_COLORS } from '@zextras/carbonio-shell-ui';
import ModalFooter from '../secondary-bar/commons/modal-footer';
import { ModalHeader } from '../secondary-bar/commons/modal-header';
import KeywordRow, { KeywordState } from './parts/keyword-row';
import TagRow from './parts/tag-row';
import { useDisabled, useSecondaryDisabled } from './parts/use-disable-hooks';

export type Query = Array<{
	label: string;
	value?: string;
	isGeneric?: boolean;
	isQueryFilter?: boolean;
}>;
type AdvancedFilterModalProps = {
	open: boolean;
	onClose: () => void;
	t: TFunction;
	query: Query;
	updateQuery: (arg: any) => void;
};

const AdvancedFilterModal: FC<AdvancedFilterModalProps> = ({
	open,
	onClose,
	t,
	query,
	updateQuery
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
								<TextWithTooltip>{item.name}</TextWithTooltip>
							</Row>
						</Row>
					</Row>
				)
			})),
		[]
	);

	useEffect(() => {
		const updatedQuery = map(
			filter(query, (v) => !/^tag:/.test(v.label) && !v.isQueryFilter),
			(q) => ({ ...q, hasAvatar: false })
		);

		const tagFromQuery = map(
			filter(query, (v) => /^tag:/.test(v.label)),
			(q) => ({ ...q, hasAvatar: true, icon: 'TagOutline' })
		);
		setTag(tagFromQuery);

		setOtherKeywords(updatedQuery);
	}, [query]);

	const totalKeywords = useMemo(
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

	const disabled = useDisabled({ query, queryToBe });
	const secondaryDisabled = useSecondaryDisabled({
		tag,
		totalKeywords
	});
	const resetFilters = useCallback(() => {
		setOtherKeywords([]);
		setTag([]);
	}, []);

	const onConfirm = useCallback(() => {
		const tmp = [...otherKeywords];
		updateQuery(tmp);
		onClose();
	}, [updateQuery, onClose, otherKeywords]);

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

	return (
		<CustomModal open={open} onClose={onClose} maxHeight="90vh" size="medium">
			<Container padding={{ bottom: 'medium' }}>
				<ModalHeader onClose={onClose} title={t('title.advanced_filters', 'Advanced Filters')} />
				<Container padding={{ horizontal: 'medium', vertical: 'small' }}>
					<KeywordRow compProps={keywordRowProps} />
					<TagRow compProps={tagRowProps} />
				</Container>
				<ModalFooter
					onConfirm={onConfirm}
					disabled={disabled}
					secondaryDisabled={secondaryDisabled}
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
