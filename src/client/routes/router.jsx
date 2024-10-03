/**
 *  @file router.jsx
 *  @brief Navigating is causing rerender on param changes. https://github.com/remix-run/react-router/issues/7634#issuecomment-1306650156
 *  https://www.sourcetrail.com/javascript/react-router/use-history-react-router-v6-app/
 *  https://stackoverflow.com/questions/75171362/react-router-dom-usenavigate-re-render-problem
 */
import React, { createContext, useContext, useEffect, useState, Suspense } from 'react';
import { Link, Outlet, createBrowserRouter, useLocation, defer } from "react-router-dom";
import { NavigationProvider } from 'routes/navigation.jsx';
import { deferLoadPageData, PageDataProvider } from 'routes/page.jsx';

// The layout
import Header from 'components/Header.jsx';
import Footer from 'components/Footer.jsx';
import Loading from 'components/Loading.jsx';

// The pages
import ErrorPage from 'pages/error/ErrorPage.jsx';
import PageTemplateRouter from 'pages/PageTemplateRouter.jsx';


// // Direct document download
const Docs = React.lazy(() => import('pages/docs.jsx'));

// // Stand alone video.
const VideoPage = React.lazy(() => import('pages/support/VideoPage.jsx'));

// The scroll to top
import ScrollToLink from "components/ScrollToLink.jsx";

/**
 *  @brief This is so we know to switch pages with out query.
 *  
 *  @return Return_Description
 *  
 *  @details 
 */
const PathnameContext = createContext(null);

const PathnameProvider = ({ children }) => {
    const location = useLocation()
    const [pathname, setPathname] = useState(location.pathname);

    useEffect(() => {
        //if (location.pathname !== pathname) {
        setPathname(location.pathname);
        //}        
    })

    return (
        <PathnameContext.Provider value={pathname}>
            {children}
        </PathnameContext.Provider>
    );

}

export { PathnameProvider };
export const usePathname = () => {
    return useContext(PathnameContext);
}

/**
 *  @brief This is so we know to switch pages with out query.
 *  
 *  @return Return_Description
 *  
 *  @details 
 */
const LocationSearchContext = createContext(null);

const LocationSearchProvider = ({ children }) => {
    const location = useLocation()
    const [search, setSearch] = useState(location.search);

    useEffect(() => {
        if (location.search !== search) {
            setSearch(location.search);
        }
    })

    return (
        <LocationSearchContext.Provider value={search}>
            {children}
        </LocationSearchContext.Provider>
    );

}

export { LocationSearchProvider };
export const useLocationSearch = () => {
    return useContext(LocationSearchContext);
}

/**
 *  @brief Layout.
 *  
 *  @return Return_Description
 *  
 *  @details 
 */
const Layout = () => {
    useEffect(() => {

    });

    return (
        <>
            <NavigationProvider>
                <Header />
                <div id="content-container">
                    <Suspense fallback={<Loading isLoading={true} className="page-loading" />}>
                        {/* SSR: We need to initially stop rendering the page because we are just a 404. Error page resets it to 200 for SPA. */}

                        <PathnameProvider>
                            <LocationSearchProvider>
                                <Outlet />
                            </LocationSearchProvider>
                        </PathnameProvider>
                        <div className="scrollto-top-container container">
                            <div className="scrollto-top-wrapper">
                                <ScrollToLink className="scrollto-top btn" to="top" autoappear>Top <span className="bi brcmicon-arrow-circle-right bi-rotate-270"></span></ScrollToLink>
                            </div>
                        </div>
                        <Footer />
                    </Suspense>
                </div>
            </NavigationProvider>
        </>
    );
}


// Create a custom hook.

/**
 *  @brief The routing
 *  
 *  @return Return_Description
 *  
 *  @details 
 */
const shouldRevalidate = ({ currentUrl, nextUrl }) => {
    return currentUrl.pathname !== nextUrl.pathname;        // Only load when paths are different. ignore query.
}

const router = createBrowserRouter([
    {
        element: <Layout />,
        errorElement: <ErrorPage code="400" />,
        children: [{
            path: "/docs/:document",
            loader: deferLoadPageData,
            shouldRevalidate: shouldRevalidate,
            element: <PageDataProvider><Docs /></PageDataProvider>, // Use our template routing.
            errorElement: <ErrorPage code="400" />,
        }, {
            path: "/html-docs/:document",
            loader: deferLoadPageData,
            shouldRevalidate: shouldRevalidate,
            element: <PageDataProvider><Docs /></PageDataProvider>, // Use our template routing.
            errorElement: <ErrorPage code="400" />,
        }, {
            path: "/video/:mediaid",
            //loader: deferLoadPageData,            // Videos don't require meta and page data as it get's it from brightcove
            //shouldRevalidate: shouldRevalidate,
            element: <VideoPage />, // Use our template routing.
            errorElement: <ErrorPage code="400" />,
        }, {
            path: "/explore/video-library/video/:mediaid",
            //loader: deferLoadPageData,            // Videos don't require meta and page data as it get's it from brightcove
            //shouldRevalidate: shouldRevalidate,
            element: <VideoPage />, // Use our template routing.
            errorElement: <ErrorPage code="400" />,
        }, {
            path: "*",
            loader: deferLoadPageData,
            shouldRevalidate: shouldRevalidate,
            element: <PageDataProvider><PageTemplateRouter /></PageDataProvider>, // Use our template routing.
            errorElement: <ErrorPage code="400" />,
        }

        ]
    },
]);

export { router }



