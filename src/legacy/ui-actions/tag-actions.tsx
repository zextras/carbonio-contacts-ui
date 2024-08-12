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
	Button,
	useModal,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { replaceHistory, useTags, Tag, Tags } from '@zextras/carbonio-shell-ui';
import { TFunction } from 'i18next';
import { every, find, includes, map, reduce } from 'lodash';
import { useTranslation } from 'react-i18next';

import { ZIMBRA_STANDARD_COLORS } from '../../carbonio-ui-commons/constants/utils';
import { useAppDispatch } from '../hooks/redux';
import { contactAction } from '../store/actions/contact-action';
import { StoreProvider } from '../store/redux';
import { Contact } from '../types/contact';
import { TagsActionsType } from '../types/tags';
import CreateUpdateTagModal from '../views/secondary-bar/parts/tags/create-update-tag-modal';
import DeleteTagModal from '../views/secondary-bar/parts/tags/delete-tag-modal';
import { ItemType } from '../views/secondary-bar/parts/tags/types';

export type ReturnType = {
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

export type TagsFromStoreType = Record<string, Tag>;

export type TagsActionsParams = {
	t: TFunction;
	createModal?: (...args: any) => () => void;
	createSnackbar?: (...args: any) => void;
	items?: ReturnType;
	tag?: ItemType;
};

export const createAndApplyTag = ({
	t,
	context,
	contact
}: {
	t: TFunction;
	context: any;
	contact: Contact;
}): ReturnType => ({
	id: TagsActionsType.NEW,
	icon: 'TagOutline',
	label: t('label.create_tag', 'Create Tag'),
	onClick: (e): void => {
		if (e) {
			e.stopPropagation();
		}
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const closeModal = context.createModal(
			{
				children: (
					<StoreProvider>
						<CreateUpdateTagModal onClose={(): void => closeModal()} contact={contact} />
					</StoreProvider>
				)
			},
			true
		);
	}
});
export const createTag = ({ t, createModal }: TagsActionsParams): ReturnType => ({
	id: TagsActionsType.NEW,
	icon: 'TagOutline',
	label: t('label.create_tag', 'Create Tag'),
	onClick: (e): void => {
		if (e) {
			e.stopPropagation();
		}
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const closeModal = createModal(
			{
				children: (
					<StoreProvider>
						<CreateUpdateTagModal onClose={(): void => closeModal()} />
					</StoreProvider>
				)
			},
			true
		);
	}
});

export const editTag = ({ t, createModal, tag }: TagsActionsParams): ReturnType => ({
	id: TagsActionsType.EDIT,
	icon: 'Edit2Outline',
	label: t('label.edit_tag', 'Edit Tag'),
	onClick: (e): void => {
		if (e) {
			e.stopPropagation();
		}
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const closeModal = createModal(
			{
				children: (
					<StoreProvider>
						<CreateUpdateTagModal onClose={(): void => closeModal()} tag={tag} editMode />
					</StoreProvider>
				)
			},
			true
		);
	}
});

export const deleteTag = ({ t, createModal, tag }: TagsActionsParams): ReturnType => ({
	id: TagsActionsType.DELETE,
	icon: 'Untag',
	label: t('label.delete_tag', 'Delete Tag'),
	onClick: (e): void => {
		if (e) {
			e.stopPropagation();
		}
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const closeModal = createModal(
			{
				children: (
					<StoreProvider>
						<DeleteTagModal onClose={(): void => closeModal()} tag={tag} />
					</StoreProvider>
				)
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
	const dispatch = useAppDispatch();
	const [checked, setChecked] = useState(includes(contact.tags, tag.id));
	const [isHovering, setIsHovering] = useState(false);
	const toggleCheck = useCallback(
		(value) => {
			setChecked((c) => !c);
			dispatch(
				contactAction({
					op: value ? '!tag' : 'tag',
					contactsIDs: [contact.id],
					tagName: tag.name
				})
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
			).then((res: any) => {
				if (res.type.includes('fulfilled')) {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					createSnackbar({
						key: `tag`,
						replace: true,
						hideButton: true,
						type: 'info',
						label: value
							? t('snackbar.tag_removed', { tag: tag.name, defaultValue: '"{{tag}}" tag removed' })
							: t('snackbar.tag_applied', {
									tag: tag.name,
									defaultValue: '"{{tag}}" tag applied'
								}),
						autoHideTimeout: 3000
					});
				} else {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					createSnackbar({
						key: `tag`,
						replace: true,
						type: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000,
						hideButton: true
					});
				}
			});
		},
		[contact.id, createSnackbar, dispatch, t, tag.name]
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

export const MultiSelectTagsDropdownItem = ({
	tag,
	ids,
	tags,
	contacts,
	deselectAll,
	folderId
}: {
	tag: Tag;
	contacts: Array<Contact>;
	ids: string[];
	tags: Tags;
	multiSelect?: boolean;
	deselectAll?: () => void;
	folderId?: string;
}): ReactElement => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const dispatch = useAppDispatch();
	const [isHovering, setIsHovering] = useState(false);

	const tagsToShow = reduce(
		tags,
		(acc: Array<string>, v: Tag) => {
			const values = map(contacts, (c) => includes(c.tags, v.id));
			if (every(values)) acc.push(v.id);
			return acc;
		},
		[]
	);

	const [checked, setChecked] = useState(includes(tagsToShow, tag.id));

	const toggleCheck = useCallback(
		(value) => {
			setChecked((c) => !c);
			dispatch(
				contactAction({
					op: value ? '!tag' : 'tag',
					contactsIDs: ids,
					tagName: tag.name
				})
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
			).then((res: any) => {
				if (res.type.includes('fulfilled')) {
					deselectAll && deselectAll();
					replaceHistory(`/folder/${folderId}/`);
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					createSnackbar({
						key: `tag`,
						replace: true,
						hideButton: true,
						type: 'info',
						label: value
							? t('snackbar.tag_removed', { tag: tag.name, defaultValue: '"{{tag}}" tag removed' })
							: t('snackbar.tag_applied', {
									tag: tag.name,
									defaultValue: '"{{tag}}" tag applied'
								}),
						autoHideTimeout: 3000
					});
				} else {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					createSnackbar({
						key: `tag`,
						replace: true,
						type: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000,
						hideButton: true
					});
				}
			});
		},
		[dispatch, ids, tag.name, deselectAll, folderId, createSnackbar, t]
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
	contacts,
	deselectAll,
	folderId
}: {
	t: TFunction;
	contacts: Array<Contact>;
	tags: Tags;
	ids: string[];
	deselectAll?: () => void;
	folderId?: string;
}): { id: string; items: ItemType[]; customComponent: ReactElement } => {
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
						contacts={contacts}
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
export const applyTag = ({
	t,
	contact,
	tags,
	context
}: {
	t: TFunction;
	contact: any;
	tags: TagsFromStoreType;
	context?: any;
}): {
	id: string;
	items: ItemType[];
	customComponent: ReactElement;
	label?: string;
	icon?: string;
} => {
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
				onClick={(): void => context.createAndApplyTag({ t, context, contact }).onClick()}
			/>
		)
	};
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	tagItem.push(newTag);

	return {
		id: TagsActionsType.APPLY,
		items: tagItem,
		label: t('label.tag', 'Tag'),
		icon: 'TagsMoreOutline',
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

export const useGetTagsActions = ({ tag, t }: TagsActionsParams): Array<ReturnType> => {
	const createModal = useModal();
	const createSnackbar = useSnackbar();
	return useMemo(
		() => [
			createTag({ t, createModal }),
			editTag({ t, createModal, tag }),
			deleteTag({ t, tag, createSnackbar, createModal })
		],
		[createModal, createSnackbar, t, tag]
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
