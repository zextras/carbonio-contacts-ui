/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { times } from 'lodash';

import { ShimmedDisplayerListItem } from './shimmed-displayer-list-item';

export const loadingItems = (count: number): React.JSX.Element[] =>
	times(count, (index) => <ShimmedDisplayerListItem key={index} />);
