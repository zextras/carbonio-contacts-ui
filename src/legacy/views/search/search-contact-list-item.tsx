/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { MouseEventHandler, useCallback, useMemo } from 'react';

import { Container } from '@zextras/carbonio-design-system';
import { replaceHistory, Tag, useTags } from '@zextras/carbonio-shell-ui';
import { includes, reduce } from 'lodash';

import { ZIMBRA_STANDARD_COLORS } from '../../../carbonio-ui-commons/constants/utils';
import { Contact } from '../../types/contact';
import { ItemAvatar } from '../app/folder-panel/item-avatar';
import { ItemContent } from '../app/folder-panel/item-content';

export const SearchContactListItem = ({ item }: { item: Contact }): React.JSX.Element => {
	const tagsFromStore = useTags();

	const folderId = item.parent;
	const tags = useMemo(
		() =>
			reduce(
				tagsFromStore,
				(acc, v) => {
					if (includes(item.tags, v.id))
						acc.push({
							...v,
							// TOFIx: casting to number not to deal with issues in tags. nevertheless the code is working, tags need a refactor
							color: ZIMBRA_STANDARD_COLORS[parseInt(v.color?.toString() ?? '0', 10)]
								.hex as unknown as number
						});
					return acc;
				},
				[] as Array<Tag>
			),
		[item.tags, tagsFromStore]
	);

	const _onClick = useCallback<MouseEventHandler<HTMLDivElement>>(
		(e) => {
			if (!e.isDefaultPrevented()) {
				replaceHistory(`/folder/${folderId}/contacts/${item.id}`);
			}
		},
		[folderId, item.id]
	);
	return (
		<Container orientation="vertical" data-testid={'contact-list-item'} onClick={_onClick}>
			<Container orientation="horizontal" mainAlignment="flex-start">
				<ItemAvatar item={item} isSearch />
				<ItemContent item={item} tags={tags} />
			</Container>
		</Container>
	);
};
