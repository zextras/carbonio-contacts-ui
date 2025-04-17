/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, useState } from 'react';

import {
	Button,
	Dropdown,
	Icon,
	Padding,
	Row,
	Tooltip,
	Text
} from '@zextras/carbonio-design-system';
import { every, find, includes, reduce } from 'lodash';

import { ZIMBRA_STANDARD_COLORS } from '../carbonio-ui-commons/constants';
import { useRunSearchIntegration } from '../carbonio-ui-commons/integrations/search/use-run-search';
import { useSortedTagsArray } from '../carbonio-ui-commons/store/zustand/tags';
import { Tag } from '../carbonio-ui-commons/types/tags';
import { Contact } from '../legacy/types/contact';
import { useTagExist } from '../legacy/ui-actions/tag-actions';

interface ActionTagButtonProps {
	contact: Contact;
}

export const ActionTagButton: React.FC<ActionTagButtonProps> = ({
	contact
}): React.JSX.Element | undefined => {
	const tagsFromStore = useSortedTagsArray();
	const contactTagId = contact?.tags?.[0];
	const contactTag = find(tagsFromStore, (tag) => tag.name === contactTagId);
	const label = useMemo(() => contactTag?.name, [contactTag?.name]);
	const runSearch = useRunSearchIntegration();
	const triggerTagSearch = useCallback(
		(tagToSearch: Tag) =>
			runSearch?.(
				[
					{
						avatarBackground: ZIMBRA_STANDARD_COLORS[tagToSearch?.color ?? 0].hex,
						avatarIcon: 'Tag',
						background: 'gray2',
						hasAvatar: true,
						// isGeneric: false,
						// isQueryFilter: true,
						label: `tag:${tagToSearch?.name}`,
						value: `tag:"${tagToSearch?.name}"`
					}
				],
				'contacts'
			),
		[runSearch]
	);

	const tags = useMemo(
		() =>
			reduce(
				tagsFromStore,
				(acc: any, v) => {
					if (includes(contact.tags, v.id))
						acc.push({
							...v,
							color: ZIMBRA_STANDARD_COLORS[v.color ?? 0].hex,
							label: v.name,
							onClick: () => triggerTagSearch(v),
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
				[]
			),
		[contact.tags, tagsFromStore, triggerTagSearch]
	);
	const isTagInStore = useTagExist(tags);
	const isDisabled = useMemo(
		() => contact.tags && contact.tags.length > 1 && isTagInStore,
		[contact.tags, isTagInStore]
	);

	const icon = useMemo(() => (tags.length > 1 ? 'TagsMoreOutline' : 'Tag'), [tags]);
	const color = useMemo(() => (tags.length === 1 ? tags[0].color : 'text'), [tags]);

	const onClick = useCallback(() => {
		contact?.tags && triggerTagSearch(contactTag as Tag);
	}, [contact?.tags, triggerTagSearch, contactTag]);

	const [showDropdown, setShowDropdown] = useState(false);
	const toggleDropdown = useCallback(
		(ev: React.MouseEvent<HTMLButtonElement, MouseEvent> | KeyboardEvent) => {
			ev.stopPropagation();
			setShowDropdown((o) => !o);
		},
		[]
	);

	const onDropdownClose = useCallback(() => {
		setShowDropdown(false);
	}, []);

	const showMultiTagIcon = useMemo(() => tags.length > 1, [tags]);

	const showTagIcon = useMemo(
		() =>
			contact.tags &&
			contact.tags?.length !== 0 &&
			!showMultiTagIcon &&
			isTagInStore &&
			every(contact.tags, (tn) => tn !== ''),
		[isTagInStore, contact.tags, showMultiTagIcon]
	);

	if (showMultiTagIcon || showTagIcon) {
		const commonButton = (
			<Button
				data-testid="TagIconButton"
				type="ghost"
				size="medium"
				icon={icon}
				color={color}
				onClick={showMultiTagIcon ? toggleDropdown : onClick}
			/>
		);

		return showMultiTagIcon ? (
			<Dropdown items={tags} forceOpen={showDropdown} onClose={onDropdownClose}>
				{commonButton}
			</Dropdown>
		) : (
			<Tooltip label={label} disabled={isDisabled}>
				{commonButton}
			</Tooltip>
		);
	}
	return <></>;
};
