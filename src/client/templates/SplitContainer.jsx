/**
 *  @file SplitContainer.jsx
 *  @brief SplitContainer for component templates.
 */
import React from 'react';
import SiteLink from 'components/SiteLink.jsx';
import ImageBase from 'components/ImageBase.jsx';
import { withLiveEvents } from 'components/liveEvents.js';

import 'scss/templates/split-container.scss';

// TextCard payload does not exist yet. No styles have been created for these classNames. Still needs drop-shadow styling.
// The attribute names (e.g. card.title, card.description) are assumptions and will need to be confirmed/adjusted
// when actual payload is defined in future.
const TextCard = (card) => {
    return (
        <div className="split-container-card-cell">
            <h4 className="text-card-title">{card.title}</h4>
            <p className="text-card-desc">{card.description}</p>
            {card.card_link &&
                <SiteLink
                    to={card.card_link?.url}
                    target={card.card_link?.target}
                    type={card.card_link?.subtype}
                    className="text-card-link"
                >
                    {card.card_link?.title}
                </SiteLink>
            }
        </div>
    )
}

const LogoCard = (card) => {
    let logo = (card.logo?.src) ? <ImageBase image={card.logo} className="card-logo" /> : <i className="fa-solid fa-image fa-2xl" />
    if (card.card_link != null) {
        return (
            <SiteLink
                to={card.card_link?.url}
                target={card.card_link?.target}
                type={card.card_link?.subtype}
                className="logo-card-link"
            >
                <div className="split-container-card-cell">{logo}</div>
            </SiteLink>
        )
    } else {
        return <div className="split-container-card-cell">{logo}</div>
    }

}

const CallToActionBtn = (cta, idx) => {
    // Only first link is considered primary. The rest are all secondary.
    const class_name = (cta.idx === 0) ? "bttn primary-bttn" : "bttn secondary-bttn";
    return (
        <SiteLink
            to={cta.url}
            target={cta.target}
            type={cta.subtype}
            className={class_name}
        >
            <span>{cta.title}</span>
        </SiteLink>
    )
}


const SplitContainer = (props) => {

    let cards = [];
    let cardsArr = props.content_block?.cards || [];
    const numColumns = cardsArr.length;
    const maxRows = cardsArr.reduce((accumulator, column) => Math.max(accumulator, column.length), 0);
    const cardsPosition = props.content_block?.cards_position || "right";


    // Card data comes in 2 dimensional array. It is an array of columns.
    // To enable reactive stacking in the order of left to right to down we must
    // convert to a single array of cards.
    for (let row = 0; row < maxRows; row++) {
        for (let col = 0; col < numColumns; col++) {
            if (row < cardsArr[col].length) {
                cards.push(cardsArr[col][row]);
            }
        }
    }

    return (
        <div className={cardsPosition == "right" ? "SplitContainer" : "SplitContainer split-reverse"}>
            <div className="split-container-summary">
                <h4 className="split-container-title">{props.content_block?.title}</h4>
                <p className="split-container-desc" dangerouslySetInnerHTML={{ __html: props.content_block?.description }} ></p>
                <div className="split-container-cta">
                    {props.content_block.links?.map((cta, index) => {
                        return <CallToActionBtn key={cta.content_id} {...cta} idx={index} />
                    })}
                </div>
            </div>
            <div className="split-container-cards">
                {cards.map((card, index) => {
                    return (card.type && card.type == "text") ? <TextCard {...card} key={index} /> : <LogoCard {...card} key={index} /> // default to LogoCard
                })}
            </div>
        </div>
    );
}

export default withLiveEvents(SplitContainer);