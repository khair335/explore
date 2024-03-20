/**
 *  @file withRouter.jsx
 *  @brief React 16 -> 18 upgrade https://reactrouter.com/en/main/start/faq
 */
import React from 'react';
import {
    useLocation,
    useNavigate,
    useParams,
} from "react-router-dom";

export function withRouter(Component) {
    function ComponentWithRouterProp(props) {
        //let location = useLocation();
        let navigate = useNavigate();
        let params = useParams();
        return (
            <Component
                {...props}
                //router={{ location, navigate, params }}
                //location={location}
                navigate={navigate}
                params={params}
            />
        );
    }

    return ComponentWithRouterProp;
}
