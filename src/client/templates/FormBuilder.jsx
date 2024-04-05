/**
 *  @file FormBuilder.jsx
 *  @brief
 */
import config from 'client/config.js';
import React, { Component, PureComponent, Fragment } from 'react';
import { router } from 'routes/router.jsx';
import PropTypes from "prop-types";
import SiteLink from 'components/SiteLink.jsx';
import utils from 'components/utils.jsx';
import Captcha from 'components/Captcha.jsx';
import { withLiveEvents } from 'components/liveEvents.js';
import classnames from "classnames";
import ImageBase from 'components/ImageBase.jsx';

import 'scss/pages/contact-form.scss';


class FormBuilder extends PureComponent {
	constructor(props) {
		super(props);

		this.posted = false;		// Doesn't need to be stateful since we only post once. This is to stop from mulitple submissions.

		this.state = {
			thankyou: false,
			thankyou_error: null,
			showCaptcha: false,  // Default to not showing the captcha.
			submitButton: true,
			captcha_alert: '',			// The hidden field.
			country: (this.props.country) ? this.props.country : "",
			family: "",
			state: "",
			submitted: false,					// Are we a valid form.
			errors: [],
		};


		this.formRef = React.createRef();

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleCaptcha = this.handleCaptcha.bind(this);
		this.persistForm = this.persistForm.bind(this);

		this.handleChangeCountry = this.handleChangeCountry.bind(this);
		this.handleChangeFamily = this.handleChangeFamily.bind(this);
		this.handleChangeState = this.handleChangeState.bind(this);
		this.handleChangeText = this.handleChangeText.bind(this);
		this.handleChangeRadio = this.handleChangeRadio.bind(this);
		this.handleChangeCheckbox = this.handleChangeCheckbox.bind(this);
		this.isValid = this.isValid.bind(this);

		// Init our form.
		if (this.props.content_block.form_fields) {
			this.props.content_block.form_fields.forEach((field, index) => {
				if (field.field_type === "Check Boxes" || field.field_type === "Radio Buttons" || field.field_type === "Logos") {
					this.state[field.field_name] = [];
				}
			});
		}

	}

	componentWillReceiveProps(props) {
		this.setState({
			country: props.country,
			family: props.family
		})
	}

	componentDidMount() {
		this.setState({
			showCaptcha: (this.props.content_block.display_captcha == "Yes") ? true : false,
			submitButton: (this.props.content_block.display_captcha == "Yes") ? false : true,		// If we show the captcha, hide the submit.
		});
	}

	componentDidUpdate(prevProps) {
		if (prevProps.content_block.display_captcha !== this.props.content_block.display_captcha) {

			// Should we show or hide the captcha based on new data.
			this.setState({
				showCaptcha: (this.props.content_block.display_captcha == "Yes") ? true : false,
				submitButton: (this.props.content_block.display_captcha == "Yes") ? false : true,		// If we show the captcha, hide the submit.
			});
		}

	}


	handleSubmit(event) {
		event.preventDefault();		// Let's do this ourselves and dont submit.
		const form = this.formRef.current;
		let errors = [];

		if (!form) {
			return;
		}

		if (this.posted) {
			return;			// We posted alread, stop.
		}

		let contact = {};
		let valid = true;
		let i=0;
		for (i = 0; i < form.elements.length; i++) {
			const e = form.elements[i];


			let value = e.value ? e.value.trim() : '';


			if (e.type === "radio" || e.type === "checkbox") {
				if (e.checked) {
					let group = e.getAttribute("group");
					if (group) {
						let values = contact[e.name] || [];
						values[group] = value;

						contact[e.name] = values;
					}
					else {
						contact[e.name] = value;
					}
				}
			}
			else {
				contact[e.name] = value;
			}
		}


		this.persistForm();
		this.setState({
			submitted: true,
		});

		valid = valid && form.checkValidity();

		for (i = 0; i < form.elements.length; i++) {
			const e = form.elements[i];

			// Error checking for accessibility.
			if (e.required && !contact[e.name]) {
				let label = e.getAttribute('aria-label') || '';
				label = label.replace('[', '').replace(']', '');
				if (e.type === "radio" || e.type === "checkbox") {
					errors.push(`<a className="lnk" href="#${e.id}">${label}</a> is required.`);
				}
				else {
					errors.push(`<a className="lnk" href="#${e.id}">${label}</a> is required and cannot be left blank.`);
				}
			}
			else if (e.validity && !e.validity.valid) {
				let label = e.getAttribute('aria-label') || '';
				label = label.replace('[', '').replace(']', '');
				errors.push(`<a className="lnk" href="#${e.id}">${label}</a> is invalid.`);
			}
		}

		this.setState({
			errors: errors,
		});


		if (!valid) {
			return;				// Not valid so don't submit.
		}


		this.posted = true;

		// Flatten out the data as just strings.
		let keys = Object.keys(contact);
		for (let i = 0; i < keys.length; i++) {
			if (Array.isArray(contact[keys[i]])) {
				contact[keys[i]] = contact[keys[i]].flat().join();
			}
		}


		const options = {
			method: 'POST',
			credentials: config.api_credentials,			// Coookies for cors
			//mode: "cors",
			//'Access-Control-Allow-Origin': '*',
			//headers: { "Content-Type": "application/json" },
			body: JSON.stringify(Object.assign({
				id: this.props.content_block.content_id,
				type: "product",
				locale: config.locale,
				template: this.props.content_block ? this.props.content_block.template : null,			// BCCS8-20: JD - The template for LogoRequest is passed to the BE.
			},
				contact))
		};




		fetch(`${config.api_url}form/submit`, options)
			.then(resp => resp.json())
			.then(json => {

				if (json && json.error) {
					this.setState({
						thankyou: true,
						thankyou_error: json.error,
					});
				}
				else if (json && json.thanks_url && json.thanks_url.url) {
					router.navigate({
						pathname: json.thanks_url.url,
					});
				}
				else {
					// HACK: Just assuming we are good.
					this.setState({
						thankyou: true,
						thankyou_error: json.error,
					});
				}

				// Tells our parent "InternalLink" to hide the subtitle and description.
				if (this.props.ondone) {
					this.props.ondone();
				}
			})
			.catch(error => {
				setTimeout(() => { throw error; }); 	// Throw it globally.
			});
	}

	handleChangeCountry(event) { this.setState({ country: event.target.value }) }
	handleChangeFamily(event) { this.setState({ family: event.target.value }) }
	handleChangeState(event) { this.setState({ state: event.target.value }) }
	handleChangeText(event) {
		let text = event.target.value || '';
		text = text.trim();

		if (!text) {
			event.target.setCustomValidity("The field cannot be left blank.");

		}
		else {
			event.target.setCustomValidity("");

		}


		// DEPRECATED
		//this.setState({ [event.target.name] : event.target.value});
		//event.target.focus();
	}

	// Handle radio for group of radio
	handleChangeRadio(event) {
		const element = event.target;
		let group = element.getAttribute("group");

		if (group) {
			let values = this.state[element.name] || [];
			values[group] = element.checked;

			this.setState({ [element.name]: values });
		}

	}
	handleChangeCheckbox(event) {
		const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
		const name = event.target.name;

		this.setState({ [name]: value })
	}

	persistForm() {
		const form = this.formRef.current;

		if (!form) {
			return;
		}

		for (let i = 0; i < form.elements.length; i++) {
			const e = form.elements[i];


			if (e.type == "radio") {
				// List of radios.
				let group = e.getAttribute("group");
				if (group) {
					let values = this.state[e.name] || [];
					values[group] = e.checked;

					this.setState({
						[e.name]: values,
					});
				}
				else {
					this.setState({
						[e.name]: e.checked
					});
				}
			}
			else if (e.type === "checkbox") {
				if (e.checked) {
					// List of checkboxes.
					let group = e.getAttribute("group");
					if (group) {
						let values = this.state[e.name] || [];
						values[group] = e.value;

						this.setState({
							[e.name]: values,
						});
					}
					else {
						this.setState({
							[e.name]: e.value
						});
					}
				}
			}
			else {
				this.setState({
					[e.name]: e.value
				})
			}
		}
	}

	handleCaptcha(alert) {
		this.persistForm();

		this.setState({
			submitButton: true,
			captcha_alert: alert,
		})

	}



	/**
	 *  @brief Return true if valid.
	 *
	 *  @param [in] name The name of the input.
	 *  @return Return_Description
	 *
	 *  @details Details
	 */
	isValid(name) {
		return false;

		if (name && this.state[name] && this.state[name].trim()) {
			return true;
		}

		return false;
	}

	render() {
		if (!this.props.content_block.form_fields) {
			return <Fragment></Fragment>
		}


		// Our thankyou page.
		if (this.state.thankyou && this.props.content_block.thank_you_url && this.props.content_block.thank_you_url.length > 0) {
			return (
				<div className="row" aria-live="polite">
					<div className="thankyou-support  col-lg-9 col-md-12">
						<h1 className="bc--ff_secondary mt-3 mb-2">{this.props.content_block.thank_you_url[0].title}</h1>
						{this.state.thankyou_error
							? <div className="thankyou-body" dangerouslySetInnerHTML={{ __html: this.state.thankyou_error }}></div>
							: <div className="thankyou-body" dangerouslySetInnerHTML={{ __html: this.props.content_block.thank_you_url[0].body }}></div>
						}
					</div>
				</div>
			);
		}

		const FormElement = (props) => {
			switch (props.type) {
				case "State":
					return <div className="col-lg-4 col-md-4 col-sm-8 col-xs-12">
						<div className="contact-select-wrap">
							<select className="form-control form-control-sm"
								id={props.name}
								name={props.name}
								required={props.required}
								defaultValue={this.state[props.name]}
								aria-label={props.label || "Select State"}
							>
								<option key={Math.random()} value=""  >Select State</option>
								{props.values.sort().map((value, index) => <option key={value + index} value={value}>{value}</option>)}
							</select>
							<div className="invalid-feedback">
								The field cannot be left blank.
							</div>
						</div>
						{props.description &&
							<div className="form-control-description" dangerouslySetInnerHTML={{ __html: props.description }} />
						}

					</div>
				case "Country":
					return <div className="col-lg-4 col-md-4 col-sm-8 col-xs-12">
						<div className="contact-select-wrap">
							<select className="form-control form-control-sm"
								id={props.name}
								name={props.name}
								required={props.required}
								defaultValue={(this.state[props.name]) ? this.state[props.name] : this.state.country}
								aria-label={props.label || "Select Location"}
							>
								<option value=""  >Select Location</option>
								{props.values && props.values.sort().map((value, index) => <option key={value + index} value={value}>{value}</option>)}
							</select>
							<div className="invalid-feedback">
								The field cannot be left blank.
							</div>
						</div>
						{props.description &&
							<div className="form-control-description" dangerouslySetInnerHTML={{ __html: props.description }} />
						}

					</div>
				case "Logos":
				case "Radio Buttons":
					return <fieldset className="form-group">
						{props.values && props.values.length && props.values.map((value, index) => {
							const id = utils.uuidv4();
							let v = value;

							// Are we an object or string? BCCS8-2: Logo request and images as radio button.
							if (typeof (value) === 'object') {
								v = value.title;		// Use the title of our image.
							}

							// Make the first one default selected.
							return (
								<div key={v} className="form-check radio-contact-check-form">
									{(index === 0) ?
										<input className="form-check-input"
											type="radio"
											name={props.name}
											id={id}
											required={props.required}
											group={index}
											value={v}
											defaultChecked={typeof this.state[props.name][index] !== 'undefined' ? this.state[props.name][index] : true}
											onChange={this.handleChangeRadio}
										/>
										:
										<input className="form-check-input"
											type="radio"
											name={props.name}
											id={id}
											required={props.required}
											group={index}
											value={v}
											defaultChecked={this.state[props.name][index]}
											onChange={this.handleChangeRadio}
										/>
									}

									<label className="form-check-label" htmlFor={id}>
										{v}
										{typeof (value) === 'object' &&
											<div>
												<ImageBase src={value.src} title={value.title} alt={value.alt} />
											</div>
										}
									</label>
								</div>

							)

						})}
					</fieldset>

				case "Combo Box":
					return <div className="col-lg-4 col-md-4 col-sm-8 col-xs-12">
						{(props.name == "Product Family") ?

							<input className="form-control form-control-sm"
								name={props.name}
								required={props.required}
								defaultValue={this.state.family || this.props.family}
								readOnly={true}
								aria-label={utils.stripHtml(props.name)}
							>
							</input>
							:
							<div className="contact-select-wrap">
								<select className="form-control form-control-sm"
									id={props.name}
									name={props.name}
									required={props.required}
									defaultValue={this.state[props.name]}
									aria-label={utils.stripHtml(props.name)}
								>
									<option key={Math.random()} value=""  >Select Option</option>
									{props.values.sort().map((value, index) => <option key={value + index} value={value}>{value}</option>)}
								</select>
								{props.description &&
									<div className="form-control-description" dangerouslySetInnerHTML={{ __html: props.description }} />
								}
								<div className="invalid-feedback">
									The field cannot be left blank.
								</div>
							</div>
						}
					</div>

				case "Hidden Text Field":
					return <div className="col-lg-4 col-md-4 col-sm-8 col-xs-12">
						<input type="hidden"
							key={props.id}
							name={props.name}
							className="form-control form-control-sm"
							id={props.id}
							placeholder={props.placeholder}
							required={props.required}
							defaultValue={this.state[props.name]}
							defaultValue={props.values}
						/>
					</div>
				case "Text Field":
				default:
					let type = props.type.toLowerCase();
					let is_email = props.name.toLowerCase().includes('email');
					let valid_types = ["button", "checkbox", "color", "date", "datetime-local", "email", "file", "hidden", "image", "month", "number", "password", "radio", "range", "reset", "search", "submit", "tel", "text", "time", "url", "week"];
					let pattern = '.*';//'.*\S+.*';

					if (is_email || type === 'email' || type === 'email group') {
						type = 'email';
						is_email = true;
						pattern = "[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-zA-Z]{2,4}";
					}
					else if (!valid_types.includes(type)) {
						type = 'text';
					}

					return <div className="col-lg-4 col-md-4 col-sm-8 col-xs-12">
						<input type={type}
							key={props.id}
							name={props.name}
							className={classnames("form-control form-control-sm")}
							id={props.id}
							placeholder={props.placeholder}
							required={props.required}
							onChange={this.handleChangeText}
							defaultValue={this.state[props.name]}
							pattern={pattern}
							aria-label={utils.stripHtml(props.label)}
						/>
						{props.description &&
							<div className="form-control-description" dangerouslySetInnerHTML={{ __html: props.description }} />
						}
						<div className="invalid-feedback">
							{type === 'email'
								? "Invalid email."
								: "The field cannot be left blank."
							}
						</div>
					</div>
			};
		}

		return (
			<div className="contact-details">


				<p><span className="text-danger">*</span> denotes required field. </p>
				<form ref={this.formRef}
					className={classnames("needs-validation", { "was-validated": this.state.submitted })}
					noValidate
					method="POST"
					onSubmit={this.handleSubmit}
					autoComplete="off"  // TODO: may be able to turn this back on - it does not play well with react
				>
					{this.props.content_block.form_fields.map((field, index) => {
						const id = field.field_name; //utils.uuidv4();
						const required = field.required === "Yes" || field.required === "yes";
						const field_type = field.field_type || field.subtype || field.form_field_type;	// BUSINESS: BSBP2-15 Section Titles doesn't have field_type so defaulting to subtype. BCCS-312 Now Section titles is in form_field_type.
						switch (field_type) {
							case "Text Area":
								return (
									<div key={id} className="form-group row text-message">
										<div className="col-xl-7 col-md-7 col-sm-12">
											<label htmlFor={id}><span dangerouslySetInnerHTML={{ __html: field.display_name }}></span> {required && <span className="text-danger">*</span>}</label>
											{field.description &&
												<div className="form-control-description" dangerouslySetInnerHTML={{ __html: field.description }} />
											}
											<textarea className="form-control text-message-input"
												id={id}
												name={field.field_name}
												rows="4"
												required={field.required === "Yes"}
												defaultValue={this.state[field.field_name]}
												onChange={() => 1 + 1} // dont need an onchange but react screams about it
												aria-label={utils.stripHtml(field.display_name || field.field_name)}
											></textarea>

											<div className="invalid-feedback">
												The field cannot be left blank.
											</div>

										</div>
									</div>)
							// CA. List of checkboxes.
							case "Check Boxes":
								return (
									<fieldset key={id} className="form-group">
										<div className="mb-1" dangerouslySetInnerHTML={{ __html: field.display_name }} />
										{/*TODO?: Removed because we need logic for at least one in this group. required={required}*/}
										{field.values && field.values.map((value, index) =>
											<div key={id + index} className="form-check">

												<input className="form-check-input"
													type="checkbox"
													group={index}
													name={field.field_name}
													id={id + index}

													checked={this.state[field.field_name][index]}
													value={value}
													onChange={() => 1 + 1} // dont need an onchange but react screams about it
													aria-label={value}
												/>
												<span dangerouslySetInnerHTML={{ __html: value }}></span>
											</div>
										)}
									</fieldset>
								);
							case "Checkbox":
								return (
									<div key={id} className="form-check">

										{/* <label className="form-check-label" htmlFor={id}> {required && <span className="text-danger">*</span>}</label> */}

										<input className="form-check-input"
											type="checkbox"
											name={field.field_name}
											id={id} required={required}
											checked={this.state[field.field_name]}
											onChange={() => 1 + 1} // dont need an onchange but react screams about it
											aria-label={utils.stripHtml(field.display_name)}
										/>
										<span dangerouslySetInnerHTML={{ __html: field.display_name }}></span>
										<span className="text-danger">*</span>
										{field.description &&
											<div className="form-control-description" dangerouslySetInnerHTML={{ __html: field.description }} />
										}
										<div className="invalid-feedback">
											The field cannot be left blank.
										</div>
									</div>)
							case "Section":
								return (
									<Fragment>
										<div key={id} className="form-section">
											{/*hr className="custom-line" />*/}
											{field.title && <h3 dangerouslySetInnerHTML={{ __html: field.title }} />}
											{field.description && <div className="form-section-description" dangerouslySetInnerHTML={{ __html: field.description }} />}
										</div>
										<div className="fillCheat"></div>
									</Fragment>
								);
							default:
								let field_type_class = field_type.toLowerCase().replace(/ /g, '_');		// Convert our field type to lower and space to _
								return (
									<div key={id} className={classnames("form-group row", `form-group-${field_type_class}`)}>
										{field.field_type !== "Hidden Text Field" &&
											<label htmlFor={id} className="col-sm-3 col-form-label"><span dangerouslySetInnerHTML={{ __html: field.display_name }}></span> {required && <span className="text-danger">*</span>}</label>
										}

										<FormElement id={id} type={field.field_type} name={field.field_name} label={utils.stripHtml(field.display_name)} required={required} description={field.description} values={field.values || field.multi_values} /> {/* tabindex={index} */}
									</div>)
						};
					}
					)}
					{this.state.captcha_alert && <input type='hidden' name='response' defaultValue={this.state.captcha_alert} />}

					<div><hr className="custom-line"></hr></div>

					{(this.state.showCaptcha) ? <Captcha updateForm={() => this.handleCaptcha(alert)} /> : ""}

					{(this.state.submitButton) ? <button className="primary-bttn view-from-button form-submit-btn" type={"submit"}>Submit <span className="bi brcmicon-arrow-circle-right"></span></button>
						: <ImageBase className="form-submit-btn" src={config.captcha_image} alt="Submit" />}


					{this.state.errors && this.state.errors.length > 0 &&
						<div className="alert alert-danger mt-4" role="alert" aria-live="polite">
							<h4 className="mb-2">There are {this.state.errors.length} errors in this form</h4>
							<ul>
								{this.state.errors.map((error, index) => (
									<li key={index} dangerouslySetInnerHTML={{ __html: error }} />
								))}
							</ul>
						</div>
					}


				</form>
			</div>
		)
	}
}

FormBuilder.propTypes = {
	content_block: PropTypes.object,
};

export default withLiveEvents(FormBuilder);