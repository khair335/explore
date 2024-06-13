/**
 *  @file VMmarkLanding.jsx
 *  @brief VMmarkLanding
 *  
 */
import config from 'client/config.js';
import React, { Component, useEffect, useState } from 'react';
import { BrowserRouter as Router, useNavigate, useLocation, useHistory } from 'react-router-dom';
import SiteLink from "components/SiteLink.jsx";
import { SubHeadHero } from 'components/subHeader.jsx';
import { Collapse, Container } from 'reactstrap';
import liveEvents from 'components/liveEvents.js';
import { Row, Col, Button, Modal, ModalHeader, ModalBody, ModalFooter, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Pagination, PaginationItem, PaginationLink, Table, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import MultiSelectFilter from 'components/MultiSelectFilter.jsx';
import { InfoPopover } from 'components/InfoPopover.jsx';
import { filterParams } from 'components/utils.jsx';
import queryString from 'query-string';
import ImageBase from 'components/ImageBase.jsx';
import classnames from 'classnames';


import 'scss/pages/vmmark-landing.scss';



const TopScores = ({ scores, spotlight, body, url, location_hash, hashFlag, content_blocks }) => {
	const [modal, setModal] = useState(false);
	const [activeScore, setActiveScore] = useState(null);
	const navigate = useNavigate();
	const location = useLocation();

	const tabHashMapping = {
		'Top Scores': 'top-scores',
		'Performance Only': 'performance-only',
		'Server Power-Performance': 'server-power-performance',
		'Server and Storage Power-Performance': 'server-storage-power-performance'
	};

	useEffect(() => {
		const handleHashChange = () => {

			const hash = window.location.hash.replace('#', '');
			setActiveTabFromHash(hash);
		};

		window.addEventListener('hashchange', handleHashChange);

		handleHashChange();

		return () => {
			window.removeEventListener('hashchange', handleHashChange);
		};
	}, []);

	const setActiveTabFromHash = (hash) => {

	};

	const toggle = (score = null) => {
		setModal(!modal);
		setActiveScore(score);
	};

	const handleViewAll = (score) => {
		const category = score.filter_title;
		const hash = tabHashMapping[category];
		if (hash) {
			window.location.hash = hash;
		}
	};



	return (
		<div className='top-scores'>
			<div className="spotlight-card">
				<div className="spotlight-title">Spotlight</div>
				{spotlight?.map((spotlight, index) => (
					<div key={index} className="spotlight-item">
						<tr>
							<td><div className="spotlight-date">{spotlight.date}</div></td>
							<td><SiteLink to={spotlight.link.url} target={spotlight.link.target}>
								<div className="spotlight-description">{spotlight.title}</div>
							</SiteLink></td>
						</tr>
					</div>
				))}
			</div>
			<div className="card-container">
				{scores.map((score, index) => (
					<div key={index} className="main-card">
						<div className="card-title">
							<h4>{score.filter_title}</h4>
							<div>
								{/* <InfoPopover onClick={() => toggle(score)}>
									<span dangerouslySetInnerHTML={{ __html: score.abstract }} />
								</InfoPopover> */}
								<button className="icon-bttn" title="info" aria-label="info" onClick={() => toggle(score)}>
									<i className="bi brcmicon-info-circle primary"></i>
								</button>
							</div>
						</div>
						{score.filter_subtitle && <span className='card-subtitle'>{score.filter_subtitle}</span>}
						<Table>
							<thead>
								<tr>
									{Object.keys(score.vmmark_list[0]).map((key) => (
										key == 'system_description' ? <th key={key}>Description</th> : <th key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</th>
									))}
								</tr>
							</thead>
							<tbody>

								{score.vmmark_list.map((row, rowIndex) => (
									<tr key={rowIndex}>
										{Object.keys(row).map((key, keyIndex) => (
											<React.Fragment key={keyIndex}>
												{row[key] && <td dangerouslySetInnerHTML={{ __html: row[key] }}></td>}
											</React.Fragment>
										))}
									</tr>
								))}

							</tbody>
						</Table>
						<SiteLink to={`${url.pathname}?${score.search_url}#${tabHashMapping[score.category]}`} target="__blank"><button className="card-button">VIEW ALL <i className="fa-solid fa-chevron-right"></i></button></SiteLink>
					</div>
				))}
				{activeScore && (
					<Modal isOpen={modal} toggle={() => toggle()}>
						<ModalHeader toggle={() => toggle()}>{activeScore.filter_title}</ModalHeader>
						<ModalBody>
							<p dangerouslySetInnerHTML={{ __html: activeScore.abstract }}></p>
						</ModalBody>
					</Modal>
				)}
			</div>
			<div className='related-vmmark-results'>
				<h3>Other Related VMmark Results</h3>
				<div className="card-row">
					{content_blocks.map((card, index) => (
						<div key={index} className="card">
							<Row>
								<Col xs="3">
									<ImageBase src="/img/resource-library/link.svg"
										alt="links" width="63" height="63" />
								</Col>

								<Col>
									<SiteLink to={card.links[0].url} target={card.links[0].target}><h4>{card.links[0].title}</h4></SiteLink>
								</Col>
							</Row>
						</div>
					))}
				</div>
			</div>
			<div dangerouslySetInnerHTML={{ __html: body }}></div>
		</div>
	);
};

const PerformanceOnly = ({ props, currentTab, tabsMapping, location_hash, flag, content_blocks, body }) => {
	const navigate = useNavigate();
	const moment = require('moment');
	const location = useLocation();
	const location_search = window.location.search;
	let searchParams = queryString.parse(location_search, { arrayFormat: 'bracket' });
	const [activeTab, setActiveTab] = useState(currentTab)
	const [hashFlag, setHashFlag] = useState(flag)
	const tabsMap = tabsMapping

	const [categoryList, setCategoryList] = useState(props[0].category_list)
	const [searchTerm, setSearchTerm] = useState('');
	const [inputChange, setInputChange] = useState('');
	const [isSubmit, setIsSubmit] = useState(false);
	const [totalHosts, setTotalHosts] = useState([]);
	const [primaryStorage, setPrimaryStorage] = useState([]);
	const [totalSockets, setTotalSockets] = useState([]);
	const [matchedPair, setMatchedPair] = useState([]);
	const [systemDescription, setSystemDescription] = useState([]);
	const [totalThreads, setTotalThreads] = useState([]);
	const [uniformHosts, setUniformHosts] = useState([]);
	const [totalCores, setTotalCores] = useState([]);
	const [hypervisor, setHypervisor] = useState([]);
	const [submitter, setSubmitter] = useState([]);
	const [version, setVersion] = useState([]);
	const [searchResults, setSearchResults] = useState(categoryList);
	const [showData, setShowData] = useState(searchResults);
	const keysToDisplay = ["Submitter", "Performance Score", "Date", "Total Hosts", "Total Sockets", "Total Cores", "Server Description", "Primary Storage", "Hypervisor", "VMmark Version", "Matched Pair", "Total Threads", "Uniform Hosts", "Category"];
	const [manageColumns, setManageColumns] = useState(keysToDisplay)
	const [visibleColumns, setVisibleColumns] = useState(new Set(keysToDisplay));
	const [sortConfig, setSortConfig] = useState({ sortorder: null, sort: null });
	const [resultsPerPage, setResultsPerPage] = useState(20);
	const [totalPages, setTotalPages] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [start, setStart] = useState(0);
	const [end, setEnd] = useState(0);

	const headerKeyMap = {
		'Submitter': 'submitter',
		'Performance Score': 'score',
		'Date': 'date',
		'Total Hosts': 'total_hosts',
		'Total Sockets': 'total_sockets',
		'Total Cores': 'total_cores',
		'Server Description': 'system_description',
		'Primary Storage': 'primary_storage',
		'Hypervisor': 'hypervisor',
		'VMmark Version': 'version',
		'Matched Pair': 'matched_pair',
		'Total Threads': 'total_threads',
		'Uniform Hosts': 'uniform_hosts',
		'Category': 'category',
	};

	const [selectedValues, setSelectedValues] = useState({
		total_hosts: [],
		primary_storage: [],
		total_sockets: [],
		matched_pair: [],
		system_description: [],
		total_threads: [],
		uniform_hosts: [],
		version: [],
		total_cores: [],
		hypervisor: [],
		submitter: [],
	})
	useEffect(() => {
		setInputChange(searchParams.term || '');
		setSearchTerm(searchParams.term || '');
		setActiveTab(tabsMap[location_hash.substring(1)] || tabsMap['top-scores'])
		setHashFlag(tabsMap[location_hash.substring(1)] ? true : false)
		const updatedSelectedValues = {};

		if (searchParams.total_hosts) {
			updatedSelectedValues.total_hosts = searchParams.total_hosts.split(',');
		} else {
			updatedSelectedValues.total_hosts = [];
		}

		if (searchParams.primary_storage) {
			updatedSelectedValues.primary_storage = searchParams.primary_storage.split(',');
		} else {
			updatedSelectedValues.primary_storage = [];
		}

		if (searchParams.total_sockets) {
			updatedSelectedValues.total_sockets = searchParams.total_sockets.split(',');
		} else {
			updatedSelectedValues.total_sockets = [];
		}
		if (searchParams.matched_pair) {
			updatedSelectedValues.matched_pair = searchParams.matched_pair.split(',').map(value => {
				if (value === 'True') {
					return 'Matched Pair';
				} else if (value === 'False') {
					return 'Not Matched Pair';
				} else {
					return value;
				}
			});
		} else {
			updatedSelectedValues.matched_pair = [];
		}

		if (searchParams.system_description) {
			updatedSelectedValues.system_description = searchParams.system_description.split(',');
		} else {
			updatedSelectedValues.system_description = [];
		}

		if (searchParams.total_threads) {
			updatedSelectedValues.total_threads = searchParams.total_threads.split(',');
		} else {
			updatedSelectedValues.total_threads = [];
		}
		if (searchParams.uniform_hosts) {
			updatedSelectedValues.uniform_hosts = searchParams.uniform_hosts.split(',');
		} else {
			updatedSelectedValues.uniform_hosts = [];
		}

		if (searchParams.version) {
			updatedSelectedValues.version = searchParams.version.split(',');
		} else {
			updatedSelectedValues.version = [];
		}

		if (searchParams.total_cores) {
			updatedSelectedValues.total_cores = searchParams.total_cores.split(',');
		} else {
			updatedSelectedValues.total_cores = [];
		}
		if (searchParams.hypervisor) {
			updatedSelectedValues.hypervisor = searchParams.hypervisor.split(',');
		} else {
			updatedSelectedValues.hypervisor = [];
		}

		if (searchParams.submitter) {
			updatedSelectedValues.submitter = searchParams.submitter.split(',');
		} else {
			updatedSelectedValues.submitter = [];
		}

		const updatedSortConfig = {}

		if (searchParams.sort) {
			updatedSortConfig.sort = searchParams.sort
		} else {
			updatedSortConfig.sort = null;
		}

		if (searchParams.sortorder) {
			updatedSortConfig.sortorder = searchParams.sortorder
		} else {
			updatedSortConfig.sortorder = null;
		}


		filterParams(updatedSelectedValues);

		setSortConfig(updatedSortConfig)

		setSelectedValues(updatedSelectedValues);

	}, []);

	useEffect(() => {
		Object.keys(selectedValues).forEach(category => {
			if (selectedValues[category].length > 0) {
				searchParams[category?.toLowerCase()] = selectedValues[category].join(',')
			} else {
				delete searchParams[category?.toLowerCase()];
			}
		});

		if (searchTerm.length > 0) {
			searchParams['term'] = searchTerm
		} else {
			delete searchParams['term']
		};

		Object.keys(sortConfig).forEach(category => {
			if (sortConfig[category]) {
				searchParams[category?.toLowerCase()] = sortConfig[category]
			} else {
				delete searchParams[category?.toLowerCase()];
			}
		});

		let hashKey;
		Object.entries(tabsMap).forEach(([key, value]) => {
			if (value == activeTab) {
				hashKey = key;
			}
		})

		hashFlag ? navigate({ search: `?${queryString.stringify(searchParams)}`, hash: `#${hashKey}` }) : navigate({ search: `?${queryString.stringify(searchParams)}` });
	}, [selectedValues, searchTerm, sortConfig, activeTab])

	const updateUniqueItems = (setter, existingItems, newItems) => {
		const uniqueSet = new Set(existingItems);
		newItems.forEach(item => uniqueSet.add(item));
		setter([...uniqueSet]);
	};

	const populateData = () => {
		const localTotalHosts = [];
		const localPrimaryStorage = [];
		const localTotalSockets = [];
		const localMatchedPair = [];
		const localSystemDescription = [];
		const localTotalThreads = [];
		const localUniformHosts = [];
		const localVersion = [];
		const localTotalCores = [];
		const localHypervisor = [];
		const localSubmitter = [];

		props[0].category_list.forEach(item => {
			if (!localTotalHosts.includes(item.total_hosts)) localTotalHosts.push(item.total_hosts);
			if (!localPrimaryStorage.includes(item.primary_storage)) localPrimaryStorage.push(item.primary_storage);
			if (!localTotalSockets.includes(item.total_sockets)) localTotalSockets.push(item.total_sockets);
			// if (!localMatchedPair.includes(item.matched_pair)) localMatchedPair.push(item.matched_pair);
			if (!localSystemDescription.includes(item.system_description)) localSystemDescription.push(item.system_description);
			if (!localTotalThreads.includes(item.total_threads)) localTotalThreads.push(item.total_threads);
			// if (!localUniformHosts.includes(item.uniform_hosts)) localUniformHosts.push(item.uniform_hosts);
			if (!localVersion.includes(item.version)) localVersion.push(item.version);
			if (!localTotalCores.includes(item.total_cores)) localTotalCores.push(item.total_cores);
			if (!localHypervisor.includes(item.hypervisor)) localHypervisor.push(item.hypervisor);
			if (!localSubmitter.includes(item.submitter)) localSubmitter.push(item.submitter.submitter_data);
		});
		updateUniqueItems(setTotalHosts, totalHosts, localTotalHosts);
		updateUniqueItems(setPrimaryStorage, primaryStorage, localPrimaryStorage);
		updateUniqueItems(setTotalSockets, totalSockets, localTotalSockets);
		// updateUniqueItems(setMatchedPair, matchedPair, localMatchedPair);
		updateUniqueItems(setSystemDescription, systemDescription, localSystemDescription);
		updateUniqueItems(setTotalThreads, totalThreads, localTotalThreads);
		// updateUniqueItems(setUniformHosts, uniformHosts, localUniformHosts);
		updateUniqueItems(setVersion, version, localVersion);
		updateUniqueItems(setTotalCores, totalCores, localTotalCores);
		updateUniqueItems(setHypervisor, hypervisor, localHypervisor);
		updateUniqueItems(setSubmitter, submitter, localSubmitter);
	};



	useEffect(() => {
		populateData();
	}, []);



	const handleReset = () => {
		setInputChange('')
		setSearchTerm('')
		setSelectedValues({
			total_hosts: [],
			primary_storage: [],
			total_sockets: [],
			matched_pair: [],
			system_description: [],
			total_threads: [],
			uniform_hosts: [],
			version: [],
			total_cores: [],
			hypervisor: [],
			submitter: [],
		});

	};


	const filters = [
		{ label: "Total Hosts", attribute: "total_hosts", tags: totalHosts },
		{ label: "Primary Storage", attribute: "primary_storage", tags: primaryStorage },
		{ label: "Total Sockets", attribute: "total_sockets", tags: totalSockets },
		{ label: "Matched Pair", attribute: "matched_pair", tags: ["Matched Pair", "Not Matched Pair"] },
		{ label: "System Description", attribute: "system_description", tags: systemDescription },
		{ label: "Total Threads", attribute: "total_threads", tags: totalThreads },
		{ label: "Uniform Hosts", attribute: "uniform_hosts", tags: ["True", "False"] },
		{ label: "Total Cores", attribute: "total_cores", tags: totalCores },
		{ label: "Hypervisor", attribute: "hypervisor", tags: hypervisor },
		{ label: "Submitter", attribute: "submitter", tags: submitter },
		{ label: "Version", attribute: "version", tags: version },
	]

	const manage_columns = [
		{ label: "Manage Columns", attribute: "manage_columns", tags: manageColumns },
	]

	const handleSearchSubmit = (e) => {
		e.preventDefault();
		setSearchTerm(inputChange?.trim())
		setIsSubmit(true)
	};

	const handleInputChange = (e) => {
		setIsSubmit(false)
		setInputChange(e.target.value)
	};

	const [openDropdown, setOpenDropdown] = useState(null);

	const toggleDropdown = (attribute) => {
		setOpenDropdown(openDropdown === attribute ? null : attribute);
	};

	function handleManageColumns(option) {
		setVisibleColumns(prev => {
			const newColumns = new Set(prev);
			if (newColumns.has(option)) {
				newColumns.delete(option);
			} else {
				newColumns.add(option);
			}
			return newColumns;
		});
	}

	const handleSort = (key) => {
		const sort = key;
		let sortorder = 'sorting_asc';
		if (sortConfig.sort === sort && sortConfig.sortorder === 'sorting_asc') {
			sortorder = 'sorting_dsc';
		}
		setSortConfig({ sort, sortorder });
	};

	const compareValues = (key, order = 'sorting_asc') => {
		return function (a, b) {
			if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
				return 0;
			}

			const varA = (typeof a[key] === 'string') ? a[key].toUpperCase() : a[key];
			const varB = (typeof b[key] === 'string') ? b[key].toUpperCase() : b[key];

			let comparison = 0;
			if (varA < varB) {
				comparison = -1;
			} else if (varA > varB) {
				comparison = 1;
			}

			if (varA === null || varA === undefined) comparison = -1;
			if (varB === null || varB === undefined) comparison = 1;

			return (
				(order === 'sorting_dsc') ? (comparison * -1) : comparison
			);
		};
	};

	const removeParenthesesContent = (strings) => {
		const regex = /\s+\([^)]*\)/;
		return strings.map(str => str.replace(regex, ''));
	}

	function mapSelectionToBoolean(selection) {
		const mapping = {
			"Matched Pair": true,
			"Not Matched Pair": false,
			"True": true,
			"False": false,
		};
		return mapping[selection];
	}



	useEffect(() => {
		let filteredData = categoryList.filter(item => {
			return Object.entries(selectedValues).every(([key, values]) => {
				if (values.length === 0) return true;

				const filterWithRemoveParentheses = (key) => {
					return removeParenthesesContent(values).some(selectedValue =>
						String(item[key]).includes(selectedValue)
					);
				};

				switch (key) {
					case "total_hosts":
					case "primary_storage":
					case "total_sockets":
					case "system_description":
					case "total_threads":
					case "total_cores":
					case "hypervisor":
					case "version":
						return filterWithRemoveParentheses(key);

					case "matched_pair":
						const booleanValues = values.map(mapSelectionToBoolean);
						return booleanValues.some(booleanValue => item.matched_pair === booleanValue);

					case "uniform_hosts":
						return values.map(mapSelectionToBoolean).some(booleanValue => item.uniform_hosts === booleanValue);

					case "submitter":
						return removeParenthesesContent(values).some(selectedValue =>
							item.submitter && item.submitter.submitter_data && item.submitter.submitter_data.includes(selectedValue)
						);

					default:
						return true;
				}
			});
		});

		if (searchTerm) {
			filteredData = filteredData.filter(item =>
				Object.values(item).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
			);
		}

		if (sortConfig.sort) {
			filteredData = filteredData.sort(compareValues(sortConfig.sort, sortConfig.sortorder));
		}

		setSearchResults(filteredData);
		const visibleData = filteredData.slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage);
		setShowData(visibleData);
		setStart(((currentPage - 1) * resultsPerPage) + 1);
		setEnd(visibleData.length < resultsPerPage ? ((currentPage - 1) * resultsPerPage) + visibleData.length : currentPage * resultsPerPage);

	}, [selectedValues, searchTerm, categoryList, currentPage, resultsPerPage, sortConfig]);

	const handleChange = (event) => {
		setResultsPerPage(event.target.value);
	};

	useEffect(() => {
		setTotalPages(Math.ceil(searchResults.length / resultsPerPage));
	}, [resultsPerPage, searchResults])

	useEffect(() => {
		setCurrentPage(1);
	}, [totalPages]);



	const handleClick = (page) => {
		setCurrentPage(page);
	};


	const downloadCSV = (array, filename = "download.csv") => {
		const header = array[0] && Object.keys(array[0]).join(',');
		const csv = [
			header,
			...array.map(row => Object.values(row).map(
				field => JSON.stringify(field)).join(','))
		].join('\r\n');

		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.setAttribute('hidden', '');
		a.setAttribute('href', url);
		a.setAttribute('download', filename);
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	const handleDownloadCSV = () => {
		const dataToDownload = searchResults.map(item => {
			const row = {};
			keysToDisplay.forEach(key => {
				if (visibleColumns.has(key)) {
					const dataKey = headerKeyMap[key];
					row[key] = item[dataKey];
				}
			});
			return row;
		});
		downloadCSV(dataToDownload, "searchResults.csv");
	};

	return (
		<div className='performance-only'>
			<div className='vmmark-top-search-container'>
				<div className='container'>

					<form onSubmit={handleSearchSubmit} className="search-bar">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="rgba(0,122,184,1)"><path d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z"></path></svg>
						<input
							type="text"
							value={inputChange}
							onChange={handleInputChange}
							placeholder="Search VMmark Results"
						/>
					</form>
					<div>
						<MultiSelectFilter
							items={filters}
							placeholder={searchTerm.trim()}
							selectedValues={selectedValues}
							setSelectedValues={setSelectedValues}
							onReset={handleReset}
						></MultiSelectFilter>
					</div>
				</div>
			</div>
			<div className='result-page'>
				<div className='results-info'>{start}-{end} of {searchResults.length}</div>
				<div className="results-dropdown">
					<span>Results Per Page: </span>
					<select value={resultsPerPage} onChange={handleChange} className="dropdown">
						<option value="10">10</option>
						<option value="20">20</option>
						<option value="30">30</option>
						<option value="40">40</option>
					</select>
				</div>
				<div className='manage-export'>
					<div className='manage-columns'>
						<Dropdown isOpen={openDropdown === 'columns'} toggle={() => toggleDropdown('columns')}>
							<DropdownToggle caret>
								Manage Columns
								<div className="dropdown-caret"></div>
							</DropdownToggle>
							<DropdownMenu>
								{keysToDisplay.map(option => (
									<DropdownItem key={option} toggle={false}>
										<label>
											<input
												type="checkbox"
												checked={visibleColumns.has(option)}
												onChange={() => handleManageColumns(option)}
											/>
											{option}
										</label>
									</DropdownItem>
								))}
							</DropdownMenu>
						</Dropdown>

					</div>
					<div className='export-data'>
						<Button onClick={handleDownloadCSV}>Export Data</Button>
					</div>
				</div>
			</div>

			<div className="table-results">
				<div className="scrollable-table">
					<table>
						<thead>
							<tr>
								{keysToDisplay.map((key) => {
									if (!visibleColumns.has(key)) return null;

									const dataKey = headerKeyMap[key];
									const isSticky = key === "Performance Score" || key === "Submitter";
									const className = isSticky ? 'sticky-col' : '';
									const isSortable = key === "Performance Score" || key === "Date";

									return (
										<th
											className={`${className} ${isSortable ? 'sortable' : ''}`}
											key={key}
											onClick={isSortable ? () => handleSort(dataKey) : undefined}
										>
											<div className='table-th-container'>
												<div className='table-text'>
													<p>{key}</p>

												</div>
												<div>
													{sortConfig.sort === dataKey && sortConfig.sortorder === 'sorting_asc' && (
														// <img src='/img/sort_asc.png' alt="Ascending" />
														<span>
															<i className="fa-solid fa-chevron-up sorted"></i>
															<i className="fa-solid fa-chevron-down"></i>
														</span>
													)}
													{sortConfig.sort === dataKey && sortConfig.sortorder === 'sorting_dsc' && (
														// <img src='/img/sort_desc.png' alt="Descending" />
														<span>
															<i className="fa-solid fa-chevron-up"></i>
															<i className="fa-solid fa-chevron-down sorted"></i>
														</span>
													)}
													{sortConfig.sort !== dataKey && isSortable && (
														// <img src='/img/sort_both.png' alt="Sortable" />
														<span>
															<i className="fa-solid fa-chevron-up"></i>
															<i className="fa-solid fa-chevron-down"></i>
														</span>
													)}
												</div>
											</div>
										</th>
									);
								})}
							</tr>
						</thead>
						{searchResults.length > 0 ? <tbody>
							{showData?.map(item => (
								<tr key={item.content_id}>
									{keysToDisplay.map(key => {
										const isSticky = key === "Performance Score" || key === "Submitter";
										const className = isSticky ? 'sticky-col' : '';
										if (!visibleColumns.has(key)) return null;
										const dataKey = headerKeyMap[key];
										let displayValue = item[dataKey];
										if (dataKey === 'matched_pair') {
											displayValue = item[dataKey] ? "Matched Pair" : "Not Matched Pair";
										}
										if (dataKey === 'uniform_hosts') {
											displayValue = item[dataKey] ? "True" : "False";
										}
										if (dataKey === 'submitter') {
											return <td className={className} key={`${item.content_id}-${key}`}><img src={item[dataKey].logo?.src} /></td>
										}

										// return <td className={className} key={`${item.content_id}-${key}`}>{displayValue}</td>;
										return <td className={className} key={`${item.content_id}-${key}`} dangerouslySetInnerHTML={{ __html: displayValue }}></td>;



									})}
								</tr>
							))}
						</tbody> : <tbody><tr><td colSpan={keysToDisplay.filter(key => visibleColumns.has(key)).length}>
							No data available
						</td></tr></tbody>}
					</table>

				</div>
				<div className='pagination-section'>
					<Pagination>
						<PaginationItem disabled={currentPage === 1}>
							<PaginationLink previous onClick={() => handleClick(currentPage - 1)} />
						</PaginationItem>
						{[...Array(totalPages).keys()].map((page) => (
							<PaginationItem key={page} active={page + 1 === currentPage}>
								<PaginationLink onClick={() => handleClick(page + 1)}>
									{page + 1}
								</PaginationLink>
							</PaginationItem>
						))}
						<PaginationItem disabled={currentPage === totalPages}>
							<PaginationLink next onClick={() => handleClick(currentPage + 1)} />
						</PaginationItem>
					</Pagination>
				</div>
			</div>
			<div className='related-vmmark-results'>
				<h3>Other Related VMmark Results</h3>
				<div className="card-row">
					{content_blocks.map((card, index) => (
						<div key={index} className="card">
							<Row>
								<Col xs="3">
									<ImageBase src="/img/resource-library/link.svg"
										alt="links" width="63" height="63" />
								</Col>

								<Col>
									<SiteLink to={card.links[0].url} target={card.links[0].target}><h4>{card.links[0].title}</h4></SiteLink>
								</Col>
							</Row>
						</div>
					))}
				</div>
			</div>
			<div dangerouslySetInnerHTML={{ __html: body }}></div>
		</div>);
}


const VMmarkLanding = (props) => {
	const tabHashMapping = {
		'Top Scores': 'top-scores',
		'Performance Only': 'performance-only',
		'Server Power-Performance': 'server-power-performance',
		'Server and Storage Power-Performance': 'server-storage-power-performance'
	};

	const tabsMap = {
		'top-scores': 'Top Scores',
		'performance-only': 'Performance Only',
		'server-power-performance': 'Server Power-Performance',
		'server-storage-power-performance': 'Server and Storage Power-Performance',
	}

	const location_hash = window.location.hash;
	const [activeTab, setActiveTab] = useState(tabsMap['top-scores']);
	const [hashFlag, setHashFlag] = useState(false);
	const [collapse, setCollapse] = useState(true);


	const toggleTab = (title) => {
		if (activeTab !== title) {
			setActiveTab(title);
			setHashFlag(true);
			setCollapse(true);
		}
	};

	const tabsData = [
		{
			id: '1',
			title: 'Top Scores',
			hashValue: 'top-scores',
		},
		{
			id: '2',
			title: 'Performance Only',
			hashValue: 'performance-only',
			content: props.data.list?.filter(list => list.category_name === 'Performance Only'),
		},
		{
			id: '3',
			title: 'Server Power-Performance',
			hashValue: 'server-power-performance',
			content: props.data.list?.filter(list => list.category_name === 'Server Power-Performance'),
		},
		{
			id: '4',
			title: 'Server and Storage Power-Performance',
			hashValue: 'server-storage-power-performance',
			content: props.data.list?.filter(list => list.category_name === 'Server and Storage Power-Performance'),
		}
	];

	// Sync state with URL hash changes
	useEffect(() => {
		setActiveTab(tabsMap[location_hash.substring(1)] || tabsMap['top-scores'])
	}, []);

	return (
		<Container id="VMmarkLanding">
			<SubHeadHero {...props} />
			<div className="container">
				<div className="horizontal-tab">
					<div className="horizontal-tab-toggle-title">Currently Viewing:</div>
					<button onClick={() => setCollapse(!collapse)} className="horizontal-tab-toggle">
						<Row>
							<Col className="text-left col-9">
								{activeTab}
							</Col>
							<Col className="text-right col-3">
								{collapse
									? <i className="bi brcmicon-caret-down"></i>
									: <i className="bi brcmicon-caret-up"></i>
								}
							</Col>
						</Row>
					</button>
					<div className="horizontal-tab-collapse-wrapper">
						<Collapse isOpen={!collapse} className="horizontal-tab-collapse">
							<Nav tabs>
								{tabsData.map((tab) => (
									<NavItem key={tab.id}>
										<NavLink
											className={classnames('lnk', activeTab === tab.title ? 'active' : '')}
											onClick={() => toggleTab(tab.title, tab.hashValue)}
											href={`#${tab.hashValue}`}
										>
											{tab.title}
										</NavLink>
									</NavItem>
								))}
							</Nav>
						</Collapse>
					</div>
				</div>
				<TabContent activeTab={activeTab}>
					{tabsData.map((tab) => (
						tab.title === 'Top Scores' ? <TabPane key={tab.id} tabId={tab.title}>
							<TopScores scores={props.data.vmmark_filter} spotlight={props.data.spotlight} body={props.data.body} content_blocks={props.content_blocks} url={window.location} activeTab={activeTab} location_hash={location_hash} hashFlag={hashFlag} />
						</TabPane>
							: <TabPane key={tab.id} tabId={tab.title}>
								<PerformanceOnly props={tab.content} tabsMapping={tabsMap} currentTab={activeTab} location_hash={location_hash} flag={hashFlag} content_blocks={props.content_blocks} body={props.data.body} />
							</TabPane>
					))}
				</TabContent>
			</div>
		</Container>
	);
}


export default VMmarkLanding;