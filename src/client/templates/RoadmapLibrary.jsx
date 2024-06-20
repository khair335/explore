/**
 *  @file RoadmapLibrary.jsx
 *  @brief RoadmapLibrary for component templates.
 */
import config from 'client/config.js';
import utils, { encodeTabHash } from 'components/utils.jsx';
import React, { useState, useEffect, Fragment } from 'react';
import { BrowserRouter as Router, useNavigate, useLocation, useHistory } from 'react-router-dom';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import { withLiveEvents } from 'components/liveEvents.js';
import SideInPageNavigation from 'templates/SideInPageNavigation.jsx';
import classnames from "classnames";
import queryString from 'query-string';
import { Container, Row, Col, Nav, NavItem, NavLink, Collapse, Badge } from 'reactstrap';
import ImageBase from 'components/ImageBase.jsx';
import NavStyleFilter from 'templates/FilterNav.jsx';
import { useLocationSearch } from 'routes/router.jsx';


import 'scss/templates/roadmap-library.scss'

const RoadmapLibraryNav = (props) => {
	const navigate = useNavigate();
	const location = useLocation();
	let locationSearch = useLocationSearch();
	let searchParams = queryString.parse(locationSearch, { arrayFormat: 'bracket' });
	const [categories, setCategories] = useState(props.content_block.filters || []);
	const [content, setContent] = useState(props.content_block.cards || []);
	const [displayData, setDisplayData] = useState(categories);
	const [searchTerm, setSearchTerm] = useState(searchParams.term || '');
    const [inputChange, setInputChange] = useState(searchParams.term || '');
	const [isSubmit, setIsSubmit] = useState(false);
	const [sortMode, setSortMode] = useState('category');

	useEffect(() => {
        setInputChange(searchParams.term || '');
        setSearchTerm(searchParams.term || '');
    }, [locationSearch]);

	useEffect(() => {
		const updatedCategories = categories.map(category => {
			if (category.title) {
				let hash = encodeTabHash(category.title);
				hash = hash.replace(/[^\w_-]+/g, "");

				category.hash = encodeTabHash(hash);

				if (category.categories) {
					category.categories = category.categories.map(subCategory => {
						if (subCategory.title) {
							let subHash = encodeTabHash(subCategory.title);
							subHash = subHash.replace(/[^\w_-]+/g, "");

							subCategory.hash = encodeTabHash(subHash);
							subCategory.links = [];

						}
						return subCategory;
					});
				}
			}
			return category;
		});

		content.forEach(card => {
			card.categories.forEach(cardCategory => {
				updatedCategories.forEach(mainCategory => {
					mainCategory.categories.forEach(subCategory => {
						if (subCategory.title === cardCategory.title) {
							if (!subCategory.links.some(link => link.name === card.name)) {
								subCategory.links.push(card);
							}
						}
					});
				});
			});
		});
		setCategories(updatedCategories)
		setDisplayData(updatedCategories)
	}, [])

	useEffect(() => {

		let update = (searchParams['term'] || '' ) !== searchTerm;  // Could be undefined so check that

		if (searchTerm.length > 0) {
			searchParams['term'] = searchTerm
		} else {
			delete searchParams['term']
		};

		// Stop adding history if we are the same
        if (update) {
            navigate({
                search: `${queryString.stringify(searchParams)}`,
                hash: location.hash,
            });
        }
	}, [searchTerm])

	const generateHash = (title) => {
		return title.toLowerCase().replace(/\s+/g, '-');
	}

	const getNestedNavs = (categories) => {
		return categories?.map(category => {
			let navItem = {
				hash: category.hash || generateHash(category.title),
				label: category?.title
			};

			if (category.categories && category.categories?.length > 0) {
				navItem.subNavs = category.categories?.map(subCategory => ({
					hash: subCategory.hash || generateHash(subCategory.title),
					label: subCategory?.title
				}));
			}

			return navItem;
		});
	}

	useEffect(() => {
		let processedData = [...categories];

		if (searchTerm) {
			processedData = processedData.map(category => {
				const filteredLinks = category.links?.filter(link =>
					link.title.toLowerCase().includes(searchTerm.toLowerCase())) || [];

				const filteredSubCategories = category.categories?.map(subCat => {
					const subFilteredLinks = subCat.links?.filter(link =>
						link.title.toLowerCase().includes(searchTerm.toLowerCase())) || [];
					return { ...subCat, links: subFilteredLinks };
				}).filter(subCat => subCat.links.length > 0);

				return { ...category, links: filteredLinks, categories: filteredSubCategories };
			}).filter(category =>
				category.links.length > 0 || (category.categories && category.categories.some(subCat => subCat.links.length > 0)));
		}

		if (sortMode === 'a-z' || sortMode === 'z-a') {
			let allLinks = [];
			processedData.forEach(category => {
				allLinks.push(...(category.links || []));
				category.categories?.forEach(subCategory => {
					allLinks.push(...(subCategory.links || []));
				});
			});

			const uniqueLinks = Array.from(new Map(allLinks.map(link => [link.title, link])).values());
			uniqueLinks.sort((a, b) => sortMode === 'a-z' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title));

			processedData = [{ links: uniqueLinks }];
		}
		setDisplayData(processedData);
	}, [categories, searchTerm, sortMode]);

	const handleSearchSubmit = (e) => {
		e.preventDefault();
		setSearchTerm(inputChange?.trim());
		setIsSubmit(true);
	};

	const handleInputChange = (e) => {
		setIsSubmit(false);
		setInputChange(e.target.value);
	};

	const handleSort = (e) => {
		setSortMode(e.target.value);
	};

	return (
		<div className="roadmap-library-nav">

			<SideInPageNavigation navs={getNestedNavs(categories)} handleSearchSubmit={handleSearchSubmit} handleInputChange={handleInputChange} inputChange={inputChange}>
				<div className="sorting-dropdown">
					<label>
						Sort By
						<select value={sortMode} onChange={handleSort}>
							<option value="category">Category</option>
							<option value="a-z">A-Z</option>
							<option value="z-a">Z-A</option>
						</select>
					</label>
				</div>
				<div className={classnames("resource-library-modules")}>
					{sortMode === 'category' ? (
						displayData.map((category) => (
							<Fragment key={category.hash} >
								<ResourceSection show={sortMode === 'category'} hash={category.hash}>
									<h3>{category.title}</h3>
									{category.categories && category.categories.map((subCategory) => (
										<ResourceSection key={subCategory.hash} show={false} hash={subCategory.hash}>
											<h5>{subCategory.title}</h5>
											{subCategory.links && subCategory.links.length > 0 && <ImageList links={subCategory.links} />}
										</ResourceSection>
									))}
								</ResourceSection>
							</Fragment>
						))
					) : (
						displayData[0].links && <ImageList links={displayData[0].links} />
					)}
				</div>
			</SideInPageNavigation>
		</div>
	);
}

const ResourceSection = ({ show, hash, children }) => {
	const Tag = show ? 'section' : 'div';
	return (
		<Tag id={hash} className="resource-library-module-section">
			{children}
		</Tag>
	);
};

const ImageList = ({ links }) => {
	return (
		<div className="container my-4">
			{links?.map((feature, index) => (
				<FeatureCard
					key={feature.content_id}
					title={feature.title}
					description={feature.description}
					tags={feature.categories}
					spotlight={feature.type === 'Spotlight'}
					url={feature.links ? feature.links[0].url : false}
					target={feature.links ? feature.links[0].target : false}
				/>
			))}
		</div>
	);
};

const FeatureCard = ({ title, description, tags, spotlight, url, target }) => {
	return (
		<div className="feature-card shadow-sm">
			{spotlight && <span className='spotlight'>SPOTLIGHT</span>}
			<Collapsible title={url ? <SiteLink to={url} target={target}><h5>{title}</h5></SiteLink> : <h5>{title}</h5>}>
				<p dangerouslySetInnerHTML={{ __html: description }}></p>
				<Row>
					{tags && tags.map((tag, index) => (
						<div key={index} className='tags'>
							<div className='keywords-tag'>{tag.title.toUpperCase()}</div>
						</div>
					))}
				</Row>
			</Collapsible>
		</div>
	);
}


const Collapsible = ({ title, children }) => {
	const [isActive, setIsActive] = useState(true);

	const toggleCollapsible = () => {
		setIsActive(!isActive);
	};

	return (
		<div className="collapsible">
			<button type="button" className={`collapsible-btn ${isActive ? 'active' : ''}`} onClick={toggleCollapsible}>
				<div className='feature-card-title'><span>{title}</span>{isActive
					? <i className="bi brcmicon-caret-down feature-card-caret"></i>
					: <i className="bi brcmicon-caret-up feature-card-caret"></i>
				}</div>
			</button>
			<div className={`content ${isActive ? 'show' : 'hide'}`}>
				{isActive && children}
			</div>
		</div>
	);
};

const RoadmapLibraryFilter = (props) => {
	return (
		<NavStyleFilter className="roadmap-library-filter" props={props} />
	);
}

const RoadmapLibrary = (props) => {
	return (
		<div className="RoadmapLibrary">
			{props?.content_block?.filters_with_checkbox
				? <RoadmapLibraryFilter {...props} />
				: <RoadmapLibraryNav {...props} />
			}
		</div>
	)
}

RoadmapLibrary.propTypes = {
	content_block: PropTypes.object.isRequired,
};

export default withLiveEvents(RoadmapLibrary);