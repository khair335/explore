/**
 *  @file Captcha.jsx
 *  @brief Adds captcha to input forms
 *  version 1.0

         returns captcha as html element
            returns pass / fail - true / false
	uses a verifyemail honeypot, a trick question honeypot, and mixed pics and text
	accepts all answers (except possible human + wrong math) to fool bot into going away - flags false/fails in email subject line
	allows for future tests such as form fill-in timing, mouse path + timing, neuro-net analysis, etc - add these to tally in submitTest()
	should we test # of tries from same ip? - cookie? - ie if bot refreshes page repeatedly - this is a current security hole
 */

import config from 'client/config.js';
import React, { PureComponent } from 'react';
import {  Row, Col } from 'reactstrap';
import ImageBase from 'components/ImageBase.jsx';
import {localizeText} from 'components/utils.jsx'; 

import 'scss/components/captcha.scss';


export default class Captcha extends PureComponent {
	constructor(props) {
		super(props);
		
		this.state = {
			p1: 0,											// first number
			p2: 0,											// second number
			pic_a: "/img/captcha/bCap_pic30.png",			// file path to operator art
			pic_b: "/img/captcha/bCap_pic42.png",			// file path to equals art
			count: 0,										// how many attempts to solve
			a: undefined,									// correct challenge answer - shortened to "a" since these are visible in browser inspector
			q1_item: "rabbit",								// fake data for fake question
			message: "",									// error or info messages
			subAlert: "**Possible-Spam-Bot**",				// message that appears in email subject line if bot is suspected
			operator: ""										// Accessibility, we need the operator.
		};													//   - DO NOT CHANGE WITHOUT COORDINATING WITH BACK-END AND BUSINESS UNITS

		this.submitChallenge = this.submitChallenge.bind(this);
		this.newChallenge = this.newChallenge.bind(this);
		this.showMessage = this.showMessage.bind(this);
		this.handleInput = this.handleInput.bind(this);

		this.inputChallenge = React.createRef();
		this.verfiyEmail = React.createRef();

	}

	getNewQ1() {							// fake data for honeypot2 question
		const q1_items = [
			localizeText("C044","mouse"), 	//      - "Which image contains a ____ (a or b)?"
			localizeText("C045","cat"),
			localizeText("C046","dog"),
			localizeText("C047","fish"),
			localizeText("C048","pickle"),
			localizeText("C049","star")
			];

		return q1_items[this.getNumber(0, q1_items.length)]		// random pick one
	}

	setFilepath(type) {
		const filePath = [ 					// file paths for math symbol artwork: did not use a sprite for this on purpose
			"/img/captcha/bCap_pic12.png",						// 0 = add
			"/img/captcha/bCap_pic23.png",						// 1 = subtract
			"/img/captcha/bCap_pic30.png",						// 2 = multiplication
			"/img/captcha/bCap_pic42.png"						// 3 = equals
		];

		this.setState({ pic_a: filePath[type]})
	}

	componentDidMount() {
		this.newChallenge(false);				// init - create first challenge
	}

	newChallenge(focus) {						// insert a new question
		if (focus) {		
			// Focus on new challenge.
			const elem = document.getElementById('challenge');
			if (elem) {
				elem.focus();
			}
		}
		this.inputChallenge.value="";							// clear user input
		this.setState({
			q1_item: this.getNewQ1(),							// get/set new fake data
			message: ""											// clear message box in case there is data
			})
		this.getCaptcha(); 										// build and insert new challenge
	}

	handleInput(event) {						// check keyboard events (carriage return)
		if (event.key === "Enter") { 							// if carriage return: tried target.key, target.charCode, target.keyCode - not working
			event.preventDefault();							// Let's do this ourselves, don't cause a submit of the form.
			this.submitChallenge(); 							// process submitted response
		}
	}
	
	showMessage(name) {						// info / error messages - displays in div.messageBox
		const messages = [
			{
				name: "info",
				data: localizeText("C050","We use captcha to help filter out spam bots. This speeds up our website and our response time in getting back to you.")
			},
			{
				name: "submit",
				data:  localizeText("C051","To activate the Submit button, enter an answer to the question.")
			},
			{
				name: "wrong",
				data: localizeText("C052","Incorrect answer, please try again.")
			},
			{
				name: "correct",
				data: localizeText("C053","Correct answer, you may submit this form by clicking on submit.")
			},
			{
				name: "noVal",
				data: localizeText("C054","Please enter an answer before clicking the Check Answer button.")
			},
			{
				name: "none",
				data: ""
			}
		];
		let message = messages.find(item => item.name == name);

		this.setState({
			message: "",
		}, () => {
			setTimeout(() => {
					this.setState({
						message: <span>{message.data}</span>
					})
					
				}, 500);
		});

		// Try delaying for screen reader
		// setTimeout(() => {
		// 	this.setState({
		// 		message: <span>{message.data}</span>
		// 	})
			
		// }, 1000);
		
	}

	resetCount() {							// not used at this time
		this.setState({
			count: 0
		})
	}

	getNumber(min, max) {					// return random number between min and max, inclusive
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	getCaptcha() {						// get a new captcha challenge and update state
		const type = this.getNumber(0,2);
		let operator = "";
		var answerValue, 
			number_1 =  this.getNumber(0, 10), 
			number_2 = this.getNumber(0, 10);

		this.setFilepath(type);								// sets state with path to pic

		switch (type) { 									// 0 = add, 1= sub, 2=multiply - no division to avoid fractions and rounding issues
			case 0:
				answerValue = number_1 + number_2; // add - solve the puzzle & store result
				operator = "plus";
				break;
			case 1:
				answerValue = number_1 - number_2; // sub
				operator = "minus";
				break;
			case 2:
				answerValue = number_1 * number_2; // multiply
				operator = "times";
				break;
			default:
		};

		this.setState({
			a: answerValue,
			p1: number_1,									// simple 1 digit #s: idea is, if bot can decipher whats happening, ANY math is easy
			p2: number_2, 									//       - humans would find harder math irritating: example, quick what's 42 * 67?
			count: this.state.count + 1, 					// a bot strategy is to repeat the challenge until a random answer works - this counts the passes
			operator: operator,
		})

	}

	submitTest(userAnswer) {						// return pass / fail, answer = challenge response from user
		var response = false, 								// response = pass/fail to return
		tally = 0, 											// tally of pass/fails
		realAnswer = this.state.a,							// correct answer
		parsed = parseInt(userAnswer, 10);					// convert submitted answer to num or NaN

		if (realAnswer != undefined) { 						// undefined is default init value - a challenge has been created
			if (isNaN(parsed)) {							// NaN i.e. a letter (string), honeypot2 triggered - fail
				tally += 1
			};
			if (parsed != realAnswer) {						// answer given is not correct - fail
				tally += 1
			};
			if (this.verfiyEmail.value) { 					// invisible field filled in - fail
				tally += 1;
				response = false
			};
			if (this.state.count >= 4) {					// multiple attempts is probably a bot guessing - human patience probably does not go beyond 3
				tally += 1
			}; 
			if (tally >= 2) {								// bad fail almost def a bot
				response = false
			};
			if (tally == 0) {								// perfect score - human or a really, really smart bot
				response = true
			};
			if (tally == 1) {								// human bad at math, or vision impaired whose reader "saw" a honeypot, or maybe a bot
				if (isNaN(parsed)) {
					response = false;						// honey pot 2 triggered - almost for sure a bot / this condition will not happen since it would create tally=2
				} else {
					if (parsed != realAnswer) {				// wrong answer: error message, try again 
						this.showMessage("wrong");
						response = null;					// response still pending
					}										// else honeypot triggered - already flagged as false - but could be expanded and further tested here
				}
			};

		} else {											// getCaptcha() never called or serious error - possibly submitTest() called before request
 			response = false;								//       - suggests "someone" trying to circumvent captcha test - or developer error
		};
		return response;
	}

	submitChallenge() { 					//process submitted response
		var response = null, alertSub = "";
		const answer = this.inputChallenge.value;
		
		if (answer == "") { 								// user clicked submit button without entering a val
			this.showMessage("noVal");
			this.setState({count: this.state.count + 1})	// could be a bot so add to tally (no answer or 0 is standard bot 1st attempt)
			return; 										// no answer to test - try again
		} else {
			response = this.submitTest(answer); 			// check the challenge
			if (response === null) {							// wrong answer by possible human - try again
				this.showMessage("wrong")
				return;
			} 							
		}

		if (response) {
			this.showMessage("correct"); 							// clear out any old messages on success
		}
		else {
			this.showMessage("none"); 							// clear out any old messages on success
		}

		alertSub = response ?  '' :  this.state.subAlert; // if fail add tag to email subject line

		this.props.updateForm(alertSub);					// pass the result back to parent		

	}


	render() {

		const hpStyle = {
			display: 'none'
		}

		return (
				<div id="captcha" className="bc--bg_gray500 bc--raunded p-3 capcha-wrap captcha-wrap clearfix">
					<div className="emailverify"> 
						<label id="captcha-verifyemail" className="verifyemail" style={hpStyle}> 
							<span>{localizeText("C055","Verify email address")}</span> 
							<span>*</span>
							
						</label>
						<input className="bc-input w-100" id="verifyemail" 
								type="text" 
								style={hpStyle}
								name="verifyemail" 
								ref={el=> this.verfiyEmail = el}
								aria-labelledby="captcha-verifyemail"
								/>
					</div>
					<div>
						<div className="challenge bc--fw_bold">
						{localizeText("C040","To activate the Submit button,")}
							<br />
							{localizeText("C041","please solve this:")}
						</div>
						<div aria-hidden="true" style={hpStyle}>
							<div className="q1">
								{localizeText("C041","Which image contains a ")}
								<span> {this.state.q1_item} </span>
								{localizeText("C041","(a or b) ?")}
							</div>
						</div>
						<div id="challengePics" className="bc--bg_white challengepics">
							<div className="p1 captcha-text">{this.state.p1}</div>
							<div className="pic1 captcha-text">
								<ImageBase id="pic_a" src={this.state.pic_a} alt="Minus"/>
							</div>
							<div className="p2 captcha-text">{this.state.p2}</div>
							<div className="pic2 captcha-text">
								<ImageBase id="pic_b" src={this.state.pic_b} alt="Equals"/>
							</div>
							<input id="challenge" className="bc-input"
									type="text" 
									name="challenge" 
									aria-required="true" 
									onKeyPress={this.handleInput} 
									ref={el=> this.inputChallenge = el}
									aria-label={`Challenge, what is ${this.state.p1} ${this.state.operator} ${this.state.p2}`}									
									/>						
						</div>
						<div className="button-group-wrap">
							<button id="submitAnswer" type="button" title={localizeText("C056","Check Answer")} onClick={() => this.submitChallenge()} className="" >
								<div className="bi brcmicon-check-circle"></div>
								<span className="sr-only">{localizeText("C056","Check Answer")}</span>
							</button>
							<button id="newChallenge" type="button" title={localizeText("C057","New Answer")} onClick={() => this.newChallenge(true)} className="">
								<div className="bi brcmicon-redo"></div>
								<span className="sr-only">{localizeText("C057","New Answer")}</span>
							</button>
							<button id="info" type="button" onClick={() => this.showMessage("info")} title={localizeText("C050","We use captcha to help filter out spam bots. This speeds up our website and our response time in getting back to you.")} className="">
								<div className="bi brcmicon-info-circle"></div>
								<span className="sr-only">{localizeText("C058","Help Info")}</span>
							</button>
						</div>
						<div id="messageBox" aria-live="assertive" aria-atomic="false">
							{this.state.message}
						</div>
					</div>
				</div>
				
		);
	}


}