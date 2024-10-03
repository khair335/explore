/**
 *  @file VMmarkLanding.jsx
 *  @brief VMmarkLanding
 *  
 */
import config from 'client/config.js';
import React, { Component, useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, useNavigate, useLocation, useHistory, useSearchParams } from 'react-router-dom';
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
// import DoubleScrollBar from 'react-double-scrollbar';
import DoubleScrollBar from 'components/DoubleScrollBar.jsx';
import Icon from 'components/Icon.jsx';
import { useLocationSearch } from 'routes/router.jsx';

import 'scss/pages/vmmark-landing.scss';



const TopScores = ({ scores, spotlight, url, location_hash, hashFlag, browser_version, finalTabsData }) => {
	const [modal, setModal] = useState(false);
	const [activeScore, setActiveScore] = useState(null);
	const navigate = useNavigate();
	const location = useLocation();

	const tabHashMapping = finalTabsData.reduce((acc, { category_name, hashValue }) => {
		acc[category_name] = hashValue;
		return acc;
	}, {});

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

	const buildQueryString = (params) => {
		return Object.keys(params)
			.map((key) => {
				// Append [] to keys except for "sort" and "sortorder"
				const formattedKey = key !== "sort" && key !== "sortorder" ? `${key}[]` : key;

				// If the value is an array, we need to append each item in the array
				if (Array.isArray(params[key])) {
					return params[key]
						.map((value) => `${formattedKey}=${encodeURIComponent(value)}`)
						.join('&');
				} else {
					// Single value handling
					return `${formattedKey}=${encodeURIComponent(params[key])}`;
				}
			})
			.join('&');
	};

	const [isExpanded, setIsExpanded] = useState(false);

	const toggleExpand = () => {
		setIsExpanded(!isExpanded);
	};

	// Sorting the spotlight items by date
	const sortedSpotlight = spotlight?.sort((a, b) => {
		let a_date = a.date || "";
		let b_date = b.date || "";
		return b_date.localeCompare(a_date);
	});

	// Slice the top 3 items
	const topItems = sortedSpotlight.slice(0, 3);
	const remainingItems = sortedSpotlight.slice(3);

	const appendSortOrder = (searchUrl) => {
		if (searchUrl.includes('score')) {
			return `${searchUrl}&sortorder=sorting_dsc`;
		} else if (searchUrl.includes('date')) {
			return `${searchUrl}&sortorder=sorting_dsc`;
		}
		return searchUrl;
	};

	return (

		<div className='top-scores'>
			{spotlight?.length > 0 && (
				<div className="spotlight-card">
					<div className="spotlight-title">Spotlight</div>
					{/* {spotlight.length > 3 && (
						<div className="expand-icon" onClick={toggleExpand}>
							{isExpanded ? <div className="dropdown-right" ></div> : <div className="dropdown-down"></div>}
						</div>
					)} */}

					


					<div className="spotlight-items">
						{topItems && topItems?.map((spotlight, index) => (
							<div key={index} className="spotlight-item">
								<div className="spotlight-date">{spotlight.date}</div>
								<SiteLink to={spotlight.link.url} target={spotlight.link.target}>
									<div className="spotlight-description">{spotlight.title}</div>
								</SiteLink>
							</div>
						))}
						{/* If expanded, show the remaining items */}
						{isExpanded && remainingItems && remainingItems?.map((spotlight, index) => (
							<div key={index + 3} className="spotlight-item">
								<div className="spotlight-date">{spotlight.date}</div>
								<SiteLink to={spotlight.link.url} target={spotlight.link.target}>
									<div className="spotlight-description">{spotlight.title}</div>
								</SiteLink>
							</div>
						))}
					</div>
					{spotlight.length > 3 && (
						<div className="expand-icon" onClick={toggleExpand}>
							{isExpanded ? (
								<>
									<span>SEE LESS</span>
									<div className="dropdown-right" />
								</>
							) : (
								<>
									<span>SEE MORE</span>
									<div className="dropdown-down" />
								</>
							)}
						</div>
					)}
				</div>
			)}
			<div className="card-container">
				{scores?.length > 0 && scores?.map((score, index) => (
					<div key={index} className="main-card">
						<div className="card-title">
							<h4>{score.filter_title}</h4>
							{score.abstract && <div>
								<button className="icon-bttn" title="info" aria-label="info" onClick={() => toggle(score)}>
									<i className="bi brcmicon-info-circle primary"></i>
								</button>
							</div>}
						</div>
						{score.filter_subtitle && <span className='card-subtitle'>{score.filter_subtitle}</span>}
						{score.vmmark_list?.length > 0 && <Table>
							<thead>
								<tr>
									{Object?.keys(score?.vmmark_list[0])?.map((key) => (
										key == 'system_description' ? <th key={key}>Description</th> : <th key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</th>
									))}
								</tr>
							</thead>
							<tbody>

								{score.vmmark_list.map((row, rowIndex) => (
									<tr key={rowIndex}>
										{Object.keys(row).map((key, keyIndex) => (
											<React.Fragment key={keyIndex}>
												<td className={key === "date" ? "date-column" : ""}
													dangerouslySetInnerHTML={{
														__html: key === "score" ?
															(parseFloat(row[key]?.split('@')[0])?.toFixed(2)) :
															key === "date" ?
																// Transform the date from yyyy-mm-dd to mm/dd/yyyy
																new Date(row[key])?.toLocaleDateString('en-us', { year:'numeric', month: "2-digit", day: "2-digit", timeZone: 'UTC' })
																:
																row[key]
													}}>
												</td>
											</React.Fragment>
										))}
									</tr>
								))}

							</tbody>
						</Table>}
						<SiteLink to={`${url.pathname}?${buildQueryString(queryString?.parse(appendSortOrder(score?.search_url)))}#${browser_version?.startsWith("4") ? "all-results" : tabHashMapping[score.category]}`}>
							<div className="card-button">VIEW ALL <i className="fa-solid fa-chevron-right"></i></div>
						</SiteLink>
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
		</div>
	);
};

const PerformanceOnly = ({ props, currentTab, tabsMapping, location_hash, location_search, flag, browser_version }) => {
	const navigate = useNavigate();
	let searchParams = queryString.parse(location_search, { arrayFormat: 'bracket' });
	const finalTabsData = tabsMapping;

	const determineInitialTab = (finalTabsData) => {
		for (let tab of finalTabsData) {
			if (tab.hashValue === 'top-results' && (props.data?.vmmark_filter || props.data?.spotlight)) {
				return 'top-results';
			}
			else if (tab.content && tab.content.length > 0) {
				return tab.hashValue;
			}
		}
		return finalTabsData[0].hashValue;
	};

	const currentHash = location.hash.substring(1);

	const findTabByHash = (hash, tabs) => {
		const matchingTab = tabs.find((tab) => tab.hashValue === hash);
		return matchingTab ? matchingTab.title : tabs.find((tab) => tab.hashValue === initialTab).title;
	};

	const initialTab = determineInitialTab(finalTabsData);
	const [activeTab, setActiveTab] = useState(findTabByHash(currentHash, finalTabsData) || currentTab);


	const updatedSelectValues = () => {
		const updatedSelectedValues = {};


		if (searchParams.total_hosts) {
			updatedSelectedValues.total_hosts = searchParams.total_hosts;
		} else {
			updatedSelectedValues.total_hosts = [];
		}

		if (searchParams.primary_storage) {
			updatedSelectedValues.primary_storage = searchParams.primary_storage;
		} else {
			updatedSelectedValues.primary_storage = [];
		}

		if (searchParams.processor_model) {
			updatedSelectedValues.processor_model = searchParams.processor_model;
		} else {
			updatedSelectedValues.processor_model = [];
		}

		if (searchParams.datacenter_management) {
			updatedSelectedValues.datacenter_management = searchParams.datacenter_management;
		} else {
			updatedSelectedValues.datacenter_management = [];
		}

		if (searchParams.type_of_storage) {
			updatedSelectedValues.type_of_storage = searchParams.type_of_storage;
		} else {
			updatedSelectedValues.type_of_storage = [];
		}

		if (searchParams.total_sockets) {
			updatedSelectedValues.total_sockets = searchParams.total_sockets;
		} else {
			updatedSelectedValues.total_sockets = [];
		}
		if (searchParams.matched_pair) {
			updatedSelectedValues.matched_pair = searchParams.matched_pair.map(value => {
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
			updatedSelectedValues.system_description = searchParams.system_description;
		} else {
			updatedSelectedValues.system_description = [];
		}

		if (searchParams.total_threads) {
			updatedSelectedValues.total_threads = searchParams.total_threads;
		} else {
			updatedSelectedValues.total_threads = [];
		}
		if (searchParams.uniform_hosts) {
			updatedSelectedValues.uniform_hosts = searchParams.uniform_hosts;
		} else {
			updatedSelectedValues.uniform_hosts = [];
		}

		if (searchParams.version) {
			updatedSelectedValues.version = searchParams.version;
		} else {
			updatedSelectedValues.version = [];
		}

		if (searchParams.total_cores) {
			updatedSelectedValues.total_cores = searchParams.total_cores;
		} else {
			updatedSelectedValues.total_cores = [];
		}
		if (searchParams.hypervisor) {
			updatedSelectedValues.hypervisor = searchParams.hypervisor;
		} else {
			updatedSelectedValues.hypervisor = [];
		}

		if (searchParams.submitter) {
			updatedSelectedValues.submitter = searchParams.submitter;
		} else {
			updatedSelectedValues.submitter = [];
		}

		return updatedSelectedValues;
	};

	const updateTerm = () => {
		const updateTerm = {};

		if (searchParams.term) {
			updateTerm.term = searchParams.term;
		} else {
			updateTerm.term = [];
		}

		return updateTerm;
	};

	const updatedSortConfig = () => {
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

		return updatedSortConfig;
	}


	const compareValues = (key, order = 'sorting_asc') => {
		return function (a, b) {
			if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
				return 0;
			}

			let varA, varB;

			if (key === 'score') {
				// Convert to numbers if the key is score
				varA = parseFloat(a[key]);
				varB = parseFloat(b[key]);
			} else {
				// Handle other cases (strings or other types)
				varA = (typeof a[key] === 'string') ? a[key].toUpperCase() : a[key];
				varB = (typeof b[key] === 'string') ? b[key].toUpperCase() : b[key];
			}

			let comparison = 0;
			if (varA < varB) {
				comparison = -1;
			} else if (varA > varB) {
				comparison = 1;
			}

			// Handle null or undefined values
			if (varA === null || varA === undefined) comparison = -1;
			if (varB === null || varB === undefined) comparison = 1;

			return (
				(order === 'sorting_dsc') ? (comparison * -1) : comparison
			);
		};
	};

	const [categoryList, setCategoryList] = useState(props[0]?.category_list)
	const [searchTerm, setSearchTerm] = useState('');
	const [inputChange, setInputChange] = useState('');
	const [isSubmit, setIsSubmit] = useState(false);
	const [totalHosts, setTotalHosts] = useState([]);
	const [primaryStorage, setPrimaryStorage] = useState([]);
	const [totalSockets, setTotalSockets] = useState([]);
	const [processorModel, setProcessorModel] = useState([]);
	const [typeOfStorage, setTypeOfStorage] = useState([]);
	const [datacenterManagement, setdatacenterManagement] = useState([]);
	const [matchedPair, setMatchedPair] = useState([]);
	const [systemDescription, setSystemDescription] = useState([]);
	const [totalThreads, setTotalThreads] = useState([]);
	const [uniformHosts, setUniformHosts] = useState([]);
	const [totalCores, setTotalCores] = useState([]);
	const [hypervisor, setHypervisor] = useState([]);
	const [submitter, setSubmitter] = useState([]);
	const [version, setVersion] = useState([]);
	const [searchResults, setSearchResults] = useState(categoryList);
	const [showData, setShowData] = useState(searchResults?.sort(compareValues('date', 'sorting_dsc')));
	const [keysToDisplay, setKeysToDisplay] = useState([]);
	const [manageColumns, setManageColumns] = useState(keysToDisplay)
	const [visibleColumns, setVisibleColumns] = useState(new Set(keysToDisplay));
	const [sortConfig, setSortConfig] = useState(updatedSortConfig());
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
		'Processor Model': 'processor_model',
		'Primary Storage': 'primary_storage',
		'vCenter Server': 'datacenter_management',
		// 'Primary Storage': 'type_of_storage',
		'Hypervisor': 'hypervisor',
		'VMmark Version': 'version',
		'Matched Pair': 'matched_pair',
		// 'Total Threads': 'total_threads',
		// 'Uniform Hosts': 'uniform_hosts',
		// 'Category': 'category',
	};



	const [selectedValues, setSelectedValues] = useState(updatedSelectValues());
	const [searchWord, setSearchWord] = useState(updateTerm());



	useEffect(() => {
		setSortConfig(updatedSortConfig())

		setSelectedValues(updatedSelectValues());

		setSearchWord(updateTerm())

	}, [location_search]);


	useEffect(() => {

		let prev_searchParams = queryString.stringify(searchParams);
		Object.keys(selectedValues).forEach(category => {
			const lowerCaseCategory = category?.toLowerCase();
			if (selectedValues[category].length > 0) {
				// Convert selected values to an array format
				searchParams[lowerCaseCategory] = selectedValues[category];
			} else {
				delete searchParams[lowerCaseCategory];
			}
		});

		Object.keys(searchWord).forEach(category => {
			const lowerCaseCategory = category?.toLowerCase();
			if (searchWord[category]?.length > 0) {
				searchParams[lowerCaseCategory] = searchWord[category];
			} else {
				delete searchParams[lowerCaseCategory];
			}
		});


		Object.keys(sortConfig).forEach(category => {
			if (sortConfig[category]) {
				searchParams[category?.toLowerCase()] = sortConfig[category]
			} else {
				delete searchParams[category?.toLowerCase()];
			}
		});

		const getHashKeyByActiveTab = (activeTab, tabs) => {
			const matchingTab = tabs.find(tab => tab.title === activeTab);
			return matchingTab ? matchingTab.hashValue : null;
		};

		// Usage of the function to get the `hashValue` based on the `activeTab`
		let hashKey = getHashKeyByActiveTab(activeTab, finalTabsData);

		// Update only on change. Change is occuring because of the useState isn't init properly.
		if (prev_searchParams !== queryString.stringify(searchParams)) {
			navigate({
				search: `?${queryString.stringify(searchParams, { arrayFormat: 'bracket' })}`,
				hash: location_hash,
			});
		}

	}, [JSON.stringify(selectedValues), searchTerm, JSON.stringify(searchWord), JSON.stringify(sortConfig), activeTab])

	const updateUniqueItems = (setter, existingItems, newItems) => {
		if (newItems.length === 0) {
			setter([]);
		} else {
			const uniqueSet = new Set(existingItems);
			newItems.forEach(item => uniqueSet.add(item));
			setter(sortFilters([...uniqueSet]));
		}
	};

	const sortFilters = (arr) => {
		return arr.sort((a, b) => {
			// Function to check if a value is a pure number (integer or float)
			const isNumeric = (value) => !isNaN(value) && !isNaN(parseFloat(value));

			// Function to extract numeric and non-numeric parts
			const splitMixedValue = (value) => {
				const regex = /(\d+(\.\d+)?|\D+)/g; // Matches numbers (including floats) and non-numeric parts
				return value.match(regex) || [];
			};

			// Function to compare two mixed values (e.g., 'abc 6.5' vs 'abc 6.5 U1')
			const compareMixedValues = (a, b) => {
				const aParts = splitMixedValue(a);
				const bParts = splitMixedValue(b);

				const length = Math.max(aParts.length, bParts.length);
				for (let i = 0; i < length; i++) {
					const aPart = aParts[i] || '';
					const bPart = bParts[i] || '';

					if (isNumeric(aPart) && isNumeric(bPart)) {
						const aNum = parseFloat(aPart);
						const bNum = parseFloat(bPart);
						if (aNum !== bNum) {
							return aNum - bNum;
						}
					} else {
						const comparison = aPart.localeCompare(bPart);
						if (comparison !== 0) {
							return comparison;
						}
					}
				}

				return 0; // They are equal
			};

			const aIsNumber = isNumeric(a);
			const bIsNumber = isNumeric(b);

			if (aIsNumber && bIsNumber) {
				// Both are numbers (including floats)
				return parseFloat(a) - parseFloat(b);
			} else if (aIsNumber) {
				// If only a is a number, it comes first
				return -1;
			} else if (bIsNumber) {
				// If only b is a number, it comes first
				return 1;
			} else {
				// Compare complex mixed values or regular strings
				return compareMixedValues(a, b);
			}
		});
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
		const localProcessorModel = [];
		const localTypeOfStorage = [];
		const localdatacenterManagement = [];

		props[0]?.category_list?.forEach(item => {
			if (item.total_hosts !== undefined && !localTotalHosts.includes(item.total_hosts)) localTotalHosts.push(item.total_hosts);
			if (item.processor_model !== undefined && !localProcessorModel.includes(item.processor_model)) localProcessorModel.push(item.processor_model);
			if (item.type_of_storage !== undefined && !localTypeOfStorage.includes(item.type_of_storage)) localTypeOfStorage.push(item.type_of_storage);
			if (item.datacenter_management !== undefined && !localdatacenterManagement.includes(item.datacenter_management)) localdatacenterManagement.push(item.datacenter_management);
			if (item.primary_storage !== undefined && !localPrimaryStorage.includes(item.primary_storage)) localPrimaryStorage.push(item.primary_storage);
			if (item.total_sockets !== undefined && !localTotalSockets.includes(item.total_sockets)) localTotalSockets.push(item.total_sockets);
			if (item.system_description !== undefined && !localSystemDescription.includes(item.system_description)) localSystemDescription.push(item.system_description);
			if (item.total_threads !== undefined && !localTotalThreads.includes(item.total_threads)) localTotalThreads.push(item.total_threads);
			if (item.version !== undefined && !localVersion.includes(item.version)) localVersion.push(item.version);
			if (item.total_cores !== undefined && !localTotalCores.includes(item.total_cores)) localTotalCores.push(item.total_cores);
			if (item.hypervisor !== undefined && !localHypervisor.includes(item.hypervisor)) localHypervisor.push(item.hypervisor);
			if (item.submitter?.submitter_data !== undefined && !localSubmitter.includes(item.submitter.submitter_data)) localSubmitter.push(item.submitter.submitter_data);
		});

		const newKeysToDisplay = ["Submitter", "Performance Score", "Date"]
		if (localTotalHosts.length > 0) newKeysToDisplay.push("Total Hosts");
		if (localTotalSockets.length > 0) newKeysToDisplay.push("Total Sockets");
		if (localTotalCores.length > 0) newKeysToDisplay.push("Total Cores");
		if (localSystemDescription.length > 0) newKeysToDisplay.push("Server Description");
		if (localProcessorModel.length > 0) newKeysToDisplay.push("Processor Model");
		if (localPrimaryStorage.length > 0) newKeysToDisplay.push("Primary Storage");
		// if (localTypeOfStorage.length > 0) newKeysToDisplay.push("Primary Storage");
		if (localHypervisor.length > 0) newKeysToDisplay.push("Hypervisor");
		if (localdatacenterManagement.length > 0) newKeysToDisplay.push("vCenter Server");
		if (localVersion.length > 0) newKeysToDisplay.push("VMmark Version");
		if (browser_version !== "1.0") newKeysToDisplay.push("Matched Pair");
		// if (localTotalThreads.length > 0) newKeysToDisplay.push("Total Threads");
		// if (browser_version !== "1.0") newKeysToDisplay.push("Uniform Hosts");
		// newKeysToDisplay.push("Category");

		setKeysToDisplay(newKeysToDisplay)
		setManageColumns(newKeysToDisplay)
		setVisibleColumns(new Set(newKeysToDisplay));

		updateUniqueItems(setTotalHosts, totalHosts, localTotalHosts);
		updateUniqueItems(setPrimaryStorage, primaryStorage, localPrimaryStorage);
		updateUniqueItems(setTotalSockets, totalSockets, localTotalSockets);
		updateUniqueItems(setSystemDescription, systemDescription, localSystemDescription);
		updateUniqueItems(setTotalThreads, totalThreads, localTotalThreads);
		updateUniqueItems(setVersion, version, localVersion);
		updateUniqueItems(setTotalCores, totalCores, localTotalCores);
		updateUniqueItems(setHypervisor, hypervisor, localHypervisor);
		updateUniqueItems(setSubmitter, submitter, localSubmitter);
		updateUniqueItems(setProcessorModel, processorModel, localProcessorModel);
		updateUniqueItems(setTypeOfStorage, typeOfStorage, localTypeOfStorage);
		updateUniqueItems(setdatacenterManagement, datacenterManagement, localdatacenterManagement);
	};



	useEffect(() => {
		populateData();
	}, []);



	const handleReset = () => {
		setInputChange('');
		setSearchTerm('');
		setSelectedValues({
			total_hosts: [],
			primary_storage: [],
			total_sockets: [],
			matched_pair: [],
			system_description: [],
			processor_model: [],
			type_of_storage: [],
			datacenter_management: [],
			total_threads: [],
			uniform_hosts: [],
			version: [],
			total_cores: [],
			hypervisor: [],
			submitter: [],
		});

		setSearchWord({
			term: [],
		});

	};


	const filters = [
		{ label: "Submitter", attribute: "submitter", tags: submitter },
		{ label: "Total Hosts", attribute: "total_hosts", tags: totalHosts },
		// { label: "Primary Storage", attribute: "primary_storage", tags: primaryStorage },
		{ label: "Total Sockets", attribute: "total_sockets", tags: totalSockets },
		{ label: "Total Cores", attribute: "total_cores", tags: totalCores },
		{ label: "Server Description", attribute: "system_description", tags: systemDescription },
		{ label: "Processor Model", attribute: "processor_model", tags: processorModel },
		{ label: "Primary Storage", attribute: "type_of_storage", tags: typeOfStorage },
		{ label: "Hypervisor", attribute: "hypervisor", tags: hypervisor },
		{ label: "vCenter Server", attribute: "datacenter_management", tags: datacenterManagement },
		{ label: "Version", attribute: "version", tags: version },
		{ label: "Matched Pair", attribute: "matched_pair", tags: ["Matched Pair", "Not Matched Pair"] },
		// { label: "Total Threads", attribute: "total_threads", tags: totalThreads },
		// { label: "Uniform Hosts", attribute: "uniform_hosts", tags: ["False", "True"] },
	]

	const manage_columns = [
		{ label: "Manage Columns", attribute: "manage_columns", tags: manageColumns },
	]

	const handleSearchSubmit = (e) => {
		e.preventDefault();
		setSearchTerm(inputChange?.trim());
		setIsSubmit(true);
		setInputChange('');
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
		let filteredData = categoryList?.filter(item => {
			return Object.entries(selectedValues).every(([key, values]) => {
				if (values.length === 0) return true;

				const filterWithRemoveParentheses = (key) => {
					return removeParenthesesContent(values).some(selectedValue =>
						String(item[key]) === selectedValue
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
					case "processor_model":
					case "type_of_storage":
					case "datacenter_management":
						return filterWithRemoveParentheses(key);

					case "matched_pair":
						const booleanValues = values.map(mapSelectionToBoolean);
						const itemMatchedPair = item.matched_pair ?? false;
						return booleanValues.some(booleanValue => itemMatchedPair === booleanValue);

					case "uniform_hosts":
						const uniformBoolean = values.map(mapSelectionToBoolean);
						const itemUniformHosts = item.uniform_hosts ?? false;
						return uniformBoolean.some(booleanValue => itemUniformHosts === booleanValue);

					case "submitter":
						return removeParenthesesContent(values).some(selectedValue =>
							item.submitter && item.submitter.submitter_data && item.submitter.submitter_data.includes(selectedValue)
						);

					default:
						return true;
				}
			});
		});


		if (searchWord?.term && searchWord.term.length > 0) {
			filteredData = filteredData?.filter(item =>
				Object.entries(item).some(([key, val]) =>
					searchWord.term.some(word => {
						const searchWords = word.toLowerCase().split(' ');

						const numberPart = searchWords.find(w => !isNaN(w));
						const keyPart = searchWords.filter(w => isNaN(w)).join(' ');

						const normalizedKey = key.replace(/_/g, ' ').toLowerCase();
						const normalizedValue = String(val).toLowerCase();

						const keyValueMatch = (normalizedKey === keyPart && normalizedValue === numberPart);

						const generalMatch = String(val).toLowerCase().includes(word.toLowerCase());

						return keyValueMatch || generalMatch;
					})
				)
			);
		}

		if (sortConfig?.sort) {
			filteredData = filteredData?.sort(compareValues(sortConfig.sort, sortConfig.sortorder));
		}

		setSearchResults(filteredData);
		const visibleData = filteredData?.slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage);
		setShowData(visibleData);
		setStart(filteredData?.length > 0 ? ((currentPage - 1) * resultsPerPage) + 1 : 0);
		setEnd(visibleData?.length < resultsPerPage ? ((currentPage - 1) * resultsPerPage) + visibleData.length : currentPage * resultsPerPage);

	}, [selectedValues, searchWord, categoryList, currentPage, resultsPerPage, sortConfig]);

	const handleChange = (event) => {
		setResultsPerPage(event.target.value);
	};

	useEffect(() => {
		setTotalPages(Math.ceil(searchResults?.length / resultsPerPage));
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
			keysToDisplay?.forEach(key => {
				if (visibleColumns.has(key)) {
					const dataKey = headerKeyMap[key];
					if (dataKey === "submitter") {
						row[key] = item[dataKey].submitter_data;
					} else if (dataKey === "system_description") {
						row[key] = item[dataKey].replace(/<\/?[^>]+(>|$)/g, "")
					} else if (dataKey === "score") {
						row[key] = item[dataKey]
						if (item?.disclosure_document?.url) {
							row["PDF"] = item?.disclosure_document?.url
						}
					} else if (dataKey === "matched_pair" || dataKey === "uniform_hosts") {
						if (item[dataKey]) {
							row[key] = "True"
						} else {
							row[key] = "False"
						}
					}
					else {
						row[key] = item[dataKey];
					}
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
						{/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="rgba(0,122,184,1)"><path d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z"></path></svg> */}
						<i className="fa fa-search"></i>
						<input
							type="text"
							value={inputChange}
							onChange={handleInputChange}
							placeholder="Search VMmark Results"
						/>
					</form>
					<div>
						<MultiSelectFilter
							items={browser_version === "1.0" ? filters?.filter(filter => filter.attribute !== "matched_pair" && filter.attribute !== "uniform_hosts") : filters}
							// placeholder={searchTerm.trim()}
							selectedValues={selectedValues}
							setSelectedValues={setSelectedValues}
							searchWord={searchWord}
							setSearchWord={setSearchWord}
							searchTerm={searchTerm}
							setSearchTerm={setSearchTerm}
							onReset={handleReset}
							description="A vSAN storage result runs all application workload virtual machines on VMware vSAN storage."
						></MultiSelectFilter>
					</div>
				</div>
			</div>
			<div className='result-page'>
				{searchResults?.length == 0 ? <div className='results-info'>0 of 0</div> : <div className='results-info'>{start}-{end} of {searchResults?.length}</div>}
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
					<DoubleScrollBar>
						<div className='vmmark-table'></div>
						<table>
							<thead>
								<tr>
									{keysToDisplay.filter(key => visibleColumns.has(key)).map((key, index) => {

										const dataKey = headerKeyMap[key];
										const isSticky = keysToDisplay.filter(k => visibleColumns.has(k) && (k === "Performance Score" || k === "Submitter")).length;			// HACK: JD - we are checking on every key, move it out.
										const className = classnames({
											'sticky-col': isSticky > 0 && index < isSticky,
											['sticky-col-' + index]: isSticky > 0 && index < isSticky,		// HACK
											'submitter-only': key === "Submitter",
											'performance-score': key === "Performance Score",
											'sticky-col-shadow': isSticky > 0 && isSticky - 1 === index,		// HACK: Just trying to get a shadow.
										});
										const isSortable = key === "Performance Score" || key === "Date";

										return (
											<th
												className={`${className} ${isSortable ? 'sortable' : ''}`}
												key={key + index}
												onClick={isSortable ? () => handleSort(dataKey) : undefined}
											>
												<div className='table-th-container'>
													<div className='table-text'>
														<p>{key}</p>

													</div>
													<div>
														{sortConfig?.sort === dataKey && sortConfig.sortorder === 'sorting_asc' && (
															// <img src='/img/sort_asc.png' alt="Ascending" />
															<span>
																<i className="fa-solid fa-chevron-up sorted"></i>
																<i className="fa-solid fa-chevron-down"></i>
															</span>
														)}
														{sortConfig?.sort === dataKey && sortConfig.sortorder === 'sorting_dsc' && (
															// <img src='/img/sort_desc.png' alt="Descending" />
															<span>
																<i className="fa-solid fa-chevron-up"></i>
																<i className="fa-solid fa-chevron-down sorted"></i>
															</span>
														)}
														{sortConfig?.sort === dataKey && sortConfig.sortorder === null && (
															// <img src='/img/sort_both.png' alt="Sortable" />
															<span>
																<i className="fa-solid fa-chevron-up"></i>
																<i className="fa-solid fa-chevron-down"></i>
															</span>
														)}
														{sortConfig?.sort !== dataKey && isSortable && (
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
							{searchResults?.length > 0 ? <tbody>
								{showData?.map((item, index) => (
									<tr key={`${item.content_id}-${index}`}>
										{keysToDisplay.filter(key => visibleColumns.has(key)).map((key, index) => {

											const isSticky = keysToDisplay.filter(k => visibleColumns.has(k) && (k === "Performance Score" || k === "Submitter")).length;			// HACK: JD - we are checking on every key, move it out.
											const className = classnames({
												'sticky-col': isSticky > 0 && index < isSticky,
												['sticky-col-' + index]: isSticky > 0 && index < isSticky,		// HACK
												'submitter-only': key === "Submitter",
												'performance-score': key === "Performance Score",
												'sticky-col-shadow': isSticky > 0 && isSticky - 1 === index,		// HACK: Just trying to get a shadow.
											});



											const dataKey = headerKeyMap[key];
											let displayValue = item[dataKey];
											if (dataKey === 'matched_pair') {
												displayValue = item[dataKey] ? "Matched Pair" : "Not Matched Pair";
											}
											if (dataKey === 'uniform_hosts') {
												displayValue = item[dataKey] ? "True" : "False";
											}
											if (dataKey === 'submitter') {
												return <td className={className} key={`${item.content_id}-${key}`}><SiteLink to={item[dataKey]?.url} target='__blank'><img src={item[dataKey].logo?.src} /></SiteLink></td>
											}

											if (dataKey === 'score') {
												return (
													<td className={className} key={`${item.content_id}-${key}`}>
														{/* <a href={`/details/${item.content_id}`} target="_blank">det</a> */}
														<span dangerouslySetInnerHTML={{ __html: displayValue }}></span>
														{/* <span dangerouslySetInnerHTML={{ __html: parseFloat(displayValue?.split('@')[0])?.toFixed(2) + " @" + displayValue?.split('@')[1] }}></span> */}
														{item?.disclosure_document?.url && <SiteLink to={item?.disclosure_document?.url} target='__blank'>Details<Icon type="pdf" /></SiteLink>}

													</td>
												);
											}

											if (dataKey === 'total_hosts' || dataKey === 'total_sockets' || dataKey === 'total_cores') {
												return <td className={className} key={`${item.content_id}-${key}`}>{displayValue} {key}</td>
											}

											if (dataKey === 'date') {
												return <td className={className} key={`${item.content_id}-${key}`} dangerouslySetInnerHTML={{ __html: new Date(displayValue)?.toLocaleDateString('en-us', { year:'numeric', month: "2-digit", day: "2-digit", timeZone: 'UTC' }) }}></td>
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
					</DoubleScrollBar>

				</div>
				<div className='pagination-section'>
					<Pagination>
						<PaginationItem disabled={currentPage === 1}>
							<PaginationLink previous onClick={() => handleClick(currentPage - 1)} />
						</PaginationItem>
						{totalPages > 0 && [...Array(totalPages)?.keys()]?.map((page) => (
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
		</div>);
}


const VMmarkLanding = (props) => {
	const location = useLocation();
	const location_search = useLocationSearch();
	const location_hash = location.hash;
	const [hashFlag, setHashFlag] = useState(false);
	const [collapse, setCollapse] = useState(true);
	let tabsData = []
	if (props.data.tabs_map) {
		tabsData = props.data.tabs_map.map((tab, index) => {
			const { tab_name, category_name } = tab;
			return {
				id: (index + 1 + 1).toString(),
				title: tab_name,
				hashValue: tab_name.toLowerCase().replace(/\s+/g, '-'), // Convert tab_name to a lowercase hyphenated hashValue
				content: props.data.list?.filter(list => list?.category_name === category_name), // Filter content based on category_name
				category_name: category_name,
			};
		});
	}
	else {
		tabsData = [
			{
				id: '1',
				title: 'Top Results',
				hashValue: 'top-results',
				category_name: 'Top Results',
			},
			{
				id: '2',
				title: 'Performance Only',
				hashValue: 'performance-only',
				content: props.data.list?.filter(list => list?.category_name === 'Performance Only'),
				category_name: 'Performance Only',
			},
			{
				id: '3',
				title: 'Server Power-Performance',
				hashValue: 'server-power-performance',
				content: props.data.list?.filter(list => list?.category_name === 'Server Power-Performance'),
				category_name: 'Server Power-Performance',
			},
			{
				id: '4',
				title: 'Server and Storage Power-Performance',
				hashValue: 'server-storage-power-performance',
				content: props.data.list?.filter(list => list?.category_name === 'Server and Storage Power-Performance'),
				category_name: 'Server and Storage Power-Performance',
			},
			{
				id: '5',
				title: 'Performance',
				hashValue: 'performance',
				content: props.data.list?.filter(list => list?.category_name === 'Performance'),
				category_name: 'Performance',
			},
			{
				id: '5',
				title: props.data.version?.startsWith("4") ? 'All Results' : 'Performance Score',
				hashValue: props.data.version?.startsWith("4") ? 'all-results' : 'performance-score',
				content: props.data.list?.filter(list => list?.category_name === 'Performance Score'),
				category_name: props.data.version?.startsWith("4") ? 'All Results' : 'Performance Score',
			},
		];
	}
	const finalTabsData = [...tabsData];

	const toggleTab = (title) => {
		if (activeTab !== title) {
			setActiveTab(title);
			setHashFlag(true);
			setCollapse(true);
		}
	};

	const determineInitialTab = (finalTabsData) => {
		for (let tab of finalTabsData) {
			if (tab.hashValue === 'top-results' && (props.data?.vmmark_filter || props.data?.spotlight)) {
				return 'top-results';
			}
			else if (tab.content && tab.content.length > 0) {
				return tab.hashValue;
			}
		}
		// Fallback to the first tab if none have content
		return finalTabsData[0].hashValue;
	};

	const currentHash = location.hash.substring(1);

	const findTabByHash = (hash, tabs) => {
		const matchingTab = tabs.find((tab) => tab.hashValue === hash);
		return matchingTab ? matchingTab.title : tabs.find((tab) => tab.hashValue === initialTab).title;
	};

	const initialTab = determineInitialTab(finalTabsData);
	const [activeTab, setActiveTab] = useState(findTabByHash(currentHash, finalTabsData));



	// Sync state with URL hash changes
	useEffect(() => {


		setActiveTab(findTabByHash(currentHash, finalTabsData));

		// setActiveTab(tabsMap[location_hash.substring(1)] || tabsMap['top-scores'])
	}, [location]);

	return (
		<div>
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
									{finalTabsData.map((tab) => {
										if ((tab.title == "Top Results") && (props.data?.vmmark_filter || props.data?.spotlight)) {
											return (
												<NavItem key={tab.id}>
													<NavLink
														className={classnames('lnk', activeTab === tab.title ? 'active' : '')}
														onClick={() => toggleTab(tab.title, tab.hashValue)}
														href={`#${tab.hashValue}`}
													>
														{tab.title}
													</NavLink>
												</NavItem>
											)
										}
										if (tab.title != "Top Results" && !props.data.version?.startsWith("4") && props?.data?.list?.some(item => item.category_name == tab.category_name)) {
											return (
												<NavItem key={tab.id}>
													<NavLink
														className={classnames('lnk', activeTab === tab.title ? 'active' : '')}
														onClick={() => toggleTab(tab.title, tab.hashValue)}
														href={`#${tab.hashValue}`}
													>
														{tab.title}
													</NavLink>
												</NavItem>
											)
										}

										if (tab.title == "All Results" && props.data.version?.startsWith("4")) {
											return (
												<NavItem key={tab.id}>
													<NavLink
														className={classnames('lnk', activeTab === tab
															.title ? 'active' : '')}
														onClick={() => toggleTab(tab.title, tab.hashValue)}
														href={`#${tab.hashValue}`}
													>
														{tab.title}
													</NavLink>
												</NavItem>
											)
										}
									})}
								</Nav>
							</Collapse>
						</div>
					</div>
					<TabContent activeTab={activeTab}>
						{finalTabsData.map((tab) => (
							(tab.title === 'Top Results') ? <TabPane key={tab.id} tabId={tab.title}>
								<TopScores scores={props.data?.vmmark_filter} spotlight={props.data?.spotlight} url={window.location} activeTab={activeTab} location_hash={location_hash} hashFlag={hashFlag} browser_version={props.data.version} finalTabsData={finalTabsData} />
							</TabPane>
								: <TabPane key={tab.id} tabId={tab.title}>
									<PerformanceOnly props={tab.content} tabsMapping={finalTabsData} currentTab={activeTab} location_hash={location_hash} flag={hashFlag} location_search={location_search} browser_version={props.data.version} />
								</TabPane>
						))}
					</TabContent>
				</div>
			</Container>
			<div>
				{props?.content_blocks && <div className='related-vmmark-results'>
					<div className="container">
						<h3>Other Related VMmark Results</h3>
						<div className="card-row">
							{props.content_blocks?.map((card, index) => (
								<div key={index} className="card">
									<Row>
										<Col xs="3">
											<Icon type="link" />
										</Col>

										<Col>
											<SiteLink to={card?.links[0]?.url} target={card?.links[0]?.target}><h4>{card?.links[0]?.title}</h4></SiteLink>
										</Col>
									</Row>
								</div>
							))}
						</div>
					</div>
				</div>}
				{props.data.body && <div className='fair-guidelines'>
					<div className="container">
						<div dangerouslySetInnerHTML={{ __html: props.data.body }}></div>
					</div>
				</div>}
			</div>
		</div>
	);
}


export default VMmarkLanding;