/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { ChipAction } from '@zextras/carbonio-design-system';
import { first } from 'lodash';

import {
	type ContactChipAction,
	ContactInput,
	ContactInputItem,
	type ContactInputProps
} from './contact-input';
import { isDistributionList } from './contact-input-custom-chip-component';
import { useActionEditDL } from '../../actions/edit-dl';
import { getDistributionList } from '../../api/get-distribution-list';

export type ContactInputIntegrationWrapperProps = Omit<ContactInputProps, 'contactActions'> & {
	actions?: ContactInputProps['contactActions'];
};

export const ContactInputIntegrationWrapper = ({
	actions,
	...rest
}: ContactInputIntegrationWrapperProps): React.JSX.Element => {
	const actionEditDL = useActionEditDL();

	const contactActionEditDL = useCallback(
		(chipItem: ContactInputItem): Promise<ChipAction | undefined> => {
			if (isDistributionList(chipItem)) {
				return getDistributionList(chipItem.email).then((result) => {
					const dl = first(result.dl);
					// TODO: refactor when types are normalized with model
					if (dl && actionEditDL.canExecute({ isOwner: dl.isOwner ?? false })) {
						return {
							id: `chip-action-${actionEditDL.id}`,
							label: actionEditDL.label,
							type: 'button',
							icon: actionEditDL.icon,
							onClick: () =>
								actionEditDL.execute({ email: dl.name, displayName: dl?._attrs?.displayName })
						};
					}
					return undefined;
				});
			}
			return Promise.resolve(undefined);
		},
		[actionEditDL]
	);

	const defaultActions: Array<ContactChipAction> = useMemo(
		() => [
			{
				id: `chip-action-${actionEditDL.id}`,
				getAction: contactActionEditDL
			}
		],
		[actionEditDL, contactActionEditDL]
	);
	return <ContactInput {...rest} contactActions={actions ?? defaultActions} />;
};
