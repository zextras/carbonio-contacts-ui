/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { ContactInput } from './contact-input';
import { ContactInputProps } from './types';

export const ContactInputIntegrationWrapper = (props: ContactInputProps): React.JSX.Element => (
	<ContactInput {...props} />
);
