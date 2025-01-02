/**
 *  @file ExploreSearchVideos.jsx
 *  @brief ExploreSearchVideos
 *
 */
import config from 'client/config.js';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SiteLink from "components/SiteLink.jsx";
import ImageBase from "components/ImageBase.jsx";
import { SubHead } from 'components/subHeader.jsx';
import { Container } from 'reactstrap';
import liveEvents from 'components/liveEvents.js';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import queryString from 'query-string';
import Loading from 'components/Loading.jsx';
import { VideoCard } from 'templates/cards/CardFactory.jsx';

import 'scss/pages/explore-search-videos.scss';
import SwiftypeMultiSelectFilter, {
    SwiftMultiSelectFilterProvider,
    useSwiftypeMultiSelectFilterState,
    SwiftypeAPIUrl,
} from 'components/SwiftypeMultiSelectFilter.jsx';

const ExploreSearchVideos = (props) => {
    return (
        <SwiftMultiSelectFilterProvider initialSortBy='updated_date'
            initialSortDirection='desc'
            initialPerPage={12} >
            <ExploreSearchVideosContent {...props} />
        </SwiftMultiSelectFilterProvider>
    );
};

// const base_url = `https://api.swiftype.com/api/v1/public/engines/search.json?engine_key=FGq2x_7zpGpZ68xHePFN&document_types[]=videos&filters[videos][vod_on_demand_publish][]=!False&filters[videos][complete]=true&filters[videos][state]=ACTIVE`;

const ExploreSearchVideosContent = (props) => {
    // let video_search = {
    //     explore_endpoint: `${base_url}&facets[videos][]=products&facets[videos][]=sessiontype&facets[videos][]=audience&facets[videos][]=track&facets[videos][]=level&filters[videos][year][]=!&filters[videos][account]=explore`,
    //     vmware_endpoint: `${base_url}&filters[videos][account]=vmware`,
    //     document_type: 'videos',
    // };
    const navigate = useNavigate();
    const location_search = window.location.search;

    const CUSTOM_FILTERS_MAP = [
        { attribute: "products", label: "Product" },
        { attribute: "sessiontype", label: "Session Type" },
        { attribute: "audience", label: "Audience" },
        { attribute: "track", label: "Track"},
        { attribute: "level", label: "Level"}]

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [sortKey, setSortKey] = useState('most-recent');
    const [loading, setLoading] = useState(false);

    const {
        filters, setFilters,
        searchTerm, setSearchTerm,
        selectedFilters, setSelectedFilters,
        searchWord, setSearchWord,
        apiResults, setApiResults,
        apiURls, setAPIUrls,
        sortBy, setSortBy,
        sortDirection, setSortDirection,
        page, setPage,
        perPage, setPerPage,
    } = useSwiftypeMultiSelectFilterState();

    const [inputText, setInputText] = useState(searchTerm || '');

    const [videoCount, setVideoCount] = useState(0);
    const [videos, setVideos] = useState([]);
    const [loadCount, setLoadCount] = useState(0);

    useEffect(() => {
        liveEvents();
    }, []);

    // build API url to update results
    useEffect(() => {
        // const endpoint = !props?.nofilter ? video_search.explore_endpoint : video_search.vmware_endpoint

        const url = SwiftypeAPIUrl(config.video_search.endpoint,
            config.video_search.document_type,
            searchWord,
            selectedFilters,
            page,
            perPage,
            sortBy,
            sortDirection
        );

        if (url.length > 0) {
            setAPIUrls([url]);
        }

    }, [JSON.stringify(searchWord), JSON.stringify(selectedFilters), page, perPage, sortBy, sortDirection]);

    useEffect(() => {
        const results = (Array.isArray(apiResults) && apiResults.length > 0)? apiResults[0] : {};


        // Update the videos and videoCount when apiResults change
        const fetchedVideos = results.records?.[config.video_search.document_type] || [];
        if (page === 1) {
            setVideos(fetchedVideos);
            setLoadCount(fetchedVideos.length);
        } else {
            // Append new results to existing videos
            setVideos((prevVideos) => [...prevVideos, ...fetchedVideos]);
            setLoadCount((prevCount) => prevCount + fetchedVideos.length);
        }
        const totalResults = results.info?.videos?.total_result_count || 0;
        setVideoCount(totalResults);
    }, [apiResults]);

    const toggle = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleSelect = (key) => {
        setSortKey(key);
        // Update sortBy and sortDirection in SwiftypeMultiSelectFilterState
        if (key === 'most-recent') {
            setSortBy('updated_date');
            setSortDirection('desc');
        } else if (key === 'most-viewed') {
            setSortBy('views');
            setSortDirection('desc');
        }
        setPage(1);
        setPerPage(12)
        setVideos([]);
        setLoadCount(0);
    };

    const loadMore = () => {
        // Increment the page number to fetch more results
        setPage((prevPage) => prevPage + 1);
    };

    const handleInputChange = (e) => {
        setInputText(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setSearchTerm(inputText.trim());
        // Reset page and videos when search term changes
        setPage(1);
        setVideos([]);
        setLoadCount(0);
    };

    const handleFilterReset = () => {
        setSearchTerm('');
        setInputText('');
        setSelectedFilters({});
        setPage(1);
        setPerPage(12);
        setVideos([]);
        setLoadCount(0);
    };

    const handleFilterChange = () => {
        setPage(1);
        setPerPage(12);
        setVideos([]);
        setLoadCount(0);
    };

    return (
        <div id="ExploreSearchVideos">
            <div className='video-top-search-container'>
                <Container className='videosearch-container'>
                    <SubHead {...props.page} />
                    <SwiftypeMultiSelectFilter
                        apiURL={config.video_search.endpoint}
                        documentType={config.video_search.document_type}
                        onChangeFilters={handleFilterChange}
                        onClearFilters={handleFilterReset}
                        placeholder={props.data.search_box_text}
                        setLoadCount={setLoadCount}
                        noFilter={props.nofilter}
                        filtersMap={CUSTOM_FILTERS_MAP}
                        videos={videos}
                        setVideos={setVideos}
                    />
                </Container>
            </div>
            <Loading isLoading={loading}>
                <Container className='videoresult-container'>
                    <div className='video-search-result-container'>
                        <div className='video-count'>{videoCount} results</div>
                        <div className='sort-btn-group'>
                            <div><label className='sort-by'>Sort By</label></div>
                            <Dropdown isOpen={dropdownOpen} toggle={toggle}>
                                <DropdownToggle className='sort-btn' caret>
                                    {sortKey === 'most-recent' ? 'Most Recent' : 'Most Viewed'}
                                </DropdownToggle>
                                <DropdownMenu className='sort-pop-up'>
                                    <DropdownItem onClick={() => handleSelect('most-recent')}>Most Recent</DropdownItem>
                                    <DropdownItem onClick={() => handleSelect('most-viewed')}>Most Viewed</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                    </div>

                    <div className='video-panel'>
                        {videos?.map((video, index) => (
                            <VideoCard video={video} key={index} noname={props.noname} />
                        ))}
                    </div>
                    {(videoCount > loadCount) && (
                        <button className='load-button' onClick={() => loadMore()}>
                            Load More
                        </button>
                    )}
                </Container>
            </Loading>
        </div>
    );
};

export default ExploreSearchVideos;