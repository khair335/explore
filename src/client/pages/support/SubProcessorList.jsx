/**
 *  @file SubProcessorList.jsx
 *  @brief BE12-5 Subprocessors
 *  
 */
import config from 'client/config.js';
import React, { Component, Fragment } from 'react';
import PageComponent, {withPageData} from 'routes/page.jsx';
import SiteLink from "components/SiteLink.jsx";
import {SubHead} from 'components/subHeader.jsx';
import { RowLeftNav } from 'components/LeftNav.jsx';
import { Container, Row, Col } from 'reactstrap';
import { SelectTypeahead } from 'components/SelectTypeahead.jsx';
import Body from 'components/Body.jsx';
import classnames from 'classnames';
import queryString from 'query-string';
import Contact from 'components/Contact.jsx';
import { router } from 'routes/router.jsx'; 


import 'scss/pages/download-search.scss';
import 'scss/pages/subprocessor-list.scss';


export default class SubProcessorList extends PageComponent {
    constructor(props) {
        super(props);

        
        // Generate our filters based on data.
        this.filter_types = ["group", "products", "processor", "date"];
        this.headers = [{
            "attribute": "product_or_services",
            "label": "Products or Services",
            "sort": false,
        }, {
            "attribute": "service_provider",
            "label": "Service Provider",
            "sort": true,
        }, {
            "attribute": "processing_countries",
            "label": "Processing Countries",  
            "sort": false,
        }, {
            "attribute": "purposes_of_processing",
            "label": "Purpose(s) of Processing",
            "sort": true,
        }];
        

        let uniques = {};
        let filters = {};
        this.filter_levels = {};

        // Init
        this.filter_types.forEach(type => {
            filters[type] = [];
            uniques[type] = {};
        });


        // Get the list of filters derived from each subprocessor.
        this.sub_processors = [];

        // Flat us out and make a row for each supplier
        if (this.props.data.sub_processors) {
            this.props.data.sub_processors.forEach((subprocessor, index) => {
                let sp = Object.assign({}, subprocessor);       // Clone
                sp.product = {};

                // Transform the address to follow <Contact>
                if (sp.supplier_address) {
                    sp.supplier_address.address_line1 = sp.supplier_address.address_1;
                    sp.supplier_address.address_line2 = sp.supplier_address.address_2;
                    sp.supplier_address.address_line3 = sp.supplier_address.city;
                    if (sp.supplier_address.website_url) {
                        sp.supplier_address.web = {
                            url: sp.supplier_address.website_url,
                            target: "_blank",
                        };
                    }
                }

                // Fill in an unknown for now.
                if (!sp.processor_type) {                
                    sp.processor_type = "No Processor Type";
                }

                // // Flatten our product_group.
                // if (sp.product_group && Array.isArray(sp.product_group)) {
                //     sp.product_group = sp.product_group.join(', ');
                // }
               
                // if (sp.product_or_service && Array.isArray(sp.product_or_service)) {
                //     sp.product = sp.product_or_service.join(', ');
                // }

                // if (Array.isArray(subprocessor.product_or_service) && subprocessor.product_or_service.length > 0) {
                //     subprocessor.product_or_service.forEach(product => {
                //         sp = Object.assign({}, subprocessor);       // Clone
                
                //         sp.product = product;
                //         this.sub_processors.push(sp);
                //     });
                // }
                // else {
                //     this.sub_processors.push(sp);
                // }

                // Robust this.
                if (!sp.product_group) {
                    sp.product_group = [];
                }

                if (!sp.product_or_service) {
                    sp.product_or_service = [];
                }

                this.sub_processors.push(sp);
            });

        }


        this.sub_processors.forEach((subprocessor, index) => {
            let groups = [];
            let products = [];
            let processor = subprocessor.processor_type || '';

            // group
            if (subprocessor.product_group && Array.isArray(subprocessor.product_group)) {
                
                subprocessor.product_group.forEach(g => {
                    if (!filters['group'] || !filters['group'].some(filter => filter.label === g)) {

                        filters['group'].push({
                            id: '' + filters['group'].length,
                            label: g
                        });
                    }

                    groups.push(g);
                });
            }

            // product
            if (subprocessor.product_or_service && Array.isArray(subprocessor.product_or_service)) {
                subprocessor.product_or_service.forEach(p => {
                    if (!filters['products'] || !filters['products'].some(filter => filter.label === (p.part_number))) {

                        filters['products'].push({
                            id: '' + filters['products'].length,
                            label: p.part_number
                        });       
                    }

                    products.push(p.part_number);             
                });
            }

            // processor
            if (subprocessor.processor_type && (!filters['processor'] || !filters['processor'].some(filter => filter.label === subprocessor.processor_type))) {

                filters['processor'].push({
                    id: '' + filters['processor'].length,       // Make it a string
                    label: subprocessor.processor_type
                });
            }

            groups.forEach(group => {
                if (!this.filter_levels[group]) {
                    this.filter_levels[group] = {};
                }

                products.forEach(product => {
                    if (!this.filter_levels[group][product]) {
                        this.filter_levels[group][product] = {};
                    }

                    this.filter_levels[group][product][processor] = true;
                });

                // we don't have any association, so just mark it as empty.
                if (products.length === 0) {

                    if (!this.filter_levels[group]["None"]) {
                        this.filter_levels[group]["None"] = {};
                    }

                    this.filter_levels[group]["None"][processor] = true;
                }


            });
            
        });

        
        

        // Sort our filters.        

        let query = queryString.parse(this.props.location.search, {arrayFormat: 'bracket'}) || {};
        this.state = {
            resets: [0, 0, 0, 0],				// This is just an increment to tell our children that they should reset.
            filters: filters,
            selects: {},                        // What the user selected.
            subprocessors: [],		
            sortby: 'service_provider',            // Default
            sort_asc: true,            
        }

        // The filters
        this.filters = filters;
        this.state.selects = this.validateSelects(query);

        // Based off our selects, we should set our subsets.
        filters = Object.assign({}, this.filters);

        if (this.state.selects['products']) {
            this.getProductFilters(this.state.selects['products'], filters);
        }
        this.state.filters = this.sortFilters(filters);
        

        this.handleSortBy = this.handleSortBy.bind(this);
        this.getFiltered = this.getFiltered.bind(this);
    }

    componentDidMount() {
        super.componentDidMount();			// Load our video. Or any post injection needed. (See page.jsx).

        //this.handleSearch(this.state.search);
        this.filterSubprocessors(this.state.select, this.state.select_type);
    }

    locationDiff(query, prev_query) {
        // Compare our selects.
        if (query && prev_query) {
            for (let i=0; i<this.filter_types.length; i++) {
                if (query[this.filter_types[i]] !== prev_query[this.filter_types[i]]) {
                    return true;
                }
            }
        }

        return false;
    }

    // Return a valid select. Making sure case is correct.
    validateSelects(query) {

        let validated_selects = {};

        for (let i=0; i<this.filter_types.length; i++) {
            validated_selects[this.filter_types[i]] = '';
        }

        if (query) {
            
            for (let i=0; i<this.filter_types.length; i++) {
                let type = this.filter_types[i];
                if (query[type]) {
                    let f = this.state.filters[type].findIndex(filter => (query[type]?query[type].toLowerCase():'').trim() === filter.id.toLowerCase());
                    if (f !== -1) {
                        validated_selects[type] = this.state.filters[type][f].id;
                    }
                }
            }
        }

        // Reset
        return validated_selects;
    }


    componentDidUpdate(prevProps) {
        
        if (this.props.location !== prevProps.location) {
            let query = queryString.parse(this.props.location.search, {arrayFormat: 'bracket'}) || {};
            let prev_query = queryString.parse(prevProps.search, {arrayFormat: 'bracket'}) || {};

            if (1) {//this.locationDiff(query, prev_query)) {       // Just update everything even if query is blank.
                let filters =  Object.assign({}, this.filters);;
                let selects = this.validateSelects(query);
               
                if (selects['group']) {
                    this.getGroupFilters(this.state.selects['group'], filters);
                }
                if (selects['products']) {
                    this.getProductFilters(this.state.selects['products'], filters);
                }
                filters = this.sortFilters(filters);

                
                //this.handleSearch(query.q || '');
                this.setState({
                    selects: selects,
                    filters: filters,
                }, () => {
                    this.filterSubprocessors(this.validateSelects(query));
                });
                
            }
        }
    }

    setLocation() {
        let query = this.state.selects;

        let prev_query = queryString.parse(this.props.location.search, {arrayFormat: 'bracket'}) || {};
        
        // Set location only if we are different.
        if (this.locationDiff(query, prev_query)) {
            // Single page
            router.navigate({			
                search: `?${queryString.stringify(query, {encode: false, arrayFormat: 'bracket'})}`
            });
        }
    }



    filterSubprocessors(select, select_type) {
        
        // First the search.
        let subprocessors = null;

        // Now the filters.
        if (select && subprocessors) {
            subprocessors = subprocessors.filter(usesubprocessors => {
                //let found = false;
                // Do we contain our filter.
                if (usesubprocessors.filters && usesubprocessors.filters[select_type]) {
                    return usesubprocessors.filters[select_type].includes(select);
                }
                return false;
                /*this.filter_types.forEach(type => {
                    found = found || usesubprocessors.filters[type].includes(select);
                });*/

                //return found;
            });
            
        }

        this.setState({
            subprocessors: subprocessors,
        });
    }

    sortFilters(filters) {

        if (filters) {
            Object.keys(filters).forEach(key => {
                if (filters[key] && key !== 'date') {       // Don't sort the date.
                    filters[key] = filters[key].sort((a_filter, b_filter) => {
                        let a = a_filter.label || '';
                        let b = b_filter.label || '';

                        if (a === 'All') {
                            return -1;
                        }
                        else if (b === 'All') {
                            return 1;
                        }

                        return a.localeCompare(b);
                    });
                }
            });
        }

        return filters;
    }

    getGroupFilters(group_id, filters) {
        filters['products'] = [];
        filters['processor'] = [];

        let group = this.getFilterLabel('group', group_id);
        Object.keys(this.filter_levels[group]).forEach(product => {
            let p = this.filters['products'].find(p => p.label === product);
            if (p) {
                // Add only if unique.
                if (!filters['products'].some(q => q.label === p.label)) {
                    filters['products'].push(p);
                }
            }

            // processor
            Object.keys(this.filter_levels[group][product]).forEach(processor => {
                
                let p = this.filters['processor'].find(p => p.label === processor);
                if (p) {
                    if (!filters['processor'].some(q => q.label === p.label)) {
                        filters['processor'].push(p);
                    }
                }
            });
        });
    }

    getProductFilters(product_id, filters) {
        filters['processor'] = [];

        const productFilters = (product_id, group_id, filters) => {
            let group = this.getFilterLabel('group', group_id);
            let product = this.getFilterLabel('products', product_id);
            
            if (this.filter_levels[group][product]) {
                Object.keys(this.filter_levels[group][product]).forEach(processor => {
                    
                    let p = this.filters['processor'].find(p => p.label === processor);
                    if (p) {
                        if (!filters['processor'].some(q => q.label === p.label)) {
                            filters['processor'].push(p);
                        }
                    }
                });
            }
        }

        if (this.state.selects['group']) {
            productFilters(product_id, this.state.selects['group'], filters);
        }
        else {
            // Do all our groups.
            this.state.filters['group'].forEach(group => {
                productFilters(product_id, group.id, filters);
            });
        }

        
    }


    getFilterLabel(select_type, select_id) {
        let select = select_id || this.state.selects[select_type];

        if (this.state.filters[select_type] && Array.isArray(this.state.filters[select_type])) {
            let item = this.state.filters[select_type].find(filter => filter.id === select);

            if (item) {
                return item.label;
            }

        }
        return '';
    }
        
    handleSortBy(event, attribute) {
        this.setState({
            sortby: attribute,
            sort_asc: this.state.sortby === attribute?!this.state.sort_asc:true,
        });
    }

    getFiltered(processor_type) {
        let subprocessors = [];


        if (this.sub_processors) {
            subprocessors = this.sub_processors.filter(subprocessor => {
                
                if ((!processor_type || (processor_type === subprocessor.processor_type)) 
                    && (!this.state.selects['group'] || subprocessor.product_group.some(group => this.getFilterLabel('group') === group))
                    && (!this.state.selects['products'] || subprocessor.product_or_service.some(product => this.getFilterLabel('products') === product.part_number))) {

                        if (this.state.selects['date']) {
                            let today = new Date();
                            let last_updated = new Date(subprocessor.last_updated);

                            let date_diff = Math.round((today.getTime() - last_updated.getTime())/(1000 * 3600 * 24));

                            // 7, 30, 90, 365
                            let last_days = 7;
                            switch (this.state.selects['date']) {
                                case '0':
                                    last_days = 7;
                                break;
                                case '1':
                                    last_days = 30;
                                break;
                                case '2':
                                    last_days = 90;
                                break;
                                case '3':
                                    last_days = 365;
                                break;
                            }

                            if (date_diff <= last_days) {
                                return true;
                            }
                            
                          
                            return false;
                        }

                        return true;
                }

                
                return false;
            })
        }

        return subprocessors;
    }

    getSorted(processor_type) {
        let subprocessors = this.getFiltered(processor_type);

        if (this.state.sortby) {

           
            subprocessors = subprocessors.sort((a_subprocessor, b_subprocessor) => {
                let compare = 0;
                let a, b;
                switch (this.state.sortby) {
                   
                    case 'product_or_services':
                        a = (a_subprocessor.product_or_services?a_subprocessor.product_or_services.part_number:'') || '';
                        b = (b_subprocessor.product_or_services?b_subprocessor.product_or_services.part_number:'') || '';
                        compare = a.localeCompare(b);
                    break;
                    case 'service_provider':
                        a = a_subprocessor.service_provider || '';
                        b = b_subprocessor.service_provider || '';
                        compare = a.localeCompare(b);
                    break;
                    case 'processing_countries':
                        a = a_subprocessor.service_provider || '';
                        b = b_subprocessor.service_provider || '';
                        compare = a.localeCompare(b);
                    break;                    
                    case 'purposes_of_processing':
                        a = a_subprocessor.purposes_of_processing || '';
                        b = b_subprocessor.purposes_of_processing || '';
                        compare = a.localeCompare(b);
                    break;                 
                  
                }

                return this.state.sort_asc?compare:-compare;
            });
        }

        return subprocessors;
    }

    render() {
        return (
            <Container id="SubProcessorList">
                <SubHead {...this.props.page} />
                <div className="mb-3">
                    Last Updated: {this.props.data.last_updated}
                </div>
                <Body body={this.props.page.body} /> 
               

                <div className="mt-4">
                    <a id="top"></a>
                    <table className="table table-striped table-custom">
                        <thead className="thead-label">
                            <tr>
                                {this.headers.map(header =>
                                <th key={header.attribute} className={"th-"+header.attribute}>
                                    {header.sort ?
                                    <button onClick={event => this.handleSortBy(event, header.attribute)}>
                                        {header.label}                                       
                                    </button>
                                    : <Fragment>{header.label}</Fragment>
                                    }
                                </th>
                                )}
                            </tr>
                        </thead>
                        <thead className="thead-arrow">
                            <tr>
                                {this.headers.map(header =>
                                <th key={header.attribute}>
                                    {header.sort &&
                                    <button onClick={event => this.handleSortBy(event, header.attribute)}>
                                        <div className="">
                                        {this.state.sortby === header.attribute
                                            ? this.state.sort_asc
                                                ? <i className="bi brcmicon-sort-up"></i>
                                                : <i className="bi brcmicon-sort-down"></i>
                                            : <i className="bi brcmicon-sort"></i>
                                        }
                                        </div>
                                    
                                    </button>
                                    }
                                </th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {/* For each processor */}
                            {this.state.filters['processor'].filter(processor => (!this.state.selects['processor'] || (this.state.selects['processor'] === processor.id)) 
                                && this.getFiltered(processor.label).length > 0).sort((a_filter, b_filter) => {
                                    let a = a_filter.label || '';
                                    let b = b_filter.label || '';
                                    return a.localeCompare(b);
                                }).map(processor => (
                                <Fragment key={processor.id}>                                   
                                    {this.getSorted(processor.label).map((subprocessor, index) => (
                                    <tr key={subprocessor.content_id + index}>
                                        <td>{subprocessor.product_or_service && Array.isArray(subprocessor.product_or_service)? subprocessor?.product_or_service?.map(product => product.part_number).join(', '):''}</td>
                                        <td><SiteLink to={subprocessor.sub_processor_link} nolink target="_blank">{subprocessor.service_provider}</SiteLink></td>
                                        <td>{subprocessor?.processing_countries?.join(', ')}</td>
                                        <td>{subprocessor.purposes_of_processing}</td>
                                    </tr>
                                    ))}
                                </Fragment>
                            ))}
                           
                            
                        </tbody>

                    </table>
                </div>

            </Container>
        );
    }
}