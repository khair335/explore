/**
 *  @file ResourceLibrary.jsx
 *  @brief ResourceLibrary for component templates.
 */
import config from 'client/config.js';
import utils, { encodeTabHash } from 'components/utils.jsx';
import React, { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import queryString from 'query-string';
import PropTypes from "prop-types";
import { Container, Row, Col } from 'reactstrap';
import SiteLink from 'components/SiteLink.jsx';
import ImageBase from 'components/ImageBase.jsx';
import SideInPageNavigation from 'templates/SideInPageNavigation.jsx';
import classnames from "classnames";
import { withLiveEvents } from 'components/liveEvents.js';
import { useLocationSearch } from 'routes/router.jsx';


import 'scss/templates/resource-library.scss';

const ResourceLibrary = ({ content_block }) => {
    const navigate = useNavigate();
    let locationSearch = useLocationSearch();;
    let searchParams = queryString.parse(locationSearch, { arrayFormat: 'bracket' });

    const [categories, setCategories] = useState(content_block?.categories || []);
    const [searchTerm, setSearchTerm] = useState(searchParams.term || '');
    const [inputChange, setInputChange] = useState(searchParams.term || '');
    const [sortMode, setSortMode] = useState('category');
    const [displayData, setDisplayData] = useState(categories);
    const [resultCount, setResultCount] = useState(0)


    useEffect(() => {
        setInputChange(searchParams.term || '');
        setSearchTerm(searchParams.term || '');
    }, [locationSearch]);

    useEffect(() => {

        let update = (searchParams['term'] || '' ) !== searchTerm;  // Could be undefined so check that

        if (searchTerm) {
            searchParams['term'] = searchTerm;
        } else {
            delete searchParams['term'];

        }

        // Stop adding history if we are the same
        
        if (update) {
            navigate({
                search: `${queryString.stringify(searchParams)}`,
                hash: location.hash,
            });
        }

    }, [searchTerm]);

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
                        }
                        return subCategory;
                    });
                }
            }
            return category;
        });
        setDisplayData(updatedCategories);
    }, []);

    useEffect(() => {
        const count = displayData.reduce((acc, category) => {
            acc += (category.links ? category.links.length : 0);

            if (category.categories) {
                acc += category.categories.reduce((subAcc, subCategory) => {
                    return subAcc + (subCategory.links ? subCategory.links.length : 0);
                }, 0);
            }

            return acc;
        }, 0);

        setResultCount(count);
    }, [displayData]);

    useEffect(() => {
        let processedData = [...categories];

        if (searchTerm) {
            processedData = processedData.map(category => {
                const filteredLinks = category.links?.filter(link => link.title.toLowerCase().includes(searchTerm.toLowerCase())) || [];
                const filteredSubCategories = category.categories?.map(subCat => {
                    const subFilteredLinks = subCat.links?.filter(link => link.title.toLowerCase().includes(searchTerm.toLowerCase())) || [];
                    return { ...subCat, links: subFilteredLinks };
                }).filter(subCat => subCat.links.length > 0); // Keep subcategories that have matching links

                return { ...category, links: filteredLinks, categories: filteredSubCategories };
            }).filter(category => category.links.length > 0 || (category.categories && category.categories.length > 0));
        }

        if (sortMode === 'a-z' || sortMode === 'z-a') {
            let allLinks = [];
            processedData.forEach(category => {
                allLinks.push(...(category.links || []));
                category.categories?.forEach(subCategory => {
                    allLinks.push(...(subCategory.links || []));
                });
            });
            allLinks.sort((a, b) => sortMode === 'a-z' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title));

            processedData = [{ links: allLinks }];
        }

        setDisplayData(processedData);
    }, [categories, searchTerm, sortMode]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setSearchTerm(inputChange.trim());
    };

    const handleInputChange = (e) => {
        setInputChange(e.target.value);
    };

    const handleSort = (e) => {
        setSortMode(e.target.value);
    };

    const generateHash = (title) => {
        return title.toLowerCase().replace(/\s+/g, '-');
    }

    const getNestedNavs = (categories) => {
        return categories.map(category => ({
            hash: category.hash || generateHash(category.title),
            label: category.title,
            subNavs: category.categories?.map(subCategory => ({
                hash: subCategory.hash || generateHash(subCategory.title),
                label: subCategory.title
            }))
        }));
    };

    return (
        <div className="ResourceLibrary">

            <SideInPageNavigation navs={getNestedNavs(categories)} resultCount={resultCount} handleSearchSubmit={handleSearchSubmit} handleInputChange={handleInputChange} inputChange={inputChange}>
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
                    {displayData.map((category, index) => (
                        <Fragment key={category.hash} >
                            <ResourceSection show={sortMode === 'category'} hash={category.hash}>
                                <h3>{category.title}</h3>
                                {category.links && category.links.length > 0 && <LeftImageCard links={category.links} />}
                                {category.categories && category.categories.map((subCategory) => (
                                    <ResourceSection key={subCategory.hash} show={false /* We dont want sub sections active*/} hash={subCategory.hash}>
                                        <h5>{subCategory.title}</h5>
                                        {subCategory.links && subCategory.links.length > 0 && <LeftImageCard links={subCategory.links} />}
                                    </ResourceSection>
                                ))}
                            </ResourceSection>

                        </Fragment>
                    ))}
                </div>
            </SideInPageNavigation>
        </div>
    );
};

ResourceLibrary.propTypes = {
    content_block: PropTypes.object.isRequired,
};

export default withLiveEvents(ResourceLibrary);

const ResourceSection = ({ show, hash, children }) => {
    const Tag = show ? 'section' : 'div';
    return (
        <Tag id={hash} className="resource-library-module-section">
            {children}
        </Tag>
    );
};

const LeftImageCard = ({ links }) => {
    return (
        <div className="resource-library-container">
            {links.map((link, index) => (
                <div className="card" key={link.content_id}>
                    <div className="card-body">
                        <Row>
                            {link.content_type == 'document' &&
                                <Col xs="3">
                                    <ImageBase src="/img/resource-library/icon Acrobat File PDF.svg"
                                        alt="pdf" width="63" height="63" />
                                </Col>
                            }
                            {link.content_type == 'video' &&
                                <Col xs="3">
                                    <ImageBase src="/img/resource-library/icon Video File.svg"
                                        alt="video" width="63" height="63" />
                                </Col>
                            }
                            {link.content_type == 'links' &&
                                <Col xs="3">
                                    <ImageBase src="/img/resource-library/icon Link.svg"
                                        alt="links" width="63" height="63" />
                                </Col>
                            }
                            <Col>
                                <SiteLink to={link.url} target={link.target} subtype={link.subtype} className="card-title" key={link.content_id || index}>{link.title}</SiteLink>
                                {link.description && <p dangerouslySetInnerHTML={{ __html: link.description }}></p>}
                            </Col>
                        </Row>
                    </div>
                </div>
            ))}
        </div>
    );
};