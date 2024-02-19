/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { ContactInput, type ContactInputProps } from './contact-input';

export type ContactInputIntegrationWrapperProps = Omit<ContactInputProps, 'contactActions'> & {
	actions?: ContactInputProps['contactActions'];
};

export const ContactInputIntegrationWrapper = (
	props: ContactInputIntegrationWrapperProps
): React.JSX.Element => <ContactInput {...props} />;
