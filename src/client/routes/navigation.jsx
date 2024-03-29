/**
 *  @file navigation.jsx
 *  @brief Hook for navigation data
 */
import config from 'client/config.js';
import utils from 'components/utils.jsx';


import React, { createContext, useContext, useEffect, useState } from 'react';
import { Link, Outlet, createBrowserRouter, useLocation } from "react-router-dom";



const NavigationContext = createContext(null);

const NavigationProvider = ({ children }) => {
    const [navigation, setNavigation] = useState([]);
    const [template, setTemplate] = useState('Broadcom');
    const [login, setLogin] = useState({
        loginUrl: config.okta.loginUrl,
        registrationUrl: config.mybroadcom.registerUrl,
        forgetUrl: config.mybroadcom.forgetUrl,
    });
    const [accessibility, setAccessibility] = useState('');
    const [footer, setFooter] = useState({});
    const [copyright, setCopyright] = useState('');
    const [loaded, setLoaded] = useState(false);

    
    const filterNav = (url, title, template) => {

        if (!title) { title = template };																			// sometimes title is null, set to template name
        if (url) {
            if (url.startsWith("products/") || url.startsWith("https://")) {										// products have to many uppercase exceptions - skip
                return title																						//		- also links to outside sites dont need a fix
            } else {
                return utils.titleCase(title)
            }
        };
        return title;
    }

    const loop = (navItems) => {                                                                                            //loop thru navigation json & unpack
        if (navItems === null || navItems === undefined || navItems === []) { return };
        return (navItems.map(item => ({
            id: (item.content_id) ? item.content_id : false,
            title: filterNav(item.url, item.title, item.template),
            url: (item.url === "#" || !item.url || item.template === "LabelWithNoURL") ? false : item.url, 		// biz rule: noURL template = its a page for content tree nav but there is no page it should be a label
            group: (item.group) ? true : false,																	// creates a title with list
            target: (item.target) ? item.target : false,														// adds target attribute for links
            abstract: (item.abstract) ? item.abstract : false,
            child: [...(item.children ? loop(item.children) : [])]                                  		// children? create a new loop
        })
        ));
    }

    const loadData = () => {
        let allNav = [];
        let options = {
            method: 'GET',
            credentials: config.api_credentials,			// Coookies for cors
            cache: "no-store",								// Never cache on the client side. Data can change at any time.
            //headers: { "Content-Type": "application/json" }
        };

        // BSBP2-126: Added cache busting to navigation JSON.
        fetch(`/pubdate/pubdate.json`, options)
            .then(resp => resp.json())
            .then(getpubdate => {
                if (getpubdate) {		// HACK: For JIRA Q420-13, Just append to lastpubdate.
                    getpubdate.lastnavdate = utils.databaseSwitchCache(getpubdate.lastnavdate);
                }
                // BCCS3-2 pass any query string to naviation. For lower environments, if we want to
                // force an update of navigation data from upper environments, use "flush_nav=true"
                let queries = '';
                // Impact only lower environments dev and qa
                if (config.environment === 'development' || config.environment === 'qa') {
                    queries = window.location.search || '';
                    if (queries.startsWith('?')) {
                        queries = queries.substring(1);
                    }
                    queries = queries ? `&${queries}` : '';
                }

                // VMware specific. Explore as different navigation headers.
                if (config.navigation.site) {
                    let nav_queries = '';
                    let path = window.location.pathname.replace(/^\//g, '');

                    
                    nav_queries += `&url=${encodeURIComponent(path + window.location.search)}`;
                    nav_queries += `&site=${config.navigation.site}`;

                    if (queries) {
                        queries = `&${nav_queries}${queries}`;
                    }
                    else {
                        queries = nav_queries;
                    }
                }

                fetch(`${config.api_url}navigation?locale=${config.locale}&bc_lang=${config.sublocale}&lastnavdate=${getpubdate ? getpubdate.lastnavdate : 0}${queries}`, { credentials: config.api_credentials })    //'http://cmsgwdev2.aws.broadcom.com/api/navigation?locale=en-us'   `${config.api_url}navigation?locale=${config.locale}&lastnavdate=${getpubdate?getpubdate.lastnavdate:0}`		'https://dev-ui.aws.broadcom.com/api/navigation?locale=en-us&lastnavdate=03-16-14:58:07'
                    .then(resp => resp.json())
                    .then(json => {
                        allNav = json.sub_pages;

                        setNavigation(loop(allNav));
                        setFooter({
                            logo: json.footer_logo?.image,
                            links: json.footer_links,
                            socials: json.footer_social_share,
                            navigation: json.footer_navigation,
                        });
                        setCopyright(json.footer_text);
                        setLogin({
                            loginUrl: json.login_url || login.loginUrl,
                            registrationUrl: json.registration_url || login.registrationUrl,
                            forgetUrl: json.forget_url || login.forgetUrl,
                        });
                        setAccessibility(json.accessibility_statement || '');
                        let template = json?.template || 'Broadcom';
                        if (template === "Home") {
                            template = "Broadcom";      // Redefine it.
                        }

                        setTemplate(template);
                        setLoaded(true);

                    })
                    .catch(error => {
                        setTimeout(() => { throw error; }); 	
                        setLoaded(true);														// Throw it globally.
                    });
            });
    }

    useEffect(() => {

        // Load only once.
        if (!loaded && (!navigation || navigation.length <=0)) {
            loadData();         // Load our data.
            
        }

        // Fetch our navigation data.
        // setTimeout(() => {
        //     setNavigation("hello");
        // }, 3000);
    }, [navigation, footer, login, copyright, accessibility, template, loaded])            // Load only once

    return (
        <NavigationContext.Provider value={{
            navigation: navigation,
            login: login,
            footer: footer,
            accessibility: accessibility,
            copyright: copyright,
            template: template,
            loaded: loaded,
        }
        }>
            {children}
        </NavigationContext.Provider>
    );

}

export { NavigationProvider };
export const useBroadcomNavigation = () => {
    return useContext(NavigationContext);
}





