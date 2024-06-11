/**
 *  @file TemplateFactory.jsx
 *  @brief Brief
 */
import config from 'client/config.js';
import { fetchAPI } from 'components/utils.jsx';
import React, { Suspense, lazy } from 'react';
import Loading from 'components/Loading.jsx';
import classnames from 'classnames';

const LatestNews = React.lazy(() => import('templates/LatestNews.jsx'));
const LatestEvents = React.lazy(() => import('templates/LatestEvents.jsx'));
const LatestProducts = React.lazy(() => import('templates/LatestProducts.jsx'));
const LatestVideos = React.lazy(() => import('templates/LatestVideos.jsx'));
const VideoLibrary = React.lazy(() => import('templates/VideoLibrary.jsx'));
const FeaturedDocuments = React.lazy(() => import('templates/FeaturedDocuments.jsx'));
const FeaturedWhitePapers = React.lazy(() => import('templates/FeaturedWhitePapers.jsx'));
const DocumentLibrary = React.lazy(() => import('templates/DocumentLibrary.jsx'));
const Executives = React.lazy(() => import('templates/Executives.jsx'));
const Sales = React.lazy(() => import('templates/Sales.jsx'));
const MediaContacts = React.lazy(() => import('templates/MediaContacts.jsx'));
const SecurityAdvisoryLandingPage = React.lazy(() => import('templates/SecurityAdvisoryLandingPage.jsx'));
const NewsList = React.lazy(() => import('templates/NewsList.jsx'));
const FormBuilder = React.lazy(() => import('templates/FormBuilder.jsx'));
const ProductEndofLife = React.lazy(() => import('templates/ProductEndofLife.jsx'));
const ListOfLinks = React.lazy(() => import('templates/ListOfLinks.jsx'));
const OEMSupportDocuments = React.lazy(() => import('templates/OEMSupportDocuments.jsx'));
const Default = React.lazy(() => import('templates/Default.jsx'));
const General = React.lazy(() => import('templates/General.jsx'));
const InteractiveDiagram = React.lazy(() => import('templates/InteractiveDiagram.jsx'));
const TradeShows = React.lazy(() => import('templates/TradeShows.jsx'));
const ProductCard = React.lazy(() => import('templates/ProductCard.jsx'));
const InPageNavigation = React.lazy(() => import('templates/InPageNavigation.jsx'));
const CaseStudy = React.lazy(() => import('templates/CaseStudy.jsx'));
const BlogFeed = React.lazy(() => import('templates/BlogFeed.jsx'));
const Testimonial = React.lazy(() => import('templates/Testimonial.jsx'));
const TestimonialHorizontal = React.lazy(() => import('templates/TestimonialHorizontal.jsx'));
const ContentCard = React.lazy(() => import('templates/ContentCard.jsx'));			// Formally, VerticalPromo, HorizontalPromo, TextPromo
const ContentCardTwoColumn = React.lazy(() => import('templates/ContentCardTwoColumn.jsx'));
const ContentList = React.lazy(() => import('templates/ContentList.jsx'));
const ContentListWithIcons = React.lazy(() => import('templates/ContentListWithIcons.jsx'));
const Iframe = React.lazy(() => import('templates/Iframe.jsx'));
const Accordion = React.lazy(() => import('templates/AccordionPromo.jsx'));
const ProductSuitesContentCard = React.lazy(() => import('templates/ProductSuitesContentCard.jsx'));		// BCCS10-6 Landing Product Suites
const CarouselStandard = React.lazy(() => import('templates/CarouselStandard.jsx'));
const CarouselSplit = React.lazy(() => import('templates/CarouselStandard.jsx'));
const CarouselFeatured = React.lazy(() => import('templates/CarouselStandard.jsx'));		// Same as split, but with arrows
const CarouselVideoPlaylist = React.lazy(() => import('templates/CarouselStandard.jsx'));		// Same as split, but with arrows
const Featured = React.lazy(() => import('templates/Featured.jsx'));		// https://www.vmware.com/explore/us.html Continue learning with fixed layout.
const HorizontalTab = React.lazy(() => import('templates/HorizontalTab.jsx'));		// Same as split, but with arrows
const Agenda = React.lazy(() => import('templates/Agenda.jsx'));		// VMware Explore agenda
const VerticalTab = React.lazy(() => import('templates/VerticalTab.jsx'));		//Vertical
const ResourceLibrary = React.lazy(() => import('templates/ResourceLibrary.jsx'));
const RoadmapLibrary = React.lazy(() => import('templates/RoadmapLibrary.jsx'));
const RowOfImages = React.lazy(() => import('templates/RowOfImages.jsx'));
const ProductLibrary = React.lazy(()=> import('templates/ProductLibrary.jsx'));



import(/* webpackPreload: true */ 'scss/components/content-blocks.scss');

// The available templates.
const templates = {
	LatestNews,
	LatestEvents,
	LatestProducts,
	LatestVideos,
	VideoLibrary,
	//Webinars,						//webinars has been sun-setted
	FeaturedDocuments,
	FeaturedWhitePapers,
	DocumentLibrary,
	Executives,
	Sales,
	MediaContacts,
	SecurityAdvisoryLandingPage,
	NewsList,
	FormBuilder,
	ProductEndofLife,
	ListOfLinks,
	OEMSupportDocuments,
	Default,
	General,
	InteractiveDiagram,
	TradeShows,
	ProductCard,
	InPageNavigation,
	CaseStudy,
	BlogFeed,
	Testimonial,
	TestimonialHorizontal,
	ContentCard,
	ContentCardTwoColumn,
	ContentList,
	ContentListWithIcons,
	Iframe,
	Accordion,
	ProductSuitesContentCard,
	CarouselStandard,
	CarouselSplit,
	CarouselFeatured,
	CarouselVideoPlaylist,
	Featured,
	HorizontalTab,
	Agenda,
	VerticalTab,
	ResourceLibrary,
	RoadmapLibrary,
	RowOfImages,
	ProductLibrary,
};


const ErrorTemplate = (props) => (<div>No template for {props.message}</div>);
const FetchErrorTemplate = (props) => (
	<div style={{ 'margin-top': '40px' }} >Sorry — something went wrong on our end. There should be content here, but there may have been a technical error on our site. Please try again later.</div>
);	// HACK: JD - Hardcoded styling for Homepage only. Didn't care for any other pages. Deal with it later.

/**
 *  @brief Dynamically load a contentblock.
 *  
 *  @param [in] WrappedComponent The component
 *  @return Return_Description
 *  
 *  @details Details
 */
const withDynamicContentBlock = (WrappedComponent, api_url) => {
	return class extends React.Component {
		constructor(props) {
			super(props);

			this.state = {
				content_block: null,
				loading: true,
				error: false,
			};

			this.unmount = false;
		}

		componentDidMount() {
			// Try loading now.
			if (api_url && !this.unmount) {

				fetchAPI(`${config.api_url}${api_url}&locale=${config.locale}`, { credentials: config.api_credentials })
					//TEST: 500 fetch(`https://www.broadcom.com/api/products/overlayattributes?id=1234567890&type=AVG_Product_P&locale=avg_en&lastpubdate=2020-07-16-17%3A00%3A29&updateddate=2020-07-01-18%3A27%3A48`, {credentials: config.api_credentials}) 
					.then(resp => resp.json())
					.then(json => {

						if (json && json.error) {
							this.setState({
								loading: false,
								error: true,
							});
						}
						else if (!this.unmount) {
							this.setState({
								loading: false,
								content_block: json,
							});
						}

					})
					.catch(error => {
						this.setState({
							loading: false,
							error: true,
						});
					});

			}
		}

		componentWillUnmount() {
			this.unmount = true;
		}

		render() {
			return (
				<Suspense fallback={<div></div>}> {/* TODO: UI loading */}
					<Loading isLoading={this.state.loading}>
						{this.state.content_block && <WrappedComponent content_block={this.state.content_block} />}
						{this.state.error && <FetchErrorTemplate />}
					</Loading>
				</Suspense>
			);
		}
	}
}

/**
 *  @brief Return a single component from the template name.
 *  
 *  @param [in] template Parameter_Description
 *  @return Return_Description
 *  
 *  @details Details
 */
export function getComponentFromTemplate(template, content_block, ...props) {


	const theTemplate = (template, content_block, ...props) => {

		if (!(template in templates)) {
			return <ErrorTemplate message={template} />;
		}

		const Template = templates[template];

		// We are dynamically loading our template data.
		if (content_block.api_url) {
			const Dynamic = withDynamicContentBlock(Template, content_block.api_url);
			return <Dynamic />;
		}

		return <Template content_block={content_block} {...props} />
	}

	const theWrapper = (template, content_block, ...props) => {
		let classes = ['content-block'];
		
		if (content_block.cta_style) {
			classes.push(`theme-content-block-cta-${content_block.cta_style.toLowerCase()}`);
		}
		

		if (content_block.hash_tag_name) {
			return (
				<div id={content_block.hash_tag_name} data-content-id={content_block.content_id}>
					<div className={classnames(classes)}>
						{theTemplate(template, content_block, ...props)}
					</div>
				</div>
			);
		}
		else {
			return (
				<div className={classnames(classes)} data-content-id={content_block.content_id}>
					{theTemplate(template, content_block, ...props)}
				</div>
			);
		}
	}

	// JD - Experiment with themes
	// if (theme) {
	// 	return (
	// 		<div className={`theme-content-block-${theme}`}>
	// 			{theTemplate(template, content_block, ...props)}
	// 		</div>
	// 	);
	// }
	// else {
	// 	return theWrapper(template, content_block, ...props);
	// }

	return theWrapper(template, content_block, ...props);
}

/**
 *  @brief Get a list of components from content_blocks.
 *  
 *  @param [in] content_blocks Parameter_Description
 *  @return Array of components.
 *  
 *  @details Details
 */
export function getComponentsFromContentBlocks(content_blocks) {
	let components = [];

	// Create all the templates.
	if (content_blocks && Array.isArray(content_blocks)) {
		content_blocks.forEach(content_block => {
			components.push(getComponentFromTemplate(content_block.template, content_block));
		});
	}

	return components;
}