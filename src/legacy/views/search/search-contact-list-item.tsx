/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { MouseEventHandler, useCallback, useMemo } from 'react';

import { Container } from '@zextras/carbonio-design-system';
import { noop } from 'lodash';
import { useNavigate } from 'react-router-dom';

import { useTags } from '../../../carbonio-ui-commons/store/zustand/tags';
import { getTagsArray } from '../../helpers/tags';
import { Contact } from '../../types/contact';
import { ItemAvatar } from '../app/folder-panel/item-avatar';
import { ItemContent } from '../app/folder-panel/item-content';

export const SearchContactListItem = ({ item }: { item: Contact }): React.JSX.Element => {
	const tagsFromStore = useTags();
	const navigate = useNavigate();
	const folderId = item.parent;
	const tags = useMemo(() => getTagsArray(tagsFromStore, item.tags), [item.tags, tagsFromStore]);

	const _onClick = useCallback<MouseEventHandler<HTMLDivElement>>(
		(e) => {
			if (!e.isDefaultPrevented()) {
				navigate(`../folder/${folderId}/contacts/${item.id}`);
			}
		},
		[folderId, item.id, navigate]
	);
	return (
		<Container orientation="vertical" data-testid={'search-contact-list-item'} onClick={_onClick}>
			<Container orientation="horizontal" mainAlignment="flex-start">
				<ItemAvatar item={item} selected={false} selecting={false} toggle={noop} isSearch />
				<ItemContent item={item} tags={tags} />
			</Container>
		</Container>
	);
};
