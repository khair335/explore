/**
 *  @file Loading.jsx
 *  @brief Uses the custom brcmIcon pulse logo + css animation
 * 	- default size is 60x60px
 *  - size can be overwritten by adding prop to <Loading iconsSize={iconSize} >
 *  - see base/_loading.scss for styling
 *  - 
 */
 import React, { PureComponent } from 'react';
 import classnames from "classnames";
 import ImageBase from 'components/ImageBase.jsx';
 
 
 // example: Document download. The modal pops up.
 export class LoadingIcon extends PureComponent {
     render() {
         const iconSize = (!this.props.iconSize) ? 60 : this.props.iconSize;		// default value - see base/_loading.scss
 
         return (
             <div className="loading icon brcmicon-brcm_pulse_red" style={{"--box-size": iconSize}}>
                 <div className="loading-wrapper">
                     <span className="icon-bg"></span>
                     <span className="loading-anim"></span>
                     <span className="path1 icon-properties"></span>
                     <span className="path2 icon-properties"></span>
                     
                 </div>
             </div>
         );
     }
 }
 
 export default class Loading extends PureComponent {
     
     render() {
         const iconSize = this.props.iconSize;
 
         return (
             <React.Fragment>
 
             {this.props.isLoading
                 ? <div className={classnames(this.props.className)}>			
                     {this.props.children}
                     <div className="loading-overlay">
                         <LoadingIcon iconSize={iconSize}/>
                     </div>
                 </div>
                 : 	<div className="loaded">
                         {this.props.children}
                     </div>
             }
             
 
             </React.Fragment>
             
         )
     }
 }
 
  
