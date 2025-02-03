/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { DragEvent, useCallback, useMemo } from 'react';

import { Drag } from '@zextras/carbonio-design-system';

import { ContactGroup } from '../../../model/contact-group';
import { useContactGroupActions } from '../actions/use-contact-group-actions';
import { useRedirectToContactGroup } from '../navigation';
import { ContactGroupListItem } from './contact-group-list-item';

type ContactGroupListItemWrapperProps = {
	contactGroup: ContactGroup;
	setDraggedIds?: (ids: Record<string, boolean>) => void;
	setIsDragging?: (id: boolean) => void;
	selectedItems?: Record<string, boolean>;
	dragImageRef?: React.RefObject<HTMLElement>;
};

export const ContactGroupListItemWrapper = ({
	contactGroup,
	setDraggedIds,
	setIsDragging,
	selectedItems,
	dragImageRef
}: ContactGroupListItemWrapperProps): React.JSX.Element => {
	const actions = useContactGroupActions()(contactGroup);
	const ids = useMemo(() => Object.keys(selectedItems ?? []), [selectedItems]);
	const redirectTo = useRedirectToContactGroup();

	const dragCheck = useCallback(
		(e: DragEvent, id: string) => {
			setIsDragging?.(true);
			if (dragImageRef?.current) {
				e?.dataTransfer?.setDragImage(dragImageRef.current, 0, 0);
			}
			if (selectedItems?.[id]) {
				setDraggedIds?.(selectedItems);
			} else {
				setDraggedIds?.({ [id]: true });
			}
		},
		[setIsDragging, dragImageRef, selectedItems, setDraggedIds]
	);

	return (
		<Drag
			type="contact"
			data={{ ...contactGroup, parentFolderId: contactGroup.folderId, selectedIDs: ids }}
			style={{ display: 'block' }}
			onDragStart={(e): void => dragCheck(e, contactGroup.id)}
		>
			<ContactGroupListItem
				contactGroup={contactGroup}
				onClick={(): void => redirectTo(contactGroup)}
				actions={actions}
			/>
		</Drag>
	);
};
