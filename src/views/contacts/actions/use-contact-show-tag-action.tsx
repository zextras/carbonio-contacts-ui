/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { Icon, Padding, Row, Text } from '@zextras/carbonio-design-system';
import { every, includes, noop, reduce } from 'lodash';

import { Action } from '../../../actions/types';
import { ZIMBRA_STANDARD_COLORS } from '../../../carbonio-ui-commons/constants';
import { useTags } from '../../../carbonio-ui-commons/store/zustand/tags';
import { Contact } from '../../../legacy/types/contact';

export const useContactShowTagAction = (contact: Contact): Action | undefined => {
	const tagsFromStore = useTags();
	const triggerSearch = noop;

	// originally in contact-preview-content.jsx
	const tags = useMemo(
		() =>
			reduce(
				tagsFromStore,
				(acc, v) => {
					if (includes(contact.tags, v.id))
						acc.push({
							...v,
							color: ZIMBRA_STANDARD_COLORS[v.color ?? 0].hex,
							label: v.name,
							onClick: () => triggerSearch(v),
							customComponent: (
								<Row takeAvailableSpace mainAlignment="flex-start">
									<Row takeAvailableSpace mainAlignment="space-between">
										<Row mainAlignment="flex-end">
											<Padding right="small">
												<Icon icon="Tag" color={ZIMBRA_STANDARD_COLORS[v.color ?? 0].hex} />
											</Padding>
										</Row>
										<Row takeAvailableSpace mainAlignment="flex-start">
											<Text>{v.name}</Text>
										</Row>
									</Row>
								</Row>
							)
						});
					return acc;
				},
				[] as Array<unknown>
			),
		[contact.tags, tagsFromStore, triggerSearch]
	);
	const tagIcon = useMemo(() => (tags.length > 1 ? 'TagsMoreOutline' : 'Tag'), [tags]);

	const onTagClick = useCallback(() => {
		contact?.tags && triggerSearch(tagsFromStore?.[contact?.tags[0]]);
	}, [contact.tags, triggerSearch, tagsFromStore]);

	const shouldDisplayTagIcon = useMemo(
		(): boolean =>
			contact.tags !== undefined &&
			contact.tags?.length !== 0 &&
			every(contact.tags, (tn) => tn !== ''),
		[contact.tags]
	);

	return shouldDisplayTagIcon
		? {
				id: `tag`,
				icon: tagIcon,
				label: '',
				onClick: onTagClick
			}
		: undefined;
};
