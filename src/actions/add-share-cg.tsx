/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { useModal } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { UIAction } from './types';
import { Grant } from '../carbonio-ui-commons/types';
import { ACTION_IDS } from '../constants';
import { StoreProvider } from '../legacy/store/redux';
import { ContactGroup } from '../model/contact-group';
import { ShareCGModal } from '../views/contact-groups/share/share-cg-modal';

export type AddShareCG = UIAction<ContactGroup, ContactGroup>;

export const useAddShareCG = (): AddShareCG => {
	const [t] = useTranslation();
	const { createModal, closeModal } = useModal();

	const shareContactGroup = useCallback<AddShareCG['execute']>(
		(contactGroup) => {
			const grant: Grant = {
				perm: 'r',
				gt: 'usr'
			};
			const modalId = 'add-shared-contact-groups';
			if (!contactGroup) return;
			createModal(
				{
					id: modalId,
					maxHeight: '90vh',
					children: (
						<StoreProvider>
							<ShareCGModal
								activeGrant={grant}
								contactGroupId={contactGroup?.id}
								contactGroupName={contactGroup?.title}
								onClose={(): void => closeModal(modalId)}
							/>
						</StoreProvider>
					)
				},
				true
			);
		},
		[closeModal, createModal]
	);

	return useMemo(
		() => ({
			id: ACTION_IDS.addShareCG,
			label: t('label.add_share', 'Add Share'),
			icon: 'EmailOutline',
			canExecute: () => true,
			execute: shareContactGroup
		}),
		[shareContactGroup, t]
	);
};
