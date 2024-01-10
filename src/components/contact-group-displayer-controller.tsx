/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Container } from '@zextras/carbonio-design-system';
import { useParams } from 'react-router-dom';

import { CGDisplayer } from './cg-displayer';
import { DistributionListDisplayer } from './dl-displayer';
import { EmptyDisplayer } from './EmptyDisplayer';
import { RouteParams, ROUTES_INTERNAL_PARAMS } from '../constants';
import { useActiveContactGroup } from '../hooks/useActiveContactGroup';
import { useActiveItem } from '../hooks/useActiveItem';

export const ContactGroupDisplayerController = (): React.JSX.Element => {
	const contactGroup = useActiveContactGroup();
	const { activeItem } = useActiveItem();
	const { route } = useParams<RouteParams>();

	return (
		<Container
			orientation="vertical"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			data-testid="displayer"
		>
			{(activeItem &&
				((contactGroup !== undefined && route === ROUTES_INTERNAL_PARAMS.route.contactGroups && (
					<CGDisplayer contactGroup={contactGroup} />
				)) ||
					(route === ROUTES_INTERNAL_PARAMS.route.distributionLists && (
						<DistributionListDisplayer id={activeItem} />
					)))) || <EmptyDisplayer />}
		</Container>
	);
};
