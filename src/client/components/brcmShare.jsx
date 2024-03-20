// brcmShare
// returns a social share menu
// 3 types of views/menus available
// "blog" = featured menu + breadcrumb version dropdown
// "featured" = just the featured items menu - not used so not built yet but hook is there (see update() case:featured)
// "breadcrumb" = just the breadcrumb dropdown (all the sites, button is a +)
// pass in these props: 
/*
        view: (required)
        featured: (optional) if using featured view -  this is the number of items if diff from default
*/
// social sites data @ the bottom

import React, { Component } from 'react';
import SiteLink from 'components/SiteLink.jsx';
import { UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Nav, NavItem } from 'reactstrap';
import ButtonTrack from 'components/ButtonTrack.jsx';
import utils from 'components/utils.jsx';
import {localizeText} from 'components/utils.jsx'; 

import 'scss/components/brcm-share.scss';

const ShareData = {
    via: "@Broadcom",	                                                        // identifies social site account
    featured: 0,
    url: "",
    title: "",
    image: "",
    desc: ""
}

export default class BrcmShare extends Component {
    constructor(props) {
        super(props);

        this.state = Object.create(ShareData);
        // BUSINESS RULE: JBurns, only LinkedIn, Facebook, and Twitter.
        this.state.featured = this.props.featured ? this.props.featured : 2;                    // if view = featured, how many or default

        this.get_metaData = this.get_metaData.bind(this);
    }

   
    componentDidMount() {
        this.get_metaData();
    }

    get_metaData() {

        const metas = document.getElementsByTagName('meta');
        var type;

        for (let i = 0; i < metas.length; i++) {
            type = metas[i].getAttribute('property');
            switch (type) {
                case 'og:url':
                    this.setState({ url: window.location.href });
                    break;
                case 'og:title':
                    this.setState({ title: metas[i].getAttribute('content') });
                    break;
                case 'og:image':
                    this.setState({ image: metas[i].getAttribute('content') });
                    break;
                case 'og:description':
                    this.setState({ desc: metas[i].getAttribute('content') });
                    break;

            }
        }
        this.setState({ via: "Broadcom" });   //TODO: this is a hack fix - not sure why state.via is being reset in this function but this puts it back
    }


    update() {
        const socialShareUrls = get_shareLinks({											// build the social site links and return all
            url: this.state.url,
            title: this.state.title,
            image: this.state.image,
            desc: this.state.desc,
            via: this.state.via
        });
        var menuMarkup;

        switch (this.props.view) {															    // which view? 

            case 'blog':
                return (
                    <Nav className="social-share" onClick={this.get_metaData}>
                        {this.buildMenu(socialShareUrls, "featured")}                            {/*this builds a bunch of lis' w/keys*/}
                        <NavItem>
                            <UncontrolledButtonDropdown className="pl-1 other-share" aria-label="More ways to share">
                                <DropdownToggle className='icon-bttn'>
                                    <span className="sr-only">{localizeText("C038","More")} </span>
                                    <span className="bi secondary-bttn brcmicon-plus"></span>
                                </DropdownToggle>
                                <DropdownMenu className="dropdown-menu" aria-label="More Share Pages">
                                    {this.buildMenu(socialShareUrls, "all")}							{/* link list & icons for dropdown/popup menu*/}
                                </DropdownMenu>
                            </UncontrolledButtonDropdown>
                        </NavItem>
                    </Nav>
                );
                break;

            case 'breadcrumb':
                    return (
                        <UncontrolledButtonDropdown className="pl-1 other-share" >
                            <DropdownToggle onClick={this.get_metaData}  className='icon-bttn'>
                                {localizeText("C039","Share Page")}
                                <span className="bi brcmicon-plus-circle"></span>                        
                            </DropdownToggle>
                            <DropdownMenu className="dropdown-menu" aria-label="Share Page" >	                
                                {this.buildMenu(socialShareUrls,"all")}							{/* link list & icons for dropdown/popup menu*/}
                            </DropdownMenu>             
                        </UncontrolledButtonDropdown>	
                    )


                break;

            case 'featured':
                console.log("Share menu type not defined");										// error - no layout yet - not used at this time								// featured only - use data-featured to change how many
                break;

            default:
                console.log("Share menu type not defined");										// error - default to breadcrumb
                return (
                    <UncontrolledButtonDropdown className="pl-1" onClick={this.get_metaData}>
                        <DropdownToggle>
                            {localizeText("C039","Share Page")}
                            <span className="bi brcmicon-plus-circle"></span>
                        </DropdownToggle>
                        <DropdownMenu className="dropdown-menu" aria-label="Share Page">
                            {this.buildMenu(socialShareUrls, "all")}							{/* link list & icons for dropdown/popup menu*/}
                        </DropdownMenu>
                    </UncontrolledButtonDropdown>
                )
        }
        return menuMarkup;
    }


    buildMenu(siteLinks, menuType) {
        const socialSites = get_socialSitesByCustomOrder();							                // preferred order of sites - to change order make a new get_socialSitesBy...
        const siteNames = get_niceNames();												            // names for anchor text
        var menu = [], items = socialSites.length;													    // array for result, number of menu items - breadcrumb/all is default

        if (menuType == "featured") items = this.state.featured;                                     // else this is a featured menu - how many

        for (let i = 0; i < items; i++) {													        // iterate through sites
            const socialSite = socialSites[i];												        // site name					
            var siteClass = socialSite.replace(/\./g, '');									        // remove any '.' (messes up css class names)
            var element;																	        // holds html template component

            switch (menuType) {															        // which html? - to add a new menu type, add a case here
                case 'all':
                    siteClass = "bs_sprite bs_" + siteClass;
                    element = <DropdownItem key={i} tag="div">
                        <span className={siteClass}></span>
                        <ButtonTrack 
                            onClick={() => {window.open(siteLinks[socialSite],'_blank')}}
                            className={"icon-bttn"}
                            gtmevent={{"id":"I002","social_network":siteNames[socialSite],"link_url":window.location.href}}
                        >
                            {siteNames[socialSite]}
                        </ButtonTrack>
                    </DropdownItem>
                    break;

                case 'featured':
                    if (siteClass == 'email') { siteClass = 'envelope' };						    // font awesome class name swap
                        siteClass = "bi brcmicon-" + siteClass;

                    element = <NavItem key={i}>
                        <ButtonTrack 
                            onClick={() => {window.open(siteLinks[socialSite],'_blank')}}
                            className={"icon-bttn"}
                            gtmevent={{"id":"I002","social_network":siteNames[socialSite],"link_url":window.location.href}}
                            target="_blank"
                        >
                        <span className={siteClass} aria-hidden="true"></span>
                        <span className="sr-only">{siteNames[socialSite]}</span>
                        </ButtonTrack> 
                    </NavItem>
                    break;

                default:																	    // error catch (all)
                    element = <DropdownItem key={i}>
                        <span className={siteClass}></span>
                        <ButtonTrack 
                            onClick={() => {window.open(siteLinks[socialSite],'_blank')}}
                            gtmevent={{"id":"I002","social_network":siteNames[socialSite],"link_url":window.location.href}}
                        >
                            {siteNames[socialSite]}
                        </ButtonTrack>
                    </DropdownItem>
            }
            menu.push(element);																    // add to list 				
        }
        return menu.map((el, i) => el);						    // return list / +200 on key to differeniate from other index keys on page            
    }


    render() {


        return (
            <div className='brcmShare'>
                {this.update()}
            </div>
        );

    }

}

function get_shareLinks(args) {								// build links and return all as object
    const validargs = [																	// valid props for social links
        'url',																			// each site has diff requirements
        'title',
        'image',
        'desc',
        'appid',
        'redirecturl',
        'via',
        'hashtags',
        'provider',
        'language',
        'userid',
        'category',
        'phonenumber',
        'emailaddress',
        'cemailaddress',
        'bccemailaddress',
    ];

    for (var i = 0; i < validargs.length; i++) {											// clear out unused props
        const validarg = validargs[i];
        if (!args[validarg]) {
            args[validarg] = '';
        }
    }

    const url = encodeURIComponent(args.url);												// encode values - required by sites
    const title = encodeURIComponent(args.title);
    const image = encodeURIComponent(args.image);
    const desc = encodeURIComponent(args.desc);
    const app_id = encodeURIComponent(args.appid);
    const redirect_url = encodeURIComponent(args.redirecturl);
    const via = encodeURIComponent(args.via);
    const hash_tags = encodeURIComponent(args.hashtags);
    const provider = encodeURIComponent(args.provider);
    const language = encodeURIComponent(args.language);
    const user_id = encodeURIComponent(args.userid);
    const category = encodeURIComponent(args.category);
    const phone_number = encodeURIComponent(args.phonenumber);
    const email_address = encodeURIComponent(args.emailaddress);
    const cc_email_address = encodeURIComponent(args.ccemailaddress);
    const bcc_email_address = encodeURIComponent(args.bccemailaddress);
    var text = title;																		// some sites want title & desc together

    if (desc) {
        text += '%20%3A%20';																//  this is :
        text += desc;																		// so, title:desc
    }

    return {
                'add.this': 'http://www.addthis.com/bookmark.php?url=' + url,
                'blogger': 'https://www.blogger.com/blog-this.g?u=' + url + '&n=' + title + '&t=' + desc,
                'facebook': 'http://www.facebook.com/sharer.php?u=' + url,
                'email': 'mailto:' + email_address + '?subject=' + title + '&body=' + desc,
                'gmail': 'https://mail.google.com/mail/?view=cm&to=' + email_address + '&su=' + title + '&body=' + url + '&bcc=' + bcc_email_address + '&cc=' + cc_email_address,
                'google.bookmarks': 'https://www.google.com/bookmarks/mark?op=edit&bkmk=' + url + '&title=' + title + '&annotation=' + text + '&labels=' + hash_tags + '',
                'linkedin': 'https://www.linkedin.com/shareArticle?mini=true&url=' + url + '&title=' + title + '&summary=' + text + '&source=' + provider,
                'pinterest': 'http://pinterest.com/pin/create/button/?url=' + url + '&media=' + image,
                'reddit': 'https://reddit.com/submit?url=' + url + '&title=' + title,
                'skype': 'https://web.skype.com/share?url=' + url + '&text=' + text,
                'sms': 'sms:' + phone_number + '?body=' + text,
                'stumbleupon': 'http://www.stumbleupon.com/submit?url=' + url + '&title=' + text,
                'telegram.me': 'https://t.me/share/url?url=' + url + '&text=' + text + '&to=' + phone_number,
                'twitter': 'https://twitter.com/intent/tweet?url=' + url + '&text=' + text + '&via=' + via + '&hashtags=' + hash_tags,
                'weibo': 'http://service.weibo.com/share/share.php?url=' + url + '&appkey=&title=' + title + '&pic=&ralateUid=',
                'yahoo': 'http://compose.mail.yahoo.com/?to=' + email_address + '&subject=' + title + '&body=' + text,
    };
}

function get_niceNames() {
    return {
        'add.this': 'AddThis',
        'blogger': 'Blogger',
        'facebook': 'Facebook',
        'email': 'Email',
        'google.bookmarks': 'Google Bookmarks',
        'linkedin': 'LinkedIn',
        'gmail': 'Gmail',
        'pinterest': 'Pinterest',
        'reddit': 'Reddit',
        'skype': 'Skype',
        'sms': 'SMS',
        'stumbleupon': 'StumbleUpon',
        'telegram.me': 'Telegram.me',
        'twitter': 'Twitter',
        'weibo': 'Weibo',
        'yahoo': 'Yahoo',
    };
}

function get_socialSitesByCustomOrder() {						// the order to display links - in this case by popularity on brcm site
    return [
        'linkedin',
        'twitter',
        'facebook',
        'gmail',
        'yahoo',
        'email',
        'google.bookmarks',
        'add.this',
        'pinterest',
        'blogger',
        'reddit',
        'sms',
        'skype',
        'stumbleupon',
        'telegram.me',
        'weibo',
    ];
}
