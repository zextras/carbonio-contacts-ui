/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import { ContactInput, type ContactInputProps } from './contact-input';
import { useActionEditDL } from '../../actions/edit-dl';
import type { DistributionList } from '../../model/distribution-list';
import type { ContactChipAction, ContactInputItem } from '../types/integrations';

export type ContactInputIntegrationWrapperProps = Omit<ContactInputProps, 'contactActions'> & {
	actions?: ContactInputProps['contactActions'];
};

const isDistributionList = (
	contact: DistributionList | ContactInputItem
): contact is DistributionList => 'isOwner' in contact;

export const ContactInputIntegrationWrapper = ({
	actions,
	...rest
}: ContactInputIntegrationWrapperProps): React.JSX.Element => {
	const actionEditDL = useActionEditDL();

	const defaultActions = useMemo(
		(): Array<ContactChipAction> => [
			{
				id: `chip-action-${actionEditDL.id}`,
				label: actionEditDL.label,
				type: 'button',
				icon: actionEditDL.icon,
				isVisible: (contact: DistributionList | ContactInputItem) =>
					isDistributionList(contact) && actionEditDL.canExecute(contact),
				onClick: (contact: DistributionList | ContactInputItem): void => {
					isDistributionList(contact) &&
						actionEditDL.execute({
							email: contact.email,
							displayName: contact.displayName
						});
				}
			}
		],
		[actionEditDL]
	);
	return <ContactInput {...rest} contactActions={actions ?? defaultActions} />;
};
