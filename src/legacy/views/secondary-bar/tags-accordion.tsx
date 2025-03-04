/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Accordion } from '@zextras/carbonio-design-system';

import useGetTagsAccordion from '../../hooks/use-get-tags-accordions';

export const TagsAccordion = (): React.JSX.Element => {
	const tagsAccordionItems = useGetTagsAccordion();
	return <Accordion data-testid={'tags-accordion'} items={[tagsAccordionItems]} />;
};
