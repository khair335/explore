/**
 *  @file ProductLibrary.jsx
 *  @brief ProductLibrary for component templates.
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


import 'scss/templates/products-library.scss';

const ProductLibrary = (props) => {
	const navigate = useNavigate();
    let locationSearch = useLocationSearch();;
	let searchParams = queryString.parse(locationSearch, { arrayFormat: 'bracket' });

	const [products, setProducts] = useState(props.content_block?.products || []);
	const [inputChange, setInputChange] = useState(searchParams.term || '');
	const [searchTerm, setSearchTerm] = useState(searchParams.term || '');
	const [sortMode, setSortMode] = useState('category');
	const [displayData, setDisplayData] = useState(products);
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

		const filters = [
			{
				"title": "A-D",
				"links": []
			},
			{
				"title": "E-I",
				"links": []
			},
			{
				"title": "L-S",
				"links": []
			},
			{
				"title": "T-Z",
				"links": []
			},
		]

		const getCategory = (title) => {
			const firstLetter = title[0].toUpperCase();
			if (firstLetter >= 'A' && firstLetter <= 'D') {
				return "A-D";
			} else if (firstLetter >= 'E' && firstLetter <= 'I') {
				return "E-I";
			} else if (firstLetter >= 'L' && firstLetter <= 'S') {
				return "L-S";
			} else if (firstLetter >= 'T' && firstLetter <= 'Z') {
				return "T-Z";
			}
		};

		// Iterate through products, filter and assign to filters
		products.forEach((product) => {
			const category = getCategory(product.title);
			const filter = filters.find((filter) => filter.title === category);
			if (filter) {
				filter.links.push(product);
			}
		});

		// Sort the links array in each filter by title in ascending order
		filters.forEach((filter) => {
			filter.links.sort((a, b) => a.title.localeCompare(b.title));
		});

		const updatedProducts = filters.map(product => {
			if (product.title) {
				let hash = encodeTabHash(product.title);
				hash = hash.replace(/[^\w_-]+/g, "");
				product.hash = encodeTabHash(hash);
			}
			return product;
		});
		setProducts(updatedProducts);
		setDisplayData(updatedProducts);
	}, []);

	useEffect(() => {
		const count = displayData.reduce((acc, product) => {
			acc += (product.links ? product.links.length : 0);
			return acc;
		}, 0);

		setResultCount(count);

	}, [displayData]);

	useEffect(() => {
		let processedData = [...products];

		if (searchTerm) {
			processedData = processedData.map(product => {
				const filteredLinks = product.links?.filter(link => link.title.toLowerCase().includes(searchTerm.toLowerCase())) || [];
				return { ...product, links: filteredLinks };
			}).filter(product => product.links.length > 0);
		}

		if (sortMode === 'a-z' || sortMode === 'z-a') {
			let allLinks = [];
			processedData.forEach(category => {
				allLinks.push(...(category.links || []));
			});
			allLinks.sort((a, b) => sortMode === 'a-z' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title));

			processedData = [{ links: allLinks }];
		}

		setDisplayData(processedData);
	}, [products, searchTerm, sortMode]);

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

	const getNestedNavs = (products) => {
		return products.map(product => ({
			hash: product.hash || generateHash(product.title),
			label: product.title,
		}));
	};

	return (
		<div className="ProductLibrary">

			<SideInPageNavigation navs={getNestedNavs(products)} resultCount={resultCount} handleSearchSubmit={handleSearchSubmit} handleInputChange={handleInputChange} inputChange={inputChange}>
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

				<div className={classnames("product-library-modules")}>
					{displayData.map((product, index) => (
						<Fragment key={product.hash} >
							<ResourceSection show={sortMode === 'category'} hash={product.hash}>
								<h3>{product.title}</h3>
								{product.links && product.links.length > 0 && <ImageCard links={product.links} />}
							</ResourceSection>
						</Fragment>
					))}
				</div>
			</SideInPageNavigation>
		</div>
	)
}

ProductLibrary.propTypes = {
	content_block: PropTypes.object.isRequired,
};

export default withLiveEvents(ProductLibrary);

const ResourceSection = ({ show, hash, children }) => {
	const Tag = show ? 'section' : 'div';
	return (
		<Tag id={hash} className="product-library-module-section">
			{children}
		</Tag>
	);
};

const ImageCard = ({ links }) => {
	return (
		<div className="product-library-container">
			{links.map((link, index) => (
				<div className="card" key={link.content_id}>
					<div className="card-body">
						<Row>
							<Col>
								<SiteLink to={link.url} className="card-title" key={link.content_id || index}>{link.title}</SiteLink>
							</Col>
						</Row>
					</div>
				</div>
			))}
		</div>
	);
};