/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import { type Action as DSAction, CollapsingActions } from '@zextras/carbonio-design-system';
import { map } from 'lodash';

import { HoverBarContainer } from './StyledComponents';

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
			mainAlignment="flex-end"
			data-testid="hover-bar"
			padding={{ top: '0.25rem', right: '0.5rem' }}
			width={'100%'}
			height={'fit'}
			{...rest}
		>
			<CollapsingActions actions={actionsMapped} color={'text'} size={'medium'} gap={'0.25rem'} />
		</HoverBarContainer>
	);
};
