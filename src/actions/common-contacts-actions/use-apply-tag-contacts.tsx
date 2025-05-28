/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import {
	Action,
	Button,
	Icon,
	Padding,
	Row,
	Text,
	useModal
} from '@zextras/carbonio-design-system';
import { noop, reduce } from 'lodash';
import { useTranslation } from 'react-i18next';

import { useSortedTagsArray } from '@zextras/carbonio-ui-commons';
import { APPLY_TAG_ACTION } from '../../constants/actions';
import { Contact } from '../../legacy/types/contact';
import { createAndApplyTag, TagsDropdownItem } from '../../legacy/ui-actions/tag-actions';

export const useApplyTagsToContact = (contact: Contact): Action => {
	const tags = useSortedTagsArray();
	const { createModal, closeModal } = useModal();
	const [t] = useTranslation();
	const tagItem = reduce(
		tags,
		(acc, v) => {
			const item = {
				id: v.id,
				label: v.name,
				icon: 'TagOutline',
				keepOpen: true,
				customComponent: <TagsDropdownItem tag={v} contact={contact} />
			};
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			acc.push(item);
			return acc;
		},
		[]
	);
	const newTag = {
		id: 'new_tag',
		keepOpen: true,
		customComponent: (
			<Button
				label={t('label.new_tag', 'New Tag')}
				type="outlined"
				width="fill"
				size="small"
				onClick={(ev): void => {
					createAndApplyTag({ t, contact, createModal, closeModal }).onClick?.(ev);
				}}
			/>
		)
	};
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	tagItem.push(newTag);

	return {
		id: APPLY_TAG_ACTION.ID,
		items: tagItem,
		label: t('label.tag', 'Tag'),
		icon: APPLY_TAG_ACTION.ICON,
		onClick: noop,
		customComponent: (
			<Row takeAvailableSpace mainAlignment="flex-start">
				<Padding right="small">
					<Icon icon="TagsMoreOutline" />
				</Padding>
				<Row takeAvailableSpace mainAlignment="space-between">
					<Padding right="small">
						<Text>{t('label.tags', 'Tags')}</Text>
					</Padding>
				</Row>
			</Row>
		)
	};
};
