

// this code is currently in Header.jsx using modal directly - leaving this here for final project in case we need to add more logic


import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import SiteLink from 'components/SiteLink.jsx';
import {localizeText} from 'components/utils.jsx'; 

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false
    };

    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState({
      modal: !this.state.modal
    });
  }

  render() {
    return (
      <div>
        <Button color="danger" onClick={this.toggle}>{this.props.buttonLabel}</Button>
        <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
          <ModalHeader toggle={this.toggle}>Modal title</ModalHeader>
          <ModalBody>
            myBroadcom Account:
          </ModalBody>
          <ModalFooter>
            <Button color="primary-bttn" onClick={this.toggle}>{localizeText("C026","LogIn")}</Button>{' '}
            <Button color="secondary-bttn" onClick={this.toggle}>{localizeText("C027","Register")}</Button>
                <SiteLink 
                  to="#"
                >{localizeText("C028","Forgot Username / Password?")}</SiteLink>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}