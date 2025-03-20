/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ComponentType, ReactElement, useCallback, useMemo, useState } from 'react';

import {
	Row,
	Text,
	Padding,
	Icon,
	Checkbox,
	useModal,
	useSnackbar,
	Action
} from '@zextras/carbonio-design-system';
import { TFunction } from 'i18next';
import { every, find, includes, map, noop, reduce } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { TaggableItem } from '../../actions/types';
import { ZIMBRA_STANDARD_COLORS } from '../../carbonio-ui-commons/constants/utils';
import { useTags } from '../../carbonio-ui-commons/store/zustand/tags';
import { Tag, Tags } from '../../carbonio-ui-commons/types/tags';
import { contactAction } from '../store/actions/contact-action';
import { Contact } from '../types/contact';
import { TagsActionsType } from '../types/tags';
import CreateUpdateTagModal from '../views/secondary-bar/parts/tags/create-update-tag-modal';
import DeleteTagModal from '../views/secondary-bar/parts/tags/delete-tag-modal';
import { ItemType } from '../views/secondary-bar/parts/tags/types';

export type TagsActions = {
	id: string;
	icon: string;
	label: string;
	onClick?: (arg: React.SyntheticEvent<HTMLElement> | KeyboardEvent) => void;
	items?: Array<{
		customComponent: ComponentType;
		id: string;
		icon: string;
		label: string;
	}>;
};

export type TagsActionsParams = {
	t: TFunction;
	createModal?: ReturnType<typeof useModal>['createModal'];
	closeModal?: ReturnType<typeof useModal>['closeModal'];
	createSnackbar?: ReturnType<typeof useSnackbar>;
	items?: TagsActions;
	tag?: ItemType;
	contact?: Contact;
};

export const createAndApplyTag = ({
	t,
	contact,
	createModal,
	closeModal
}: TagsActionsParams): TagsActions => ({
	id: TagsActionsType.NEW,
	icon: 'TagOutline',
	label: t('label.create_tag', 'Create Tag'),
	onClick: (e): void => {
		if (e) {
			e.stopPropagation();
		}

		const modalId = 'create-and-apply-tag';
		createModal?.(
			{
				id: modalId,
				children: (
					<CreateUpdateTagModal onClose={(): void => closeModal?.(modalId)} contact={contact} />
				)
			},
			true
		);
	}
});
export const createTag = ({ t, createModal, closeModal }: TagsActionsParams): TagsActions => ({
	id: TagsActionsType.NEW,
	icon: 'TagOutline',
	label: t('label.create_tag', 'Create Tag'),
	onClick: (e): void => {
		if (e) {
			e.stopPropagation();
		}
		const modalId = 'create-tag';
		createModal?.(
			{
				id: modalId,
				children: <CreateUpdateTagModal onClose={(): void => closeModal?.(modalId)} />
			},
			true
		);
	}
});

export const editTag = ({ t, createModal, closeModal, tag }: TagsActionsParams): TagsActions => ({
	id: TagsActionsType.EDIT,
	icon: 'Edit2Outline',
	label: t('label.edit_tag', 'Edit Tag'),
	onClick: (e): void => {
		if (e) {
			e.stopPropagation();
		}
		const modalId = 'edit-tag';
		createModal?.(
			{
				id: modalId,
				children: (
					<CreateUpdateTagModal onClose={(): void => closeModal?.(modalId)} tag={tag} editMode />
				)
			},
			true
		);
	}
});

export const deleteTag = ({ t, createModal, closeModal, tag }: TagsActionsParams): TagsActions => ({
	id: TagsActionsType.DELETE,
	icon: 'Untag',
	label: t('label.delete_tag', 'Delete Tag'),
	onClick: (e): void => {
		if (e) {
			e.stopPropagation();
		}
		const modalId = 'delete-tag';
		tag &&
			createModal?.(
				{
					id: modalId,
					children: <DeleteTagModal onClose={(): void => closeModal?.(modalId)} tag={tag} />
				},
				true
			);
	}
});

export const TagsDropdownItem = ({
	tag,
	contact
}: {
	tag: Tag;
	contact: Contact;
}): ReactElement => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const [checked, setChecked] = useState(includes(contact.tags, tag.id));
	const [isHovering, setIsHovering] = useState(false);
	const toggleCheck = useCallback(
		(value: boolean) => {
			setChecked((c) => !c);
			contactAction({
				op: value ? '!tag' : 'tag',
				contactsIDs: [contact.id],
				tagName: tag.name
			})
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				.then((res: any) => {
					createSnackbar({
						key: `tag`,
						replace: true,
						hideButton: true,
						severity: 'info',
						label: value
							? t('snackbar.tag_removed', {
									tag: tag.name,
									defaultValue: '"{{tag}}" tag removed'
								})
							: t('snackbar.tag_applied', {
									tag: tag.name,
									defaultValue: '"{{tag}}" tag applied'
								}),
						autoHideTimeout: 3000
					});
				})
				.catch(() => {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					createSnackbar({
						key: `tag`,
						replace: true,
						severity: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000,
						hideButton: true
					});
				});
		},
		[contact.id, createSnackbar, t, tag.name]
	);
	const tagColor = useMemo(() => ZIMBRA_STANDARD_COLORS[tag.color || 0].hex, [tag.color]);
	const tagIcon = useMemo(() => (checked ? 'Tag' : 'TagOutline'), [checked]);
	const tagIconOnHovered = useMemo(() => (checked ? 'Untag' : 'Tag'), [checked]);

	return (
		<Row
			takeAvailableSpace
			mainAlignment="flex-start"
			onClick={(): void => toggleCheck(checked)}
			onMouseEnter={(): void => setIsHovering(true)}
			onMouseLeave={(): void => setIsHovering(false)}
		>
			<Padding right="small">
				<Checkbox value={checked} />
			</Padding>
			<Row takeAvailableSpace mainAlignment="space-between">
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text>{tag.name}</Text>
				</Row>
				<Row mainAlignment="flex-end">
					<Icon icon={isHovering ? tagIconOnHovered : tagIcon} color={tagColor} />
				</Row>
			</Row>
		</Row>
	);
};

const MultiSelectTagsDropdownItem = ({
	tag,
	ids,
	tags,
	items,
	deselectAll,
	folderId
}: {
	tag: Tag;
	items: Array<TaggableItem>;
	ids: string[];
	tags: Tags;
	multiSelect?: boolean;
	deselectAll?: () => void;
	folderId?: string;
}): ReactElement => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const [isHovering, setIsHovering] = useState(false);
	const navigate = useNavigate();

	const tagsToShow = reduce(
		tags,
		(acc: Array<string>, v: Tag) => {
			const values = map(items, (c) => includes(c.tags, v.id));
			if (every(values)) acc.push(v.id);
			return acc;
		},
		[]
	);

	const [checked, setChecked] = useState(includes(tagsToShow, tag.id));

	const toggleCheck = useCallback(
		(value: boolean) => {
			setChecked((c) => !c);
			contactAction({
				op: value ? '!tag' : 'tag',
				contactsIDs: ids,
				tagName: tag.name
			})
				.then(() => {
					deselectAll && deselectAll();
					navigate(`../folder/${folderId}/`, { replace: true });
					createSnackbar({
						key: `tag`,
						replace: true,
						hideButton: true,
						severity: 'info',
						label: value
							? t('snackbar.tag_removed', {
									tag: tag.name,
									defaultValue: '"{{tag}}" tag removed'
								})
							: t('snackbar.tag_applied', {
									tag: tag.name,
									defaultValue: '"{{tag}}" tag applied'
								}),
						autoHideTimeout: 3000
					});
				})
				.catch(() => {
					createSnackbar({
						key: `tag`,
						replace: true,
						severity: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000,
						hideButton: true
					});
				});
		},
		[ids, tag.name, deselectAll, navigate, folderId, createSnackbar, t]
	);

	const tagIcon = useMemo(() => (checked ? 'Tag' : 'TagOutline'), [checked]);
	const tagIconOnHovered = useMemo(() => (checked ? 'Untag' : 'Tag'), [checked]);
	const tagColor = useMemo(() => ZIMBRA_STANDARD_COLORS[tag.color || 0].hex, [tag.color]);
	return (
		<Row
			takeAvailableSpace
			mainAlignment="flex-start"
			onMouseEnter={(): void => setIsHovering(true)}
			onMouseLeave={(): void => setIsHovering(false)}
			onClick={(ev: React.SyntheticEvent<EventTarget>): void => {
				ev.preventDefault();
				toggleCheck(checked);
			}}
		>
			<Padding right="small">
				<Checkbox value={checked} />
			</Padding>
			<Row takeAvailableSpace mainAlignment="space-between">
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text>{tag.name}</Text>
				</Row>
				<Row mainAlignment="flex-end">
					<Icon icon={isHovering ? tagIconOnHovered : tagIcon} color={tagColor} />
				</Row>
			</Row>
		</Row>
	);
};

export const applyMultiTag = ({
	t,
	tags,
	ids,
	itemsToTag,
	deselectAll,
	folderId
}: {
	t: TFunction;
	itemsToTag: Array<TaggableItem>;
	tags: Tags;
	ids: string[];
	deselectAll?: () => void;
	folderId?: string;
}): Action => {
	const tagItem = reduce(
		tags,
		(acc, v: Tag) => {
			const item = {
				id: v.id,
				label: v.name,
				icon: 'TagOutline',
				keepOpen: true,
				customComponent: (
					<MultiSelectTagsDropdownItem
						tag={v}
						tags={tags}
						ids={ids}
						items={itemsToTag}
						deselectAll={deselectAll}
						folderId={folderId}
					/>
				)
			};
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			acc.push(item);
			return acc;
		},
		[]
	);

	return {
		id: TagsActionsType.APPLY,
		items: tagItem,
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

export const useGetTagsActions = ({ tag, t }: TagsActionsParams): Array<TagsActions> => {
	const { createModal, closeModal } = useModal();
	const createSnackbar = useSnackbar();
	return useMemo(
		() => [
			createTag({ t, createModal, closeModal }),
			editTag({ t, createModal, closeModal, tag }),
			deleteTag({ t, tag, createSnackbar, createModal, closeModal })
		],
		[closeModal, createModal, createSnackbar, t, tag]
	);
};

export const useTagsArrayFromStore = (): Array<ItemType> => {
	const tagsFromStore = useTags();
	return useMemo(
		() =>
			reduce(
				tagsFromStore,
				(acc: Array<ItemType>, v: any) => {
					acc.push(v);
					return acc;
				},
				[]
			),
		[tagsFromStore]
	);
};

export const useTagExist = (tags: Array<ItemType>): boolean => {
	const tagsArrayFromStore = useTagsArrayFromStore();
	return useMemo(
		() =>
			reduce(
				tags,
				(acc: boolean, v: Tag) => {
					let tmp = false;
					if (find(tagsArrayFromStore, { id: v?.id })) tmp = true;
					return tmp;
				},
				false
			),
		[tags, tagsArrayFromStore]
	);
};
