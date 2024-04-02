/**
 *  @file PageTemplateRouter.jsx
 *  @brief Routing based on template in JSON file.
 */
import config from 'client/config.js';
import React, { Fragment, Component, useState, useEffect, memo } from 'react';
import ErrorPage from 'pages/error/ErrorPage.jsx';
import { useLoadPageData } from 'routes/page.jsx';
import { useLoaderData, Await } from 'react-router-dom';



const home = React.lazy(() => import('pages/home.jsx'));
// // Generic
const SingleColTabbed = React.lazy(() => import('pages/SingleColTabbed.jsx'));
const SingleColStacked = React.lazy(() => import('pages/SingleColStacked.jsx'));
const SingleColStripe = React.lazy(() => import('pages/SingleColStripe.jsx'));
const Tabbed = React.lazy(() => import('pages/Tabbed.jsx'));
const Stacked = React.lazy(() => import('pages/Stacked.jsx'));
const GeneralPage2Column = React.lazy(() => import('pages/GeneralPage2Column.jsx'));
const GeneralPage = React.lazy(() => import('pages/GeneralPage.jsx'));
// // Products
const ProductGroup = React.lazy(() => import('pages/products/ProductGroup.jsx'));
const ProductLanding = React.lazy(() => import('pages/products/ProductLanding.jsx'));		// Formally ProductLandingMulti
const ProductFamilyA = React.lazy(() => import('pages/products/ProductFamilyA.jsx'));
const ProductFamilyC = React.lazy(() => import('pages/products/ProductFamilyC.jsx'));
const ParametricSearch = React.lazy(() => import('pages/products/ParametricSearch.jsx'));
const ProductDetail = React.lazy(() => import('pages/products/ProductDetail.jsx'));
// const Standalonecategory = React.lazy(() => import('pages/products/Standalonecategory.jsx'));
// const ProductLandingMulti = React.lazy(() => import('pages/products/ProductLandingMulti.jsx'));
const MainframeProducts = React.lazy(() => import('pages/products/MainframeProducts.jsx'));
// // These are essentially the same template
const SWProductGroup = React.lazy(() => import('pages/products/SoftwareProductLayout.jsx'));
const SWProductFamily = React.lazy(() => import('pages/products/SoftwareProductLayout.jsx'));
const SWProduct = React.lazy(() => import('pages/products/SoftwareProductLayout.jsx'));
const SWPartnerPage = React.lazy(() => import('pages/products/SoftwareProductLayout.jsx'));
const SuitesLandingPage = React.lazy(() => import('pages/products/SuitesLandingPage.jsx'));


// // Application
// const ApplicationLanding = React.lazy(() => import('pages/applications/ApplicationLanding.jsx'));
// // Root
const SiteMap = React.lazy(() => import('pages/SiteMap.jsx'));
// const SiteMapProducts = React.lazy(() => import('pages/SiteMapProducts.jsx'));			//obsolete
// const CASiteMapProducts = React.lazy(() => import('pages/SitemapProducts_CA.jsx'));		//obsolete
const CAProductAZ = React.lazy(() => import('pages/SitemapProducts_CA_a2z.jsx'));
const ProductsAtoZ = React.lazy(() => import('pages/SitemapProducts_CA_a2z.jsx'));
const CampaignLanding = React.lazy(() => import('pages/CampaignLanding.jsx'));
// // Support
const SecurityAdvDetail = React.lazy(() => import('pages/support/SecurityAdvDetail.jsx'));
const ContactFormSelect = React.lazy(() => import('pages/support/ContactFormSelect.jsx'));
const DocAlerts = React.lazy(() => import('pages/support/DocAlerts.jsx'));
const DocumentDownloads = React.lazy(() => import('pages/support/DocumentDownloads.jsx'));
const OEMSupportDetail = React.lazy(() => import('pages/support/OEMSupportDetail.jsx'));
const SubProcessorList = React.lazy(() => import('pages/support/SubProcessorList.jsx'));
// const SupportLanding = React.lazy(() => import('pages/support/SupportLanding.jsx'));
// const opensource = React.lazy(() => import('pages/support/opensource.jsx'));
const OEMSupport = React.lazy(() => import('pages/support/OEMSupport.jsx'));
const KBFAQ = React.lazy(() => import('pages/support/KBFAQ.jsx'));
const KBIssue = React.lazy(() => import('pages/support/KBFAQ.jsx'));	// The same as FAQ
const KBSolution = React.lazy(() => import('pages/support/KBFAQ.jsx'));	// The same as FAQ
const KBHowTo = React.lazy(() => import('pages/support/KBFAQ.jsx'));	// The same as FAQ
// const SoftwareSupportLanding = React.lazy(() => import('pages/support/SupportLanding.jsx'));		// The same as solutions.

// // Company
const History = React.lazy(() => import('pages/company/about-us/History.jsx'));
// Solution
const Solution = React.lazy(() => import('pages/solutions/Solution.jsx'));
const SolutionInteractive = React.lazy(() => import('pages/solutions/Solution.jsx'));

// const ApplicationCategoryOverview = React.lazy(() => import('pages/applications/ApplicationCategoryOverview.jsx'));
const NewsRoom = React.lazy(() => import('pages/company/NewsRoom.jsx'));
const PressReleaseDetail = React.lazy(() => import('pages/company/PressReleaseDetail.jsx'));
const OEMPartnerPage = React.lazy(() => import('pages/company/OEMPartnerPage.jsx'));
// const OEMPartnersLanding = React.lazy(() => import('pages/company/OEMPartnersLanding.jsx'));
const ContactForm = React.lazy(() => import('pages/support/ContactForm.jsx'));
// const PartnerListing = React.lazy(() => import('pages/company/PartnerListing.jsx'));
const PartnerDistLookup = React.lazy(() => import('pages/company/PartnerDistLookup.jsx'));
const ExecutiveDetail = React.lazy(() => import('pages/company/about-us/ExecutiveDetail.jsx'));

// // Blog
const BlogLanding_v2 = React.lazy(() => import('pages/blog/BlogLanding_v2.jsx'));
const BlogSearch_v2 = React.lazy(() => import('pages/blog/BlogSearch_v2.jsx'));
const BlogAuthor_v2 = React.lazy(() => import('pages/blog/BlogAuthor_v2.jsx'));
const BlogDetail_V2 = React.lazy(() => import('pages/blog/BlogDetail_v2.jsx'));
// // Case Study
const CaseStudy = React.lazy(() => import('pages/casestudies/CaseStudy.jsx'));
const CaseStudyLanding = React.lazy(() => import('pages/casestudies/CaseStudyLanding.jsx'));
// // Analyst Reports
const AnalystReport = React.lazy(() => import('pages/casestudies/AnalystReport.jsx'));
const AnalystReportLanding = React.lazy(() => import('pages/casestudies/AnalystReportLanding.jsx'));
// // Solutions
// const SolutionsDetail = React.lazy(() => import('pages/solutions/SolutionsLayout.jsx'));
const SolutionsLanding = React.lazy(() => import('pages/solutions/SolutionsLanding.jsx'));
const SolutionsCategory = React.lazy(() => import('pages/solutions/SolutionsLayout.jsx'));
// // Error pages
const CAPageNotFound = React.lazy(() => import('pages/error/CAPageNotFound.jsx'));
// // Standalone Image
const StandaloneImage = React.lazy(() => import('pages/StandaloneImage.jsx'));
const StandaloneVideo = React.lazy(() => import('pages/StandaloneVideo.jsx'));
// // Symantec
const LegalDocumentDownloads = React.lazy(() => import('pages/support/LegalDocumentDownloads.jsx'));
const TransparencyNoticeDocs = React.lazy(() => import('pages/TransparencyNoticeDocs.jsx'));
const SecurityUpdates = React.lazy(() => import('pages/support/SecurityUpdates.jsx'));
const AttackSignatures = React.lazy(() => import('pages/support/AttackSignatures.jsx'));
const AttackSignaturesDetail = React.lazy(() => import('pages/support/AttackSignaturesDetail.jsx'));
// //const MonthlyThreatReport = React.lazy(() => import('pages/support/MonthlyThreatReport.jsx'));		// DEPRECATED: CT - Initially they said this was important, then when we asked them to review, they said they had some resignations and reorgs and this report was eliminated.  
const SecurityDownloadDetail = React.lazy(() => import('pages/support/SecurityDownloadDetail.jsx'));
const CertifiedDefinitionsList = React.lazy(() => import('pages/support/CertifiedDefinitionsList.jsx'));
const RapidDefinitionsList = React.lazy(() => import('pages/support/RapidDefinitionsList.jsx'));
// const ArchivedThreatReport = React.lazy(() => import('pages/support/ArchivedThreatReport.jsx'));
const SecurityUpdatesList = React.lazy(() => import('pages/support/SecurityUpdatesList.jsx'));
const ThreatListAtoZ = React.lazy(() => import('pages/support/ThreatListAtoZ.jsx'));
const SecurityUpdatesDetail = React.lazy(() => import('pages/support/SecurityUpdatesDetail.jsx'));
const ProtectionBulletinListing = React.lazy(() => import('pages/support/ProtectionBulletinListing.jsx'));
const ProtectionBulletinDetail = React.lazy(() => import('pages/support/ProtectionBulletinDetail.jsx'));

// LogoRequest
const LogoRequest = React.lazy(() => import('pages/support/LogoRequest.jsx'));
const LogoRequestTermsAndConditions = React.lazy(() => import('pages/support/LogoRequestTermsAndConditions.jsx'));
const LogoRequestDeclined = React.lazy(() => import('pages/support/LogoRequestDeclined.jsx'));
const LogoRequestDownload = React.lazy(() => import('pages/support/LogoRequestDownload.jsx'));

// Explore
const ExploreSearchVideos = React.lazy(() => import('pages/search/ExploreSearchVideos.jsx'));


const templates = {
	home,					// Template name is lower case in JSON.
	SingleColTabbed,
	SingleColStacked,
	SingleColStripe,
	Tabbed,
	Stacked,
	SiteMap,
	// SiteMapProducts,
	// CASiteMapProducts,
	CAProductAZ,
	ProductsAtoZ,
	ProductGroup,
	ProductLanding,
	ProductFamilyA,
	ProductFamilyC,
	// ProductLandingMulti,
	MainframeProducts,
	SWProductGroup,
	SWProductFamily,
	SWProduct,
	SWPartnerPage,
	SuitesLandingPage,
	// ApplicationLanding,
	ParametricSearch,
	ProductDetail,
	SecurityAdvDetail,
	History,
	Solution,
	SolutionInteractive,
	// ApplicationCategoryOverview,
	NewsRoom,
	PressReleaseDetail,
	ContactFormSelect,
	//Blog,
	BlogLanding_v2,
	BlogSearch_v2,
	BlogAuthor_v2,
	BlogDetail_V2,
	// Standalonecategory,
	DocumentDownloads,
	OEMPartnerPage,
	// OEMPartnersLanding,
	OEMSupportDetail,
	SubProcessorList,
	DocAlerts,
	CampaignLanding,
	// SupportLanding,
	// opensource,
	OEMSupport,
	KBFAQ,
	GeneralPage2Column,
	GeneralPage,
	KBIssue,
	KBHowTo,
	// SoftwareSupportLanding,
	KBSolution,
	ContactForm,
	// PartnerListing,
	PartnerDistLookup,
	ExecutiveDetail,
	CaseStudy,
	CaseStudyLanding,
	// CaseStudy,
	AnalystReportLanding,			// Essentially the same as CaseStudyLanding
	AnalystReport,
	// SolutionsDetail,
	SolutionsLanding,
	SolutionsCategory,
	CAPageNotFound,
	StandaloneVideo,
	StandaloneImage,
	LegalDocumentDownloads,
	TransparencyNoticeDocs,
	SecurityUpdates,
	AttackSignatures,
	AttackSignaturesDetail,
	// //MonthlyThreatReport,
	SecurityDownloadDetail,
	CertifiedDefinitionsList,
	RapidDefinitionsList,
	// ArchivedThreatReport,
	SecurityUpdatesList,
	ThreatListAtoZ,
	SecurityUpdatesDetail,
	ProtectionBulletinListing,
	ProtectionBulletinDetail,
	LogoRequest,
	LogoRequestTermsAndConditions,
	LogoRequestDeclined,
	LogoRequestDownload,
	ExploreSearchVideos,
};



const PageTemplateRouter = (props) => {
	const data = useLoadPageData();
	//const data = useLoaderData();

	useEffect(() => {

		// if (this.props.data && this.props.data.template) {
		// 	this.state = { template: this.props.data.template };
		// }
		// else {
		// 	this.state = { error: `Can not find template name.` };
		// }

		// if (config.environment === 'local') {
		// 	console.log('template: ', this.props.data.template);
		// }
	});

	
	return (
		<Await resolve={data.page}>
			{(page) => {
				if (page.status === 302) {
					return null;			// We are a redirect.
				}

				if (config.environment === 'local') {
					console.log('template: ', page.data.template);
				}

				// HACK: There's a flicker because we our routing after we click a swiftype link from search results pages.
				// So just ignore us for now.
				let swiftype_paths = ['/support/knowledgebase', '/site-search', '/broadcom-faceted-search'];
				if (swiftype_paths.includes(page.location.pathname)) {
					return null;
				}

				// We don't have a template. Maybe 404 us.
				if (!(page.data.template in templates)) {
					let message = page.template + " template not found.";
					return <ErrorPage code="404" message={message} />;
				}

				const PageTemplate = templates[page.data.template];
				const { staticContext, onDidUpdate, ...rest } = props;		// Remove our staticContect.

				
				return (
					<div className="loaded" id="content" data-content-id={page.data.content_id}>
						<PageTemplate {...page} key={page.data.content_id}/>
					</div>
				)
			}}
		</Await>
	)
}

export default PageTemplateRouter;
