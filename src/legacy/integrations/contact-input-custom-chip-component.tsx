/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactElement, useMemo } from 'react';

import { Chip, type ChipAction } from '@zextras/carbonio-design-system';
import { reduce, some } from 'lodash';

import { DistributionListChip } from './distribution-list-chip';
import { ContactChipAction, ContactInputCustomChipComponentProps } from './types';
import { CHIP_DISPLAY_NAME_VALUES } from '../../constants/contact-input';
import { useGetDistributionList } from '../../hooks/use-get-distribution-list';
import { isChipItemDistributionList } from './parts/utils';

export const ContactInputCustomChipComponent = ({
	email,
	isGroup = false,
	label,
	chipDisplayName = CHIP_DISPLAY_NAME_VALUES.label,
	contactActions,
	actions,
	...rest
}: ContactInputCustomChipComponentProps): ReactElement => {
	const contact = useMemo(() => ({ email, isGroup }), [email, isGroup]);
	const { distributionList } = useGetDistributionList(
		{ email },
		{ skip: !isChipItemDistributionList(contact) }
	);
	const chipLabel = useMemo(() => {
		if (label && chipDisplayName === CHIP_DISPLAY_NAME_VALUES.label) {
			return label;
		}
		if (email && chipDisplayName === CHIP_DISPLAY_NAME_VALUES.email) {
			return email;
		}
		return label || email || '';
	}, [chipDisplayName, email, label]);

	const chipActions = useMemo(
		() =>
			reduce<ContactChipAction, Array<ChipAction>>(
				contactActions,
				(result, contactAction) => {
					if (some(result, (action) => contactAction.id === action.id)) {
						return result;
					}

					if (contactAction.isVisible(distributionList ?? contact)) {
						result.push({
							...contactAction,
							onClick: (): void => {
								contactAction.onClick(distributionList ?? contact);
							}
						});
					}

					return result;
				},
				[...(actions ?? [])]
			),
		[actions, contact, contactActions, distributionList]
	);

	if (!isChipItemDistributionList(contact)) {
		return <Chip {...rest} label={chipLabel} data-testid={'default-chip'} actions={chipActions} />;
	}

	return (
		<DistributionListChip
			{...rest}
			label={chipLabel}
			email={contact.email}
			isGroup={contact.isGroup}
			actions={chipActions}
		/>
	);
};
