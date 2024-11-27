/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactElement, useMemo } from 'react';

import { Chip } from '@zextras/carbonio-design-system';

import { DistributionListChip } from './distribution-list-chip';
import { UserOrDLCustomChipComponentProps, USER_TYPES } from './types';
import { CHIP_DISPLAY_NAME_VALUES } from '../../constants/contact-input';

export const UserOrDLCustomChipComponent = (
	props: UserOrDLCustomChipComponentProps
): ReactElement => {
	const { value, label, chipDisplayName = CHIP_DISPLAY_NAME_VALUES.label, ...rest } = props;
	const { email, type } = value;
	const isDistributionList = type === USER_TYPES.DISTRIBUTION_LIST;
	const chipLabel = useMemo(() => {
		if (label && chipDisplayName === CHIP_DISPLAY_NAME_VALUES.label) {
			return label;
		}
		if (email && chipDisplayName === CHIP_DISPLAY_NAME_VALUES.email) {
			return email;
		}
		return label || email || '';
	}, [chipDisplayName, email, label]);

	if (isDistributionList) {
		return <DistributionListChip value={value} {...rest} label={chipLabel} />;
	}
	return <Chip {...rest} label={chipLabel} data-testid={'default-chip'} />;
};
