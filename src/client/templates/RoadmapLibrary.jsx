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
import NoResult from 'components/NoResult.jsx';


import 'scss/templates/roadmap-library.scss'

const RoadmapLibraryNav = (props) => {
	const navigate = useNavigate();
	const location = useLocation();
	let locationSearch = useLocationSearch();
	let searchParams = queryString.parse(locationSearch, { arrayFormat: 'bracket' });
	const [categories, setCategories] = useState(props.content_block.filters || []);
	const [content, setContent] = useState(props?.content_block?.cards || []);
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

		content?.forEach(card => {
			card.categories.forEach(cardCategory => {
				updatedCategories.forEach(mainCategory => {
					mainCategory.categories.forEach(subCategory => {
						if (subCategory.title === cardCategory.title) {
							// if (!subCategory.links.some(link => link.name === card.name)) {
							subCategory.links.push(card);
							// }
						}
					});
				});
			});
		});
		setCategories(updatedCategories)
		setDisplayData(updatedCategories)
	}, [])

	useEffect(() => {

		let update = (searchParams['term'] || '') !== searchTerm;  // Could be undefined so check that

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

	const handleClearInput = () => {
		setInputChange('');
		setSearchTerm('');
	};

	return (
		<div className="roadmap-library-nav">

			<SideInPageNavigation navs={getNestedNavs(categories)} handleSearchSubmit={handleSearchSubmit} handleInputChange={handleInputChange} inputChange={inputChange} handleClearInput={handleClearInput} searchTerm={searchTerm}>
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
					{displayData.length > 0 ? sortMode === 'category' ? (
						displayData.map((category) => (
							<Fragment key={category.hash} >
								<ResourceSection show={sortMode === 'category'} hash={category.hash}>
									<h3>{category.title}</h3>
									{category.categories && category.categories.map((subCategory) => (
										<ResourceSection key={subCategory.hash} show={false} hash={subCategory.hash}>
											<h5>{subCategory.title}</h5>
											{subCategory.description && <p className='subcategory-description' dangerouslySetInnerHTML={{ __html: subCategory.description }}></p>}
											{subCategory.links && subCategory.links.length > 0 && <ImageList links={subCategory.links} />}
										</ResourceSection>
									))}
								</ResourceSection>
							</Fragment>
						))
					) : (
						displayData[0].links && <ImageList links={displayData[0].links} />
					) : <NoResult />}
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
					title={feature?.title}
					description={feature?.description}
					tags={feature?.categories}
					spotlight={feature?.type ? feature.label : false}
					duration={feature?.duration}
					url={feature?.links ? feature.links[0]?.url : false}
					target={feature?.links ? feature.links[0]?.target : false}
					links={feature?.links && feature.links}
				/>
			))}
		</div>
	);
};

const LeftImageCard = ({ title, type, description, tags, spotlight, duration, url, target }) => {
	return (
		<div className="beaker-card shadow-sm">
			<div className="card-body">
				<Row>
					{type == 'Hands-On Lab' &&
						<Col xs="3">
							<ImageBase src="/img/vmware/icon-hol-64px.svg"
								alt="beaker" width="63" height="63" />
						</Col>
					}
					{type == 'Free Product' &&
						<Col xs="3">
							<ImageBase src="/img/resource-library/icon Link.svg"
								alt="links" width="63" height="63" />
						</Col>
					}
					<Col>
						{/* <SiteLink to={url} target={target} className="card-title">{title}</SiteLink> */}
						{spotlight && <span className='spotlight'>{spotlight}</span>}
						{duration && <span className='duration'><i className="fa-regular fa-clock"></i>{duration}</span>}
						{/* <h5>{title}</h5> */}
						<SiteLink to={url} target={target} className="card-title">{title}</SiteLink>
						{description && <p dangerouslySetInnerHTML={{ __html: description }}></p>}
						{/* <SiteLink>{type === "Hands-On Lab" ? "BEGIN NOW" : "GET STARTED"}</SiteLink> */}
					</Col>
				</Row>
			</div>
		</div>
	);
};

const FeatureCard = ({ title, description, tags, spotlight, duration, url, target,links }) => {
	return (
		<div className="feature-card shadow-sm">
			{spotlight && <div><span className='spotlight'>{spotlight}</span></div>}
			{/* {duration && <span className='duration'>{duration}</span>} */}
			<Collapsible title={url ? <SiteLink to={url} target={target}><h5>{title}</h5></SiteLink> : <h5>{title}</h5>}>
				<p dangerouslySetInnerHTML={{ __html: description }}></p>
				<div className="tag-list">
					{tags && tags.map((tag, index) => (
						// <div key={index} className='tags'>
						<div className='keywords-tag'>{tag.title.toUpperCase()}</div>
						//</div>
					))}
				</div>
				{links && <div className='link-list'>
					{links?.map((link)=>(
						<SiteLink to={link.url} target={link.target} className='roadmapcard-link'>{link.title} <i className="fa-solid fa-chevron-right feature-card-caret"></i></SiteLink>
					))}
					</div>}
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
					? <i className="fa-solid fa-chevron-down feature-card-caret"></i>
					: <i className="fa-solid fa-chevron-up feature-card-caret"></i>
				}</div>
			</button>
			<div className={`content ${isActive ? 'show' : 'hide'}`}>
				{isActive && children}
			</div>
		</div>
	);
};

const RoadmapLibraryFilter = (props) => {
	const navigate = useNavigate();
	let locationSearch = useLocationSearch();
	let searchParams = queryString.parse(locationSearch, { arrayFormat: 'bracket' });

	const itemList = props?.content_block?.cards || [];
	// Translate filters and remap to proper attributes for generic filternav
	const filters = props.content_block?.filters.map(filter => ({
		title: filter.title,
		items: filter.categories?.map(category => ({
			id: category.content_id,
			title: category.title,
		}))
	}));

	const [filteredItems, setFilteredItems] = useState(itemList);
	const [selectedFilters, setSelectedFilters] = useState([]);
	const [showFilters, setShowFilters] = useState(filters || []);
	const [sortMode, setSortMode] = useState('category');
	const [searchTerm, setSeeachTerm] = useState(searchParams.term || '');


	useEffect(() => {


		let updatedList = itemList.filter(item => {
			// Check selected filters.
			if (!searchTerm
				|| item.title?.toLowerCase().includes(searchTerm.toLowerCase()
					|| item.description?.toLowerCase().includes(searchTerm.toLowerCase()))) {

				// Do we have a category selected?
				if (selectedFilters.length === 0) {
					return true;
				}
				else if (selectedFilters.length 
					&& 
					selectedFilters.some(filter => item?.categories?.some(category => category?.title?.toLowerCase() === filter.toLowerCase()))) {
					return true;
				}
			}

			return false;
		});


		// Trim our viewable filters and categories.
		// This is waaaaay too nested.
		let updatedFilters = [];

		filters.forEach(filter => {

			let updated_filter = structuredClone(filter);

			// Clear our items first;
			updated_filter.items = [];
			
			// For each item
			    // For each updatedList
				// For each category
			
			// Easier for me to read vs js array functions
			let found = false;
			filter?.items?.forEach(item => {


				// Only for selection
				updatedList.forEach(list => {
					list?.categories?.forEach(category => {

						
						if (category?.title?.toLowerCase() === item?.title?.toLowerCase()) {

							if (selectedFilters.length === 0 || selectedFilters.some(filter => filter.toLowerCase() ===  category?.title?.toLowerCase())) {

								found = true;
								
								// If it doesn't exist add us.
								if (!updated_filter.items?.some(exist => exist.title === item.title)) {
									updated_filter.items.push(item);		// Add us cause they found us.
								}
							}
						}
					});
				});

			})

			if (found) {
				updatedFilters.push(updated_filter);
			}
			
		});
		
		
		setShowFilters(updatedFilters);


		if (sortMode !== 'category') {
			updatedList = updatedList.sort(((a, b) => sortMode === 'a-z' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)));
		}


		

		setFilteredItems(updatedList);
	}, [sortMode, searchTerm, JSON.stringify(selectedFilters)]);



	const handleSelectedFilters = (filters) => {

		setSelectedFilters(filters);
	}

	const handleSearch = (search) => {
		let update = (searchParams['term'] || '') !== search;  // Could be undefined so check that

		if (search.length > 0) {
			searchParams['term'] = search
		} else {
			delete searchParams['term']
		};

		// Stop adding history if we are the same
		if (update) {
			navigate({
				search: `${encodeURI(queryString.stringify(searchParams))}`,
				hash: location.hash,
			});
		}

		setSeeachTerm(search);
	}

	const handleSort = (e) => {
		setSortMode(e.target.value);
	};

	return (
		<NavStyleFilter className="roadmap-library-filter"
			filters={filters}
			onSelectedFilters={handleSelectedFilters}
			onSearch={handleSearch}
			resultCount={filteredItems.length}
		>
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
			<div className='display-cards' >
				{sortMode !== 'category' ?
					filteredItems?.map(details => {
						return (
							details.type === "Hands-On Lab" || details.type === "Free Product" ?
								<div className='resource-library-container'>									
									<LeftImageCard title={details.title} type={details.type} description={details.description} tags={details.categories} spotlight={details?.type ? details.label : false} duration={details?.duration} url={details?.links ? details.links[0]?.url : false} target={details?.links ? details.links[0]?.target : false} />
								</div>
								:
								<FeatureCard title={details.title} description={details.description} tags={details.categories} spotlight={details?.type ? details.label : false} duration={details?.duration} url={details?.links ? details.links[0]?.url : false} target={details?.links ? details.links[0]?.target : false} links={details?.links && details.links}/>

						)
					})

					:

					showFilters.map(filter => {
						return (
							filter.items?.map(cat => (
								<div key={cat.title}>
									<h3>{filter.title}</h3>
									<h5>{cat.title}</h5>
									{filteredItems.map(details => {
										return (
											details.categories?.map(card => {
												let tempCard = card.title.toLowerCase();
												if (cat?.title?.toLowerCase() === tempCard ) {
													return (
														// <FeatureCard title={details.title} description={details.description} tags={false} spotlight={false} url={null} target={null} />
														// <FeatureCard title={details.title} description={details.description} tags={details.categories} spotlight={details?.type ? details.label : false} duration={details?.duration} url={details?.links ? details.links[0]?.url : false} target={details?.links ? details.links[0]?.target : false} />
														details.type === "Hands-On Lab" || details.type === "Free Product" ?
															<div className='resource-library-container'>
																<LeftImageCard title={details.title} type={details.type} description={details.description} tags={details.categories} spotlight={details?.type ? details.label : false} duration={details?.duration} url={details?.links ? details.links[0]?.url : false} target={details?.links ? details.links[0]?.target : false} />
															</div>
															:
															<FeatureCard title={details.title} description={details.description} tags={details.categories} spotlight={details?.type ? details.label : false} duration={details?.duration} url={details?.links ? details.links[0]?.url : false} target={details?.links ? details.links[0]?.target : false} links={details?.links && details.links}/>

													)
												}
											})
										)

									})}
								</div>
							))
						)
					})
				}
			</div >
		</NavStyleFilter >
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