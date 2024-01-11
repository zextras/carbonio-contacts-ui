/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import { Container } from '@zextras/carbonio-design-system';
import { useParams } from 'react-router-dom';

import { ContactGroupDisplayer } from './ContactGroupDisplayer';
import { DistributionListDisplayer } from './dl-displayer';
import { EmptyDisplayer } from './EmptyDisplayer';
import { RouteParams, ROUTES_INTERNAL_PARAMS } from '../constants';
import { useActiveContactGroup } from '../hooks/useActiveContactGroup';
import { useActiveItem } from '../hooks/useActiveItem';

export const Displayer = (): React.JSX.Element => {
	const contactGroup = useActiveContactGroup();
	const { activeItem } = useActiveItem();
	const { route } = useParams<RouteParams>();

	const { icon, title, description } = useMemo(() => {
		if (route === ROUTES_INTERNAL_PARAMS.route.contactGroups) {
			return {
				icon: 'PeopleOutline',
				title: 'Stay in touch with your colleagues.',
				description: 'Click the “NEW” button to create a new contacts group.'
			};
		}
		return {
			icon: 'DistributionListOutline',
			title: 'Stay in touch with your colleagues.',
			description: 'Select a distribution list or contact the Admin to have one.'
		};
	}, [route]);
	return (
		<Container
			orientation="vertical"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			data-testid="displayer"
		>
			{(activeItem &&
				((contactGroup !== undefined && route === ROUTES_INTERNAL_PARAMS.route.contactGroups && (
					<ContactGroupDisplayer contactGroup={contactGroup} />
				)) ||
					(route === ROUTES_INTERNAL_PARAMS.route.distributionLists && (
						<DistributionListDisplayer id={activeItem} />
					)))) || <EmptyDisplayer icon={icon} title={title} description={description} />}
		</Container>
	);
};
