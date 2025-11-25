/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import { type Action as DSAction, CollapsingActions } from '@zextras/carbonio-design-system';
import { map } from 'lodash';

import { HoverBarContainer } from 'components/styled-components';

interface ListItemHoverBarProps extends React.ComponentPropsWithoutRef<typeof HoverBarContainer> {
	actions?: DSAction[];
}

export const ListItemHoverBar = ({
	actions,
	...rest
}: ListItemHoverBarProps): React.JSX.Element => {
	const actionsMapped = useMemo(
		(): DSAction[] =>
			map(actions, (action) => ({
				...action,
				onClick: (event): ReturnType<DSAction['onClick']> => {
					event.stopPropagation();
					action.onClick(event);
				},
				color: undefined
			})),
		[actions]
	);

	return (
		<HoverBarContainer
			wrap="nowrap"
			data-testid="hover-bar"
			padding={{ right: '0.5rem' }}
			width={'100%'}
			{...rest}
		>
			<CollapsingActions actions={actionsMapped} color={'text'} gap={'0.25rem'} />
		</HoverBarContainer>
	);
};
