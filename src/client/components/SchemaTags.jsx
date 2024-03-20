/*
* SchemaTags.jsx
*/
// Inserts a JSON-LD object into the html, see https://schema.org/docs/jsonldcontext.json
//
// to use, pass in the desired schema & whether it is a single thing or a list of things in props: 
//      - thing example: <SchemaTags schemaType="Product" schemaList={false} item={item} />
//      - list example: <SchemaTags schemaType="BreadcrumbList" schemaList={true} item={item} />
//      - item prop is the data such as this.props.data or any datablock that contains the needed props such as breadcrumbList, etc
//      - optional props for things: name, description
//      - available single thing schemaTypes (schemaList=false):  Hard-Product, Soft-Product, Person, Blog, BlogPosting, TechArticle, NewsArticle, ContactPage, Corporation
//      - available list Schemas (schemaList=true):  ItemList, BreadcrumbList
//      - see getReport() for example of passing in extra props

import React, { Component } from 'react';
import utils from 'components/utils.jsx'; 

export default class SchemaTags extends Component {
    constructor(props) {
        super(props);

        this.getAddress = this.getAddress.bind(this);
        this.getLocation = this.getLocation.bind(this);
        this.getProduct = this.getHardProduct.bind(this);
        this.getProduct = this.getSoftProduct.bind(this);
        this.getPerson = this.getPerson.bind(this);
        this.getBlogPost = this.getBlogPost.bind(this);
        this.getTechArticle = this.getTechArticle.bind(this);
        this.getNewsArticle = this.getNewsArticle.bind(this);
        this.getReport = this.getReport.bind(this);
        this.getCorporation = this.getCorporation.bind(this);
        this.getItemSchema = this.getItemSchema.bind(this);
        this.getSchema = this.getSchema.bind(this);

    }



getAddress(address) {
    const region = address.province || address.state;
    if(address.address_line1 === null) address.address_line1 = " ";
    if(address.address_line2 === null) address.address_line2 = " ";

return {
        "@type": "PostalAddress",
        "streetAddress" : address.address_line1 +" "+ address.address_line2,
        "addressLocality" : address.address_line3,                              // city or area
        "addressRegion" : region,                                               // state or province
        "addressCountry" : address.country,
        "postalCode" : address.postal_code
    }
}

getLocation(item) {
    
    return {
        "@type": "Place",
        "name": item.name,                     // office title like "china sales office"
        "telephone": item.phone,
        "faxNumber": "",
        "address": this.getAddress(item),
        "hasMap": item.map && item.map.url
    }
}

getCorporation(item) {
    return {
        "@type": "Corporation",
        "name": item.name,
        "location": this.getLocation(item),
        "email": item.email,
    }

}

getHardProduct(item) {
    const image = utils.getNestedItem(['product_tabs', 0, 'product_image'], item) ? utils.getNestedItem(['product_tabs', 0, 'product_image'], item) : {"alt":"","title":"","src":""};

    return {
        "@type": "Product",
        "url": item.url,
        "description": item.body,
        "name": item.title,
        "alternateName": item.product_subhead,
        "image": {
            "@type":"ImageObject",
            "description": image[0].alt,
            "name": image[0].title,
            "contentUrl": image[0].src
        },
        "category": utils.getNestedItem(['breadcrumb_list', 1, 'item', 'name'], item),
        "productID": item.part_number
    }
}

getSoftProduct(item) {
    return {
        "@type": "Product",
        "url": item.url,
        "description": item.meta_description,
        "name": item.title,
        "category": utils.getNestedItem(['breadcrumb_list', 1, 'item', 'name'], item),
        "productID": item.title
    }    
}

getPerson(item) {
    const image = item.image ? item.image : {"alt":"","title":"","src":""};
    

    return {
        "@type": "Person",
        "url": item.url,
        "description": item.meta_description,
        "name": item.first_name + " " + item.last_name,
        "image": {
            "@type":"ImageObject",
            "description": image.alt,
            "name": image.title,
            "contentUrl": image.src
        },
        "givenName": item.first_name,            // first
        "familyName": item.last_name,           // last
        "jobTitle": item.title
    }
}

getBlog() {                                         //whole blog such as "Broadcom Tech Blog" or "AIOps"
    return {
        "@type":"Blog",
        "name": this.props.name,
        "description": this.props.description
    }
}


getBlogPost(item) {                                 //single blog article

    const authors = [] = item.author.map( author =>
        {
            return({
                "@type":"Person",
                "name": author.name,
                "url": author.url
            })
        }
    ),
        image = item.banner_image ? item.banner_image : {"alt":"","title":"","src":""};

    return {
        "@type": "BlogPosting",
        "url": item.article_url,
        "description": item.article_meta_description,
        "name": item.article_title,                     // title
        "image": {
            "@type":"ImageObject",
            "description": image.alt,
            "name": image.title,
            "contentUrl": image.src
        },
        "author": authors,
        "dateCreated": item.article_date,
        "articleSection": item.category_name,            // category = blog's name
        "alternativeHeadline": ""
    }
}

getTechArticle(item) {
    return {
        "@type": "TechArticle",
        "dateCreated": item.publish_date,
        "articleSection": item.doc_type,               // category
        "encodingFormat": item.type,                   // "text/html", "image/png", "text/javascript", "application/pdf", "application/zip" 
        "headline": item.title,
        "description": item.description,
        "author": item.author,
        "url": item.url
    }
}

getNewsArticle(item) {
    let section = item.breadcrumb_list && item.breadcrumb_list.length > 0 ? 
                    item.breadcrumb_list[item.breadcrumb_list.length-1].item.name     //last item in the breadcrumb
                    :
                    "";

    return {
        "@type": "NewsArticle",
        //"dateline": item.DateTime,                 // DATA NOT IN JSON, embedded in body - location of news "dateLine": "San Jose, CA",
        "dateCreated": item.publish_date,
        "articleSection": section,                  //category
        "headline": item.title,
        "articleBody": item.body
    }
}

getBreadcrumbList(item) {
    return {
        "@type": "ListItem",
        "position": item.position,
        "name": item.item.name,
        "item": item.item.url

    }
}

getReport(item) {                                       // this has become too customized to security bulletins - images and url are now custom
    let images =[], id=item.content_id;                 // if you are looking to hook up a report - create a new object 
    
    if (item.thumbnails.length > 0) {
        images = item.thumbnails.map(thumb => {
            if(thumb.alt === null) thumb.alt="";
            if(thumb.title === null) thumb.title="";
            if(thumb.src === null) thumb.src="";

            return {
                "@type":"ImageObject",
                "description": thumb.alt,
                "name": thumb.title,
                "contentUrl": thumb.src
            }
        })
    }
    if (id.includes("_c")) {id=id.substring(0,id.lastIndexOf("_"))}

return {
    "@type": "Report",
    "reportNumber": item.content_id,
    "articleBody": item.body,
    "about": this.props.data.meta_description,
    "datePublished": item.pubDate,
    "headline": item.title,
    "image": images,
    "name": this.props.data.title,
    "url": this.props.data.url+"#"+id
}

}

getItemSchema(item) {                                                                   // Product, Person, BlogPosting, TechArticle, NewsArticle, ContactPage, Corporation
    switch(this.props.schemaType) {
        case 'Hard-Product': return this.getHardProduct(item);
        break;
        case 'Soft-Product': return this.getSoftProduct(item);
        break;
        case 'Person': return this.getPerson(item);
        break;
        case 'Blog' : return this.getBlog();
        break;
        case 'BlogPosting': return this.getBlogPost(item);
        break;
        case 'TechArticle': return this.getTechArticle(item);
        break;
        case 'NewsArticle': return this.getNewsArticle(item);
        break;
        case 'Report': return this.getReport(item);
        break;
        case 'Corporation': return this.getCorporation(item);
        break;
        case 'BreadcrumbList': return this.getBreadcrumbList(item);
        default:
            console.log("Schema type not found");
    }
}

getSchema() {

    let data = this.props.item, type, itemList=[];
    let schema = {                                                                           // starting the object we will return - common to all
        "@context": "https://schema.org/",
    }    

    if(this.props.schemaList) {                                                             // is this a list or single thing?

        itemList = data.map(item => {
                return this.getItemSchema(item)
        })
        const list = {                                                                     // list wrapper
            "@type": this.props.schemaType,
            "url": window.location.href,
            "description": this.props.description && this.props.description,                // optional
            "name": this.props.name && this.props.name,                                     // optional
            "numberOfItems": itemList.length,
            "itemListElement": itemList
        }

        schema = {...schema, ...list};

    } else {
        const thing = this.getItemSchema(this.props.item);                                     // a single blog post, product detail, or excutive profile, etc.
        schema = {...schema, ...thing};
    }

    return schema
}

render() {
const schemaObject = JSON.stringify(this.getSchema());

    return (
        <script type="application/ld+json">
            {schemaObject}
        </script>
    )
}


    
}
