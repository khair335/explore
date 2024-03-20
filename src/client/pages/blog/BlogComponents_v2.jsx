/**
 *  @file BlogComponents.jsx
 *  @brief 
 */

import config from 'client/config.js';
import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';
import Loading from 'components/Loading.jsx';
import { withRouter } from 'routes/withRouter.jsx';
import { router, useLocationSearch } from 'routes/router.jsx';
import queryString from 'query-string';
import utils, { localizeText } from 'components/utils.jsx';

export const BlogResultsContext = createContext(null);

const PER_PAGE = 12;     // This needs to be dynamic for different grid sizes and browser.

const useIsInit = () => {
    const isInitRef = useRef(true);
    useEffect(() => {
        isInitRef.current = false;
    }, []);
    return isInitRef.current;
};

const dateForm = (date) => {    //there is a similar copy of this in BlogDetail_v2.jsx - these should be combined with import/export

    if (config.locale === "en-us") {
        let newDate = new Date(date);
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return months[newDate.getMonth()] + " " + newDate.getUTCDate() + ", " + newDate.getFullYear();
    } else {
        return utils.formatDateForLocale(date)
    }

}

export const BlogResultsProvider = withRouter(({ location, children, author, goToSearch, excludes }) => {
    const isInit = useIsInit();                             // Remember our first init.
    const location_search = goToSearch ? '' : window.location.search;//useLocationSearch();      // Who cares about params on landing.

    // Stateful
    const search = queryString.parse(location_search, { arrayFormat: 'bracket' });
    const default_search = 'sort_direction[pages]=desc&sort_field[pages]=publish_date';        // This is a hack if we are default don't update our history.

    // Categories
    let search_categories = []
    if (search["filters[pages][category][values]"] && search["filters[pages][category][values]"].length) {
        search_categories = search["filters[pages][category][values]"].map(category => category.replace(/[^a-z0-9_®©\s]/gi, ''));
    }
    const [categories, setCategories] = useState(search_categories);       // An array of categories.

    // Series
    let search_series = ''
    if (search["filters[pages][series][values]"] && search["filters[pages][series][values]"].length) {
        search_series = search["filters[pages][series][values]"].map(series => series.replace(/[^a-z0-9_®©\s]/gi, ''));
    }
    const [series, setSeries] = useState(search_series);       // Single series.

    const [publishDateRange, setPublishDateRange] = useState({
        to: search["filters[pages][publish_date][to]"] ? search["filters[pages][publish_date][to]"].replace(/[^a-z0-9_\s\.:-]/gi, null) : null,
        from: search["filters[pages][publish_date][from]"] ? search["filters[pages][publish_date][from]"].replace(/[^a-z0-9_\s\.:-]/gi, null) : null,
    });



    const [sortBy, setSortBy] = useState(search["sort_field[pages]"] ? search["sort_field[pages]"].replace(/[^a-z0-9_®©\s]/gi, '') : 'publish_date');
    const [sortAsc, setSortAsc] = useState(search["sort_direction[pages]"] === 'asc' ? true : false);

    const [query, setQuery] = useState(search['q'] || '');

    // 
    let search_topics = ''
    if (search["filters[pages][blog_topics][values]"] && search["filters[pages][blog_topics][values]"].length) {
        search_topics = search["filters[pages][blog_topics][values]"].map(topic => topic.replace(/[^a-z0-9_®©\s]/gi, ''));
    }
    const [topics, setTopics] = useState(search_topics);

    const [blogPosts, setBlogPosts] = useState([]);         // To account for infinte scroll, we will have an array of pages of posts.
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);      // Swiftype is 1 base, but we will do 0 base
    const [totalPages, setTotalPages] = useState(0);
    const [totalPosts, setTotalPosts] = useState(0);
    const [loadingNextPage, setLoadingNextPage] = useState(false);  // We are jumping the gun, so let's keep track if we are going to the next page.

    // Keep track of our fetch so we can abort.
    const [fetched, setFetched] = useState(null);

    // Force an update.
    const [reset, setReset] = useState(0);
    const [currentQ, setCurrentQ] = useState('');

    // Reset state of pages if other queries occur.
    useEffect(() => {

        if (!goToSearch) {
            // Make our page stateful. Only on any changes, not first page load.
            setCurrentPage(0);
            setReset((reset) => reset + 1);     // Force an update jic current page is the same.

            // Build the query and just redirect to the search page.
            let q = buildQuery();

            let params = q.join('&');

            // Strip out our default search.
            params = params.replace(default_search, '');
            if (params.charAt(0) === '&') {         // If there is a & the beginning because we stripped, then just take it out.
                params = params.slice(1);
            }


            // We don't care about pagination in an infinte scroll.        
            // Make our page stateful. Only on any changes, not first page load.
            if (!isInit && decodeURI(location_search) !== `?${params}` && !goToSearch) {
                router.navigate({
                    pathname: location.pathname,
                    search: `?${params}`
                });
            }
        }

    }, [sortBy, sortAsc, query, JSON.stringify(categories), JSON.stringify(series), JSON.stringify(topics), JSON.stringify(publishDateRange)])

    // Manually cause a search and redirect to our search page with the proper queries.
    const searchQuery = useCallback(() => {

        // Ignore us if we are in a stateful page.
        if (!goToSearch) {
        }

        // Build the query and just redirect to the search page.
        let q = buildQuery();
        let params = q.join('&');

        // Strip out our default search.

        params = params.replace(default_search, '');
        if (params.charAt(0) === '&') {         // If there is a & the beginning because we stripped, then just take it out.
            params = params.slice(1);
        }


        router.navigate({
            pathname: config.blog_search.url,
            search: `?${params}`
        });


    });

    const buildQuery = useCallback(() => {
        let q = [];

        q.push('sort_direction[pages]=' + (sortAsc === true ? 'asc' : 'desc'));
        q.push('sort_field[pages]=' + sortBy);

        // Categories
        if (categories && categories.length) {
            q.push('filters[pages][category][type]=or');
            categories.forEach(category => {
                q.push(`filters[pages][category][values][]=${category}`);
            });
        }

        // Series. 1
        if (series && series.length) {
            q.push('filters[pages][series][type]=or');
            q.push(`filters[pages][series][values][]=${series}`);
        }

        // Date range.
        if (publishDateRange.from && publishDateRange.to) {
            let from = new Date(publishDateRange.from)
            let to = new Date(publishDateRange.to)

            q.push('filters[pages][publish_date][type]=range');
            q.push(`filters[pages][publish_date][from]=${from.toISOString().split('T')[0]}`);
            q.push(`filters[pages][publish_date][to]=${to.toISOString().split('T')[0]}`);

        }

        // Topics
        if (topics && topics.length) {
            q.push(`filters[pages][blog_topics][values][]=${topics}`);
        }


        // The query
        if (query) {
            q.push(`q=${query}`);
        }

        return q;
    });

    const fetchQueryWithAbort = useCallback((query) => {
        const controller = new AbortController();
        const signal = controller.signal;

        const promise = new Promise(async (resolve) => {

            try {
                const response = await fetch(config.blog_search.endpoint + `&${query}`, { signal });

                const data = await response.json();
                resolve(data);
            }
            catch (error) {
                if (error && error.name === 'AbortError') {
                    return true;
                }
                return false;

            }
        });

        promise.cancel = () => controller.abort();

        return promise;

    });



    const fetchQuery = useCallback(() => {

        // Stop if we already doing something.
        if (loading) {
            return;
        }

        setLoading(true);


        let q = buildQuery();


        q.push('page=' + (currentPage + 1));
        q.push('per_page=' + PER_PAGE);

        // Author page
        if (author) {
            q.push('filters[pages][author_name][type]=and');
            q.push(`filters[pages][author_name][values][]=${author}`);
        }

        // Exclude featured from landing page.
        if (excludes) {
            //q.push('filters[pages][external_id][type]=and');
            excludes.forEach(exclude => {
                q.push(`filters[pages][external_id][values][]=!${exclude}`);
            });
        }

        // if its the same just abort.
        let the_query = q.join('&');
        if (the_query === currentQ) {
            // if we were previously fetching, just cancel us.
            fetched?.cancel();
        }

        let fetching = fetchQueryWithAbort(q.join('&'));
        setFetched(fetching);
        setCurrentQ(the_query);

        fetching.then(json => {
            if (json) {
                let posts = json.records.pages.map((page) => {      // Remap our posts

                    function getAuthors() {
                        let authors = [], author = { id: "", name: "", url: "" };

                        (page.authors_url && page.author_name) ?
                            page.author_name.map(authorName => {
                                JSON.parse(page.authors_url).map(url => {
                                    if (url.name === authorName) {
                                        author = {              //merge the two author fields into one
                                            id: url.name,
                                            name: authorName,
                                            url: url.url || ""
                                        }

                                        authors.push(author);
                                    }
                                })
                            })
                            :
                            authors.push(author);

                        return authors
                    };


                    let author_url = [];
                    try { author_url = page.author_name ? JSON.parse(page.author_name) : '' } catch (e) { author_url = [] }    // Bad data, we assume its a JSON object string.

                    let banner_image = '';
                    try { banner_image = page.banner_image_obj ? JSON.parse(page.banner_image_obj) : { src: "", title: "", alt: "", enlarge: false } } catch (e) { banner_image = { src: "", title: "", alt: "", enlarge: false } } // Bad data, we assume its a JSON object string.
                    if (banner_image.src === "") { banner_image.src = "/img/Blog_Author_hero_1200x380.jpg" }

                    return {
                        title: page.title || '',
                        publish_date: (isNaN(new Date(page.publish_date)) || page.publish_date === null) ? dateForm(8.64e15) : dateForm(page.publish_date),  //test for bad date - either null or garbage number comes in sometimes - default date is: September 5, 275760
                        url: page.url || '',
                        external_id: page.external_id,
                        author_name: page.author_name || [],
                        authors_url: page.authors_url,
                        authors: getAuthors(),
                        series: page.series,
                        series_title: page.series_thumbnail_title,
                        category: (page.category && Array.isArray(page.category)) ? page.category : [],
                        banner_image: banner_image,          // 
                    }

                });

                // if we are at page 0, we should start from blank, else keep appending
                if (currentPage > 0) {
                    posts = [...blogPosts, ...posts];
                }

                
                setBlogPosts(posts);
                setTotalPages(json.info.pages.num_pages);
                setTotalPosts(json.info.pages.total_result_count);
                setLoading(false);
                setLoadingNextPage(false);
                setFetched(null);
            }
        })
            .catch(error => {
                setLoading(false);

                console.log(error);

                // ignore because we are just aborting.
                if (error !== "abort") {
                    setTimeout(() => { throw error; }); 	// Throw it globally.
                }
            });



    }, [currentPage, reset]);


    useEffect(() => {


        // Fetch only on first load or if we aren't the landing page.
        if (!goToSearch) {
            fetchQuery();
        }


    }, [currentPage, reset]);      // Only useEffect when these values change. Stringify arrays


    useEffect(() => {

        // Fetch only if we are landing for infinite page.
        if (goToSearch) {
            fetchQuery();
        }

    }, [currentPage]);

    // If we do a back button.
    useEffect(() => {

        // Stateful
        const search = queryString.parse(location_search, { arrayFormat: 'bracket' });


        // Categories
        let search_categories = []
        if (search["filters[pages][category][values]"] && search["filters[pages][category][values]"].length) {
            search_categories = search["filters[pages][category][values]"].map(category => decodeURI(category).replace(/[^a-z0-9_®©\s]/gi, ''));
        }
        setCategories(search_categories);       // An array of categories.

        // Series
        let search_series = ''
        if (search["filters[pages][series][values]"] && search["filters[pages][series][values]"].length) {
            search_series = search["filters[pages][series][values]"].map(series => decodeURI(series).replace(/[^a-z0-9_®©\s]/gi, ''));
        }
        setSeries(search_series);       // Single series.

        setPublishDateRange({
            to: search["filters[pages][publish_date][to]"] ? search["filters[pages][publish_date][to]"].replace(/[^a-z0-9_\s\.:-]/gi, null) : null,
            from: search["filters[pages][publish_date][from]"] ? search["filters[pages][publish_date][from]"].replace(/[^a-z0-9_\s\.:-]/gi, null) : null,
        });

        setSortBy(search["sort_field[pages]"] ? search["sort_field[pages]"].replace(/[^a-z0-9_®©\s]/gi, '') : 'publish_date');
        setSortAsc(search["sort_direction[pages]"] === 'asc' ? true : false);


        // Topics
        let search_topics = ''
        if (search["filters[pages][blog_topics][values]"] && search["filters[pages][blog_topics][values]"].length) {
            search_topics = search["filters[pages][blog_topics][values]"].map(topic => decodeURI(topic).replace(/[^a-z0-9_®©\s]/gi, ''));
        }
        setTopics(search_topics);

        setQuery(search['q'] || '');


    }, [location, location_search]);

    // The value here are the only things that will be exposed to the BlogResultsContext.
    return (
        <BlogResultsContext.Provider value={{
            loading,
            blogPosts,
            sortBy, setSortBy,
            sortAsc, setSortAsc,
            setQuery,
            currentPage, setCurrentPage,
            totalPages,
            totalPosts,
            categories, setCategories,
            series, setSeries,
            publishDateRange, setPublishDateRange,
            query,
            goToSearch,
            searchQuery,
            topics, setTopics,
            loadingNextPage, setLoadingNextPage,
        }}>
            {children}
        </BlogResultsContext.Provider>
    );
});

