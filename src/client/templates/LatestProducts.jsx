/**
 *  @file LatestProducts.jsx
 *  @brief This does not follow our normal template because the the data is embeded in the home page.
 */
import React, { PureComponent } from 'react';
import SiteLink from 'components/SiteLink.jsx';
import ShowMore from 'components/More.jsx';
import {withLiveEvents} from 'components/liveEvents.js';
import ImageBase from 'components/ImageBase.jsx';


class LatestProducts extends PureComponent {
	constructor(props) {
		super(props);
		this.moreProducts = this.moreProducts.bind(this);
		
		this.state = {
			more_text: 'Show More Products',
			more_toggle: false,
		};
	}
	
	moreProducts(event) {
		event.stopPropagation();
		event.nativeEvent.stopImmediatePropagation();
		
		let toggle = !this.state.more_toggle;
		let more_text = 'Show More Products';
		if (toggle) {
			more_text = 'Show Fewer Products';
		}
		
		this.setState({
			more_text: more_text,
			more_toggle: toggle
		});
		
	}
	
	render() {
		return (
			<div className="grey-container clearfix">
				<span className="itemIcon bi brcmicon-techpages"></span>
				<div className="featuredProducts">
					<h2>{this.props.data.title}</h2>

						<ShowMore style="wipeUp" 
								limit={3} 
								moreLabel={this.props.moreLabel || "Show More Products"} 
								lessLabel={this.props.lessLabel || "Back"}
								noLessLink="/products"
								items = {this.props.data.products.map((product, index) => {
										return (
											<li key={index} className="item">
												<div className="row">
													<div className="col-3">
														<SiteLink to={product.link}>
															<ImageBase image={product.image} className="img-fluid" resizewidth={240}/>
														</SiteLink>
													</div>
													<div className="col-9">
														<h5><SiteLink to={product.link}>{product.title}</SiteLink></h5>
														<span>{product.description}</span>
													</div>
												</div>			
											</li>
										)
									})
								}
						/> 
				</div>
			</div>
		);
	}
}

export default withLiveEvents(LatestProducts);
