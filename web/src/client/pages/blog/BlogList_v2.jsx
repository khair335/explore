/**
 *  @file BlogList_v2.jsx
 *  @brief A dumb component that just displays the contents of state.blogList, more request is passed back to caller to route to search/fetch
 *          currently two views, a card style view and a columns in rows list view 
 *          to use:
 *          <BlogList blogList={this.state.blogList} pageCount={this.state.pageCount} page={this.state.page} />
 * 
 *          css located in blog_v2.scss
 */
import config from 'client/config.js';
import React, { Fragment, useEffect } from 'react';
import { useState, useContext, useCallback } from 'react';
import PropTypes from "prop-types";
import { Container, Row, Col, Card } from 'reactstrap';
import utils, { setMeta, fetchAPI, localizeText } from 'components/utils.jsx';
import BrcmShare from "components/brcmShare.jsx";
import SiteLink from 'components/SiteLink.jsx';
import ImageBase from 'components/ImageBase.jsx';
import Loading from 'components/Loading.jsx';
import classnames from 'classnames';
import { BlogResultsContext } from './BlogComponents_v2.jsx';
import TypeAhead from 'components/TypeAhead.jsx';
import { SelectTypeahead, MultiSelectTypeahead } from 'components/SelectTypeahead.jsx';
import Litepicker from 'litepicker';


const PER_PAGE = 12;     // This needs to be dynamic for different grid sizes and browser.


const BlogListRow = ({ post }) => {
    let date = new Date(post.publish_date);

    return (
        <div className='blogListing' >
            <Row >
                <Col className='date'>{post.publish_date}</Col>
                <Col className='content'><SiteLink to={post.url} key={post.external_id}>{post.title}</SiteLink></Col>
                <Col className='author'>
                    {post.authors.map(author => {

                        return (
                            <Row key={author.id}>
                                <Col><SiteLink to={author.url}>{author.name}</SiteLink></Col>
                            </Row>
                        )
                    })}
                </Col>
            </Row>
        </div>
    );
}

export const BlogGridCard = ({ post, allSeries }) => {
    let seriesBadge;

    if (post?.series) {
        allSeries?.map(series => {
            if (post.series == series.title) {
                seriesBadge = series;
            }
        })
    }

    return (
        <Card className="BlogListCard" key={post.external_id}>
            <div className='box'>
                <div className='blogDate'>{post.publish_date}</div>
                <SiteLink to={post.url}>
                    <ImageBase image={post.banner_image}
                        resizewidth="374"
                        sizes={{ sm: 735, md: 470, lg: 448, xl: 568 }}
                        fadein
                        className="img-fluid mx-auto"
                    />
                    {seriesBadge &&
                        <Fragment>
                            <ImageBase image={seriesBadge.thumbnail} className={classnames("seriesBadge", seriesBadge.title.replace(/\s/g, "-"))} />
                            <span className='seriesTitle'>{post.series_title}</span>
                        </Fragment>
                    }

                </SiteLink>
                <div className='blogContent'>
                    <h4 className='blogShortTitle'><SiteLink to={post.url} dangerouslySetInnerHTML={{ __html: post.title }}></SiteLink></h4>

                    <div className='blogAuthors'>
                        {post.authors.map(author => {
                            return (
                                (author.url ?
                                    <div key={author.content_id}>
                                        <SiteLink to={author.url}>{author.name}</SiteLink>
                                    </div>
                                    :
                                    <div className='noUrlAuthor'>{author.name}</div>
                                )
                            )
                        })}
                    </div>
                    <div className='blogCats'>
                        {post.category.map(cat => {
                            return <SiteLink type="SiteLink"
                                className='bttn icon-bordr-bttn'
                                key={cat}
                                to={`${config.blog_search.url}?filters[pages][category][type]=or&filters[pages][category][values][]=${cat}`}>
                                {cat}
                            </SiteLink>
                        })}
                    </div>
                </div>
            </div>



        </Card>
    );
}

// Set up the throttler 
const throttle = (fn, delay) => {   // Capture the current time   
    let time = Date.now();    // Here's our logic   
    return () => {
        if ((time + delay - Date.now()) <= 0) {
            // Run the function we've passed to our throttler,       
            // and reset the `time` variable (so we can check again).       
            fn();
            time = Date.now();
        }
    }
}


const BlogInfiniteResults = ({ className, PostComponent, allSeries, ...rest }) => {
    const { blogPosts, loading } = useContext(BlogResultsContext);
    const { currentPage, setCurrentPage, totalPages, totalPosts, loadingNextPage, setLoadingNextPage } = useContext(BlogResultsContext);


    // https://www.searchenginejournal.com/how-google-crawls-pages-with-infinite-scrolling/439008/#close
    // SEO and infinte scroll
    const handleInfiniteScroll = useCallback(() => {
        const height_of_card = 350 * 4;     // Height of cards and 4 rows.
        const end_of_page = window.innerHeight + window.scrollY >= document.body.offsetHeight - height_of_card;

        if (end_of_page && !loading && !loadingNextPage) {
            if (currentPage + 1 < totalPages) {
                setLoadingNextPage(true);
                setCurrentPage(currentPage + 1);
            }
        }
    }, [currentPage, totalPages, loading]);


    const handleInfiniteScrollEnd = useCallback(() => {

        // Handle when we reached the end.
        if (!loading && !loadingNextPage && (window.innerHeight + Math.round(window.scrollY) >= document.body.scrollHeight)) {

            if (currentPage + 1 < totalPages) {
                setCurrentPage(currentPage + 1);
            }
        }

    }, [loading, currentPage, totalPages]);



    // Init once.
    useEffect(() => {
        // Inifinite scroll affect.
        const handle = handleInfiniteScroll; //throttle(handleInfiniteScroll, 1000);
        const handle_end = handleInfiniteScrollEnd; //throttle(handleInfiniteScrollEnd, 200);

        window.addEventListener("scroll", handle);
        window.addEventListener("scrollend", handle_end);

        // Cleanup
        return () => {
            // Remove the event listener.
            window.removeEventListener("scroll", handle);
            window.removeEventListener("scrollend", handle_end);
        };

    }, [loading, handleInfiniteScroll, handleInfiniteScrollEnd]);

    useEffect(() => {
        // Check if we aren't loading and we have extra space to load.


        if (currentPage + 1 < totalPages
            && !loading
            && window.innerHeight + window.scrollY === document.body.offsetHeight) {
            let element = document.getElementById('blog-infinite');

            // Check the bottom of our results container and see if theres room to load if there isn't a scroll bar
            if (element && element.getBoundingClientRect().bottom < document.body.offsetHeight) {
                setCurrentPage(currentPage + 1);
            }

        }

    }, [loading, totalPages, JSON.stringify(blogPosts)]);


    return (
        <div {...rest} id="blog-infinite">
            {/* use loading for only more */}
            {totalPosts > 0 &&
                <div className={className}>
                    {blogPosts.map((post) => {
                        return (
                            <PostComponent post={post} key={post.external_id} allSeries={allSeries} />
                        )
                    })}
                </div>
            }

            <Loading isLoading={loading} className="loading" >
                <div className={className}>

                </div>
            </Loading>
        </div>
    );
}


const BlogList = (props) => {
    const { blogPosts, loading } = useContext(BlogResultsContext);                                    //current list of posts
    const { sortBy, setSortBy, sortAsc, setSortAsc } = useContext(BlogResultsContext);                //for sorting listView
    const { currentPage, setCurrentPage, totalPages, totalPosts, query, topics } = useContext(BlogResultsContext);

    const [view, setView] = useState(props.view || 'grid');                                           //default view -  a switch 
    const [author, setAuthor] = useState(props.author || "");

    const handleSort = useCallback((sortby) => {                                                      //sort on pause till final layout
        let sort = sortAsc;

        if (sortby === sortBy) sort = !sortAsc;

        setSortBy(sortby);
        setSortAsc(sort);

    });


    return (
        <section id="BlogsList">
            <span className={classnames('bb_element_background_dots', { 'hide': totalPosts < 6 })}></span>
            {props.showListHeader && (
                <Row id="listHead">
                    <Col>
                        {(author === "") ?
                            <h4 className='queryResults'>
                                {(query === "") ?
                                    <Fragment>
                                        {totalPosts} {topics ? localizeText("B023", "results for") + " " + topics : localizeText("C121", "results")}
                                    </Fragment>
                                    :
                                    <Fragment>
                                        {totalPosts}&nbsp;{localizeText("B023", "results for")}&nbsp;&ldquo;{query}&rdquo;
                                    </Fragment>
                                }
                            </h4>
                            :
                            <h4 className='queryResults'>
                                {localizeText("B029", "All Posts by")}&nbsp;{author}
                            </h4>
                        }
                    </Col>
                    <Col>
                        <div className="group-toggle-bttn" >
                            <label className={classnames({ "active": view == "grid" })} aria-label="grid" tabIndex="0" role="radio" >
                                <input type="radio" autoComplete="off" name="product-view" value="grid" onClick={() => setView("grid")} defaultChecked={(view == "grid") ? true : false} />
                                <span className="bttn"><i className="bi brcmicon-th"></i><span className="sr-only">{localizeText("C098", "Grid")}</span></span>
                            </label>
                            <label className={classnames({ "active": view == "list" })} aria-label="list" tabIndex="0" role="radio">
                                <input type="radio" autoComplete="off " name="product-view" value="list" onClick={() => setView("list")} defaultChecked={(view == "list") ? true : false} />
                                <span className="bttn"><i className="bi brcmicon-list-ul"></i><span className="sr-only">{localizeText("C099", "List")}</span></span>
                            </label>
                        </div>
                    </Col>
                </Row>
            )}

            {(view === 'grid') ?
                <Row>
                    <Col>
                        {/* grid view */}
                        <BlogInfiniteResults className="gridView" PostComponent={BlogGridCard} allSeries={props.allSeries} />
                    </Col>
                </Row>
                :
                <Fragment>                                                                  {/* list view */}
                    <Row>
                        <Col onClick={() => handleSort('publish_date')}>
                            {localizeText("B024", "Date")}
                            {(sortBy === 'publish_date') ?
                                (sortAsc) ?
                                    <span className="bi brcmicon-sort-up"></span>
                                    : <span className="bi brcmicon-sort-down"></span>
                                : <span className='bi brcmicon-sort'></span>
                            }
                        </Col>
                        <Col onClick={() => handleSort('title')}>
                            {localizeText("B025", "Title")}
                            {(sortBy === 'title') ?
                                (sortAsc) ?
                                    <span className="bi brcmicon-sort-up"></span>
                                    : <span className="bi brcmicon-sort-down"></span>
                                : <span className='bi brcmicon-sort'></span>
                            }
                        </Col>
                        <Col onClick={() => handleSort('author_name')}>
                            {localizeText("B026", "Author")}
                            {(sortBy === 'author_name') ?
                                (sortAsc) ?
                                    <span className="bi brcmicon-sort-up"></span>
                                    : <span className="bi brcmicon-sort-down"></span>
                                : <span className='bi brcmicon-sort'></span>
                            }
                        </Col>
                    </Row>

                    <BlogInfiniteResults className="listView" PostComponent={BlogListRow} />
                </Fragment>
            }
        </section>
    )

}

export default BlogList;

export const BlogSearchBox = (props) => {
    const { setCategories, setSeries, setQuery, searchQuery, setTopics } = useContext(BlogResultsContext);
    const { series, categories, query } = useContext(BlogResultsContext);
    const { publishDateRange, setPublishDateRange } = useContext(BlogResultsContext);
    const { goToSearch } = useContext(BlogResultsContext);     // Are we our landing page and require a search button to go to our search page?
    const [datePicker, setDatePicker] = useState(null);    // Keep track of our litepicker.
    const [reset, setReset] = useState(0);                  // Force a rerender of our select boxes.
    const [disabledSearch, setDisabledSearch] = useState(true);
    const [delay_timeout, setDelayQueryTimeout] = useState(0);      // Keep track of our timeout.


    const handleSeriesSelect = useCallback((series) => {
        setSeries(series ? [series] : []);        // Make it an array for now.
    });

    const handleCategoriesSelect = useCallback((categories) => {
        setCategories(categories.map(category => category.label));        // Make it an array for now.
    });

    const handleClear = useCallback(() => {
        setSeries([]);
        setCategories([]);
        setPublishDateRange({ to: null, from: null });
        setQuery('');
        setReset(reset + 1);
        setTopics([]);
    });

    const handleSearch = useCallback(() => {
        searchQuery();      // Manually call a search which redirects to the search landing.
    });

    const handleClearQuery = useCallback(() => {
        setQuery('');      // Manually call a search which redirects to the search landing.
    });


    const delaySetQuery = useCallback((q) => {
        
        
        if (delay_timeout) {
            clearTimeout(delay_timeout);           
        }

        let dt = setTimeout(() => {
            setQuery(q);
        }, 300);

        setDelayQueryTimeout(dt);
        
    });

    let init_series = props.series || [];
    init_series = init_series.filter(c => (series && series.length ? (series.findIndex(s => s === c.title) > -1) : false)).map(s => s.title);     // Flatten it.  Make sure our categories exists.

    // Only one selection for <SelectTypeAhead>
    init_series = init_series.length ? init_series[0] : '';


    let init_categories = props.categories || [];
    init_categories = init_categories.filter(c => (categories && categories.length ? (categories.findIndex(s => s === c.title) > -1) : false)).map(c => c.title);     // Flatten it.  Make sure our categories exists.

    // HACK: there is dupe data for categories in dev. just remove the dupes.
    init_categories = [...new Set(init_categories)];

    const series_items = props.series.map(series => { return { id: series.title, label: series.title } });
    const category_items = props.categories.map(category => { return { id: category.title, label: category.title } });


    // Init once
    if (props.showFilterFacets) {
        useEffect(() => {
            const formatDate = (date) => {
                var year = date.getFullYear();
                var month = date.getMonth() + 1;
                var day = date.getDate();

                if (day < 10) {
                    day = '0' + day;
                }
                if (month < 10) {
                    month = '0' + month;
                }
                return year + '-' + month + '-' + day;
            }

            const picker = new Litepicker({
                element: document.getElementById('blog-search-box-date'),
                singleMode: false,
                numberOfMonths: 1,          // Show 2 months
                numberOfColumns: 1,         // Show them on one row.
                startDate: (publishDateRange.from ? new Date(publishDateRange.from + 'T00:00:00') : null) || null,
                endDate: (publishDateRange.to ? new Date(publishDateRange.to + 'T00:00:00') : null) || null,
                dropdowns: { "minYear": (new Date().getFullYear()) - 4, "maxYear": null, "months": true, "years": true },
                setup: (picker) => {
                    picker.on('selected', (date1, date2) => {
                        // only set if there are 2 dates 
                        if (date1.dateInstance && date2.dateInstance) {
                            setPublishDateRange({
                                from: formatDate(date1.dateInstance),
                                to: formatDate(date2.dateInstance),
                            });
                        }

                    });
                },
            });

            setDatePicker(picker);

        }, []);
    }

    // Has any data changed which warrents the search button to be active.
    useEffect(() => {

        // Disable the button if there hasn't been any selection.
        setDisabledSearch(!(query || series.length || categories.length || publishDateRange.to || publishDateRange.from))


    }, [query, JSON.stringify(series), JSON.stringify(categories), JSON.stringify(publishDateRange)]);

    // Date changed
    useEffect(() => {
        if (datePicker) {
            if (publishDateRange.from && publishDateRange.to) {

                let from = new Date(publishDateRange.from + 'T00:00:00');
                let to = new Date(publishDateRange.to + 'T00:00:00');

                // Only change on date change.
                if (from.getTime() !== datePicker.getStartDate()?.dateInstance?.getTime() || to.getTime() !== datePicker?.getEndDate()?.dateInstance?.getTime()) {
                    datePicker.setDateRange(new Date(publishDateRange.from + 'T00:00:00'), new Date(publishDateRange.to + 'T00:00:00'));
                }
            }
            else {
                // Clear our date.
                datePicker.clearSelection();
            }

        }

    }, [publishDateRange]);



    return (
        <div>
            {props.showSearch && (
                <Row>
                    <Col lg={12}>
                        <span className="bi brcmicon-search"></span>
                        <TypeAhead className="blogSearchBox"
                            endpoint={config.blog_search.typeahead_endpoint}
                            results_page={config.blog_search.url}
                            placeholder="Search Blog"
                            query={query}
                            onChange={delaySetQuery}
                            onEnter={searchQuery}
                            onClear={handleClearQuery}
                            clear
                        />
                    </Col>
                </Row>
            )}
            <Row>
                <Col lg={12}>
                    {/* this is empty space for the MultiSelectTypeahead facets to print into */}
                </Col>
            </Row>
            {props.showFilterFacets && (
                <Row>
                    <Col xl={3} lg={2} md={2} xs={12} className='search-pulldown'>
                        <span className="bi brcmicon-caret-down"></span>
                        <MultiSelectTypeahead init={init_categories} items={category_items} defaultLabel="Category" placeholder="Category" className="multidownloadproduct" onSelect={handleCategoriesSelect} onChange={handleCategoriesSelect} reset={reset} />

                    </Col>
                    <Col xl={3} lg={2} md={2} xs={12} className='search-pulldown'>
                        <span className="bi brcmicon-caret-down"></span>
                        <SelectTypeahead init={init_series} items={series_items} defaultLabel="Series" placeholder="Series" className={classnames("selectdownloadproduct bc--color_gray800")} onSelect={handleSeriesSelect} reset={reset} />

                    </Col>
                    <Col xl={3} lg={3} md={3} xs={12} className='search-pulldown'>
                        <span className="bi brcmicon-caret-down"></span>
                        <input id="blog-search-box-date" placeholder='Publication Date' readOnly />

                    </Col>
                    <Col>
                        <button onClick={handleClear}>{localizeText("B028", "Clear")}</button>
                    </Col>
                    {goToSearch &&
                        <Col>
                            <button className={classnames("primary-bttn", { "disabled-bttn": disabledSearch })} onClick={handleSearch} aria-disabled={disabledSearch ? "true" : "false"} > Search</button>
                        </Col>
                    }
                </Row>
            )
            }
            {
                props.showCategories && (
                    <Row>
                        <Col lg={12} className='category-buttons'>
                            {props.categories.map(category => {
                                return <SiteLink className="bordr-bttn bttn" to={`${config.blog_search.url}?filters[pages][category][type]=or&filters[pages][category][values][]=${category.title}`}>{category.title}</SiteLink>
                            })}
                        </Col>
                    </Row>
                )
            }
        </div>
    )
}
