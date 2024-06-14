/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useState, useMemo } from 'react';

import {
	Container,
	IconButton,
	Row,
	Responsive,
	Button,
	Text,
	Collapse,
	Dropdown,
	Padding,
	Icon,
	Tooltip,
	Link
} from '@zextras/carbonio-design-system';
import { runSearch, useTags, ZIMBRA_STANDARD_COLORS } from '@zextras/carbonio-shell-ui';
import { every, includes, isEmpty, map, reduce } from 'lodash';
import { useTranslation } from 'react-i18next';

import { isTrash } from '../../../carbonio-ui-commons/helpers/folders';
import { CompactView } from '../../commons/contact-compact-view';
import { useTagExist } from '../../ui-actions/tag-actions';

function typeToIcon(type) {
	switch (type) {
		case 'mail':
			return 'EmailOutline';
		case 'mobile':
			return 'SmartphoneOutline';
		case 'home':
			return 'HomeOutline';
		case 'work':
			return 'BriefcaseOutline';
		case 'fax':
			return '';
		case 'other':
		default:
			return 'PersonOutline';
	}
}

function ContactPreviewRow({ children, width }) {
	return (
		<Row
			orientation="horizontal"
			mainAlignment="space-between"
			width={width || 'fill'}
			wrap="nowrap"
			crossAlignment="flex-start"
			padding={{ horizontal: 'small', vertical: 'small' }}
		>
			{children}
		</Row>
	);
}

function ContactField({ field, label, width, limit, items }) {
	return (
		<>
			{items ? (
				<Container>
					<Dropdown
						width="100%"
						maxWidth="100%"
						items={items}
						placement="bottom-end"
						display="block"
					>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							padding={{ all: 'small' }}
						>
							<Text color="secondary">{label}</Text>
							<Row
								takeAvailableSpace
								wrap="nowrap"
								height="fit"
								width="100%"
								orientation="horizontal"
								mainAlignment="flex-start"
								padding={{ top: 'extrasmall' }}
							>
								<Row
									takeAvailableSpace
									wrap="nowrap"
									height="fit"
									orientation="horizontal"
									mainAlignment="flex-start"
									padding={{ top: 'extrasmall' }}
								>
									<Text size="medium" overflow="break-word">
										{field}
									</Text>
								</Row>
								<IconButton size="small" icon="ArrowIosDownward" />
							</Row>
						</Container>
					</Dropdown>
				</Container>
			) : (
				<Container
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ all: 'small' }}
					width={width || '48%'}
					style={{
						minHeight: '3rem',
						maxWidth: limit ? 'calc(100% - 3rem)' : '100%'
					}}
				>
					<Text color="secondary">{label}</Text>
					<Row
						takeAvailableSpace
						wrap="nowrap"
						height="fit"
						width="fill"
						orientation="horizontal"
						mainAlignment="flex-start"
						padding={{ top: 'extrasmall' }}
					>
						<Row takeAvailableSpace mainAlignment="flex-start">
							<Text size="medium" overflow="break-word">
								{field}
							</Text>
						</Row>
						{items && (
							<Dropdown items={items} placement="bottom-end">
								<Container>
									<Row takeAvailableSpace mainAlignment="flex-start" />
									<IconButton size="small" icon="ArrowIosDownward" />
								</Container>
							</Dropdown>
						)}
					</Row>
				</Container>
			)}
		</>
	);
}

function ContactMultiValueField({ type, values, width, defaultType, showIcon }) {
	const [t] = useTranslation();

	const [selected, setSelected] = useState(0);

	const [internalType, label] = useMemo(() => {
		switch (type) {
			case 'mail':
				return ['mail', t('section.title.mail', 'E-mail address')];
			case 'phone_number':
				return ['number', t('section.title.phone_number', 'Phone contact')];
			case 'url':
				return [
					'url',
					t('label.website', {
						count: values.length,
						defaultValue_one: 'website',
						defaultValue_other: 'websites'
					})
				];
			case 'address':
				return [
					'address',
					t('section.title.address', {
						count: values.length,
						defaultValue_one: 'address',
						defaultValue_other: 'addresses'
					})
				];
			default:
				return [type, type];
		}
	}, [t, type, values.length]);

	const items = useMemo(
		() =>
			reduce(
				values,
				(acc, item, id) => {
					let itemLabel = type;

					switch (type) {
						case 'mail':
							itemLabel = item.mail;
							break;
						case 'phone_number':
							itemLabel = item.number;
							break;
						case 'url':
							itemLabel = item.url;
							break;
						case 'address':
							itemLabel = item.address;
							break;
						default:
					}
					acc.push({
						id: id.toString(),
						label: itemLabel,
						icon: showIcon ? typeToIcon(item.type || defaultType || 'other') : null,
						onClick: () => setSelected(id)
					});
					return acc;
				},
				[]
			),
		[defaultType, values, showIcon, type]
	);
	return (
		<Container
			orientation="horizontal"
			width={width || '48%'}
			crossAlignment="center"
			mainAlignment="space-between"
		>
			<ContactField
				label={label}
				field={values && values[selected] && values[selected][internalType]}
				icon={
					values &&
					values[selected] &&
					showIcon &&
					typeToIcon(values[selected].type || defaultType || 'other')
				}
				width={width || 'fill'}
				items={values.length > 1 && items}
			/>
		</Container>
	);
}

function ContactPreviewContent({ contact, onEdit, onDelete, onMail, onMove }) {
	const [open, setOpen] = useState(true);
	const toggleOpen = useCallback(() => {
		setOpen(!open);
	}, [setOpen, open]);
	const [t] = useTranslation();

	const mailData = useMemo(() => Object.values(contact.email), [contact]);
	const urlData = useMemo(() => Object.values(contact.URL), [contact]);
	const phoneData = useMemo(() => Object.values(contact.phone), [contact]);
	const addressData = useMemo(() => Object.values(contact.address), [contact]);

	const tagsFromStore = useTags();
	const triggerSearch = useCallback(
		(tagToSearch) =>
			runSearch(
				[
					{
						avatarBackground: ZIMBRA_STANDARD_COLORS[tagToSearch?.color ?? 0].hex,
						avatarIcon: 'Tag',
						background: 'gray2',
						hasAvatar: true,
						isGeneric: false,
						isQueryFilter: true,
						label: `tag:${tagToSearch?.name}`,
						value: `tag:"${tagToSearch?.name}"`
					}
				],
				'contacts'
			),
		[]
	);
	const tags = useMemo(
		() =>
			reduce(
				tagsFromStore,
				(acc, v) => {
					if (includes(contact.tags, v.id))
						acc.push({
							...v,
							color: ZIMBRA_STANDARD_COLORS[v.color ?? 0].hex,
							label: v.name,
							onClick: () => triggerSearch(v),
							customComponent: (
								<Row takeAvailableSpace mainAlignment="flex-start">
									<Row takeAvailableSpace mainAlignment="space-between">
										<Row mainAlignment="flex-end">
											<Padding right="small">
												<Icon icon="Tag" color={ZIMBRA_STANDARD_COLORS[v.color ?? 0].hex} />
											</Padding>
										</Row>
										<Row takeAvailableSpace mainAlignment="flex-start">
											<Text>{v.name}</Text>
										</Row>
									</Row>
								</Row>
							)
						});
					return acc;
				},
				[]
			),
		[contact.tags, tagsFromStore, triggerSearch]
	);

	const tagIcon = useMemo(() => (tags.length > 1 ? 'TagsMoreOutline' : 'Tag'), [tags]);
	const tagIconColor = useMemo(() => (tags.length === 1 ? tags[0].color : undefined), [tags]);

	const isTagInStore = useTagExist(tags);

	const onTagClick = useCallback(() => {
		triggerSearch(tagsFromStore?.[contact?.tags[0]]);
	}, [contact.tags, triggerSearch, tagsFromStore]);

	const showMultiTagIcon = useMemo(
		() => contact.tags?.length > 1 && isTagInStore,
		[contact.tags?.length, isTagInStore]
	);
	const showTagIcon = useMemo(
		() =>
			contact.tags &&
			contact.tags?.length !== 0 &&
			!showMultiTagIcon &&
			isTagInStore &&
			every(contact.tags, (tn) => tn !== ''),
		[isTagInStore, contact.tags, showMultiTagIcon]
	);

	const [showDropdown, setShowDropdown] = useState(false);
	const onIconClick = useCallback((ev) => {
		ev.stopPropagation();
		setShowDropdown((o) => !o);
	}, []);

	const onDropdownClose = useCallback(() => {
		setShowDropdown(false);
	}, []);

	const singleTagLabel = useMemo(
		() => tagsFromStore[contact?.tags?.[0]]?.name,
		[contact?.tags, tagsFromStore]
	);

	return (
		<Row
			data-testid="PreviewPanel"
			padding={{ all: 'extrasmall' }}
			width="100%"
			mainAlignment="baseline"
			style={{ overflowY: 'auto' }}
		>
			<Responsive mode="desktop" target={window.top}>
				<Container
					data-testid="contact-preview-content-desktop"
					background="gray6"
					height="fit"
					padding={{ all: 'medium' }}
				>
					<Row
						width="fill"
						height="fit"
						takeAvailableSpace
						mainAlignment="flex-end"
						padding={{ horizontal: 'extrasmall' }}
					>
						{!isTrash(contact.parent) && (
							<IconButton
								icon="MailModOutline"
								onClick={onMail}
								disabled={isEmpty(contact?.email)}
							/>
						)}

						{showTagIcon && (
							<Padding left="small">
								<Tooltip label={singleTagLabel} disabled={showMultiTagIcon}>
									<IconButton
										data-testid="TagIcon"
										size="large"
										onClick={onTagClick}
										icon={tagIcon}
										color={tagIconColor}
									/>
								</Tooltip>
							</Padding>
						)}
						{showMultiTagIcon && (
							<Dropdown items={tags} forceOpen={showDropdown} onClose={onDropdownClose}>
								<Padding left="small">
									<IconButton
										size="large"
										data-testid="TagIcon"
										icon={tagIcon}
										onClick={onIconClick}
										color={tagIconColor}
									/>
								</Padding>
							</Dropdown>
						)}
						<IconButton icon="Trash2Outline" onClick={onDelete} />
						<IconButton
							icon={isTrash(contact.parent) ? 'RestoreOutline' : 'MoveOutline'}
							onClick={onMove}
						/>
						<Padding right="small" />
						{!isTrash(contact.parent) && (
							<Button icon="EditOutline" label={t('label.edit')} onClick={onEdit} />
						)}
					</Row>
					<Container padding={{ all: 'small', top: 'extrasmall' }}>
						<CompactView contact={contact} open={open} toggleOpen={toggleOpen} />
					</Container>
				</Container>
				<Collapse orientation="vertical" open={open} crossSize="100%" disableTransition>
					<Container
						background="gray6"
						width="fill"
						crossAlignment="flex-start"
						mainAlignment="flex-start"
						padding={{ vertical: 'large', horizontal: 'extralarge' }}
						style={{ overflowY: 'auto' }}
					>
						<ContactPreviewRow>
							{contact.namePrefix && (
								<ContactField field={contact.namePrefix} label={t('name.prefix', 'Prefix')} />
							)}
							{contact.firstName && (
								<ContactField
									field={contact.firstName}
									label={t('name.first_name', 'First Name')}
								/>
							)}
							{contact.middleName && (
								<ContactField
									field={contact.middleName}
									label={t('name.middle_name', 'Middle Name')}
								/>
							)}
							{contact.lastName && (
								<ContactField field={contact.lastName} label={t('name.last_name', 'Last Name')} />
							)}
							{contact.nameSuffix && (
								<ContactField field={contact.nameSuffix} label={t('name.suffix', 'Suffix')} />
							)}
						</ContactPreviewRow>

						<ContactPreviewRow>
							{phoneData.length > 0 && (
								<ContactMultiValueField type="phone_number" values={phoneData} showIcon />
							)}
							{mailData.length > 0 && (
								<ContactMultiValueField
									type="mail"
									values={mailData}
									defaultType="email"
									showIcon={false}
								/>
							)}
						</ContactPreviewRow>

						<ContactPreviewRow>
							{contact.jobTitle && (
								<ContactField field={contact.jobTitle} label={t('job.title', 'Job Role')} />
							)}
							{contact.department && (
								<ContactField
									field={contact.department}
									label={t('job.department', 'Department')}
								/>
							)}
							{contact.company && (
								<ContactField field={contact.company} label={t('job.company', 'Company')} />
							)}
						</ContactPreviewRow>
						{contact.notes && <ContactPreviewRow></ContactPreviewRow>}
						{contact.notes && (
							<ContactPreviewRow>
								<ContactField
									field={contact.notes}
									label={t('label.notes', 'Notes')}
									width="fill"
								/>
							</ContactPreviewRow>
						)}
						{addressData.length > 0 && (
							<Row width="fill" mainAlignment="flex-start" padding={{ top: 'large' }}>
								<Text color="secondary" overflow="break-word" style={{ paddingLeft: '1rem' }}>
									{t('section.title.address', 'Address')}
								</Text>
								{map(addressData, (address, index) => (
									<ContactPreviewRow crossAlignment="flex-start" key={index}>
										{address.type && (
											<ContactField field={address.type} label={t('label.type', 'Type')} />
										)}
										{address.street && (
											<ContactField
												field={address.street}
												label={t('section.field.street', 'Street')}
											/>
										)}
										{address.city && (
											<ContactField field={address.city} label={t('section.field.city', 'City')} />
										)}
										{address.postalCode && (
											<ContactField
												field={address.postalCode}
												label={t('section.field.postalCode', 'PostalCode')}
											/>
										)}
										{address.country && (
											<ContactField
												field={address.country}
												label={t('section.field.country', 'Country')}
											/>
										)}
										{address.state && (
											<ContactField
												field={address.state}
												label={t('section.field.state', 'State')}
											/>
										)}
									</ContactPreviewRow>
								))}
							</Row>
						)}

						{urlData.length > 0 && (
							<Row width="fill" mainAlignment="flex-start" padding={{ top: 'large' }}>
								<Text color="secondary" overflow="break-word" style={{ paddingLeft: '1rem' }}>
									{t('label.website', 'Website')}
								</Text>
								{map(urlData, ({ url }, index) => {
									const finalUrl = url.match('^(\\w+:)?\\/\\/.+$') ? url : `https://${url}`;
									return (
										<ContactPreviewRow crossAlignment="flex-start" key={index}>
											<Link
												style={{ paddingLeft: '0.5rem' }}
												underlined
												href={finalUrl}
												target="_blank"
											>
												{url}
											</Link>
										</ContactPreviewRow>
									);
								})}
							</Row>
						)}
					</Container>
				</Collapse>
			</Responsive>
			<Responsive mode="mobile" target={window.top}>
				<Container
					data-testid="contact-preview-content-mobile"
					background="gray6"
					height="fit"
					padding={{ all: 'medium' }}
				>
					<Container>
						<CompactView contact={contact} open={open} toggleOpen={toggleOpen} />
					</Container>
				</Container>
				<Collapse orientation="vertical" open={open} crossSize="100%" disableTransition>
					<Container
						background="gray6"
						width="fill"
						crossAlignment="flex-start"
						mainAlignment="flex-start"
						padding={{ vertical: 'large', horizontal: 'extralarge' }}
						style={{ overflowY: 'auto' }}
					>
						<ContactPreviewRow>
							<ContactField field={contact.namePrefix} label={t('name.prefix', 'Prefix')} />
							<ContactField field={contact.firstName} label={t('name.first_name', 'First Name')} />
						</ContactPreviewRow>

						<ContactPreviewRow>
							<ContactField field={contact.lastName} label={t('name.last_name', 'Last Name')} />

							<ContactMultiValueField type="phone_number" values={phoneData} showIcon />
						</ContactPreviewRow>

						<ContactPreviewRow>
							<ContactMultiValueField
								type="mail"
								values={mailData}
								defaultType="email"
								showIcon={false}
							/>

							<ContactField field={contact.jobTitle} label={t('job.title', 'Job Role')} />
						</ContactPreviewRow>

						<ContactPreviewRow>
							<ContactField field={contact.company} label={t('job.company', 'Company')} />
						</ContactPreviewRow>
					</Container>
				</Collapse>
			</Responsive>
		</Row>
	);
}

export default ContactPreviewContent;
