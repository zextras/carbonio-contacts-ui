/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { useLocation } from 'react-router-dom';

export const LocationDisplay = (): React.JSX.Element => {
	const location = useLocation();
	return <div data-testid="location-display">{location.pathname}</div>;
};
