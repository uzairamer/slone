import React, { Component } from "react";
import {
  Grid,
  Form,
  Segment,
  Button,
  Header,
  Message,
  Icon
} from "semantic-ui-react";
import md5 from "md5";
import { Link } from "react-router-dom";
import firebase from "./../../firebase";

class Register extends Component {
  state = {
    email: "",
    username: "",
    password: "",
    passwordConfirmation: "",
    errors: [],
    loading: false,
    usersRef: firebase.database().ref("users")
  };

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  isFormEmpty = () => {
    const { username, email, password, passwordConfirmation } = this.state;
    return (
      !username.length ||
      !email.length ||
      !password.length ||
      !passwordConfirmation.length
    );
  };

  isPasswordValid = () => {
    const { password, passwordConfirmation } = this.state;
    if (password.length < 8) {
      return false;
    } else if (password !== passwordConfirmation) {
      return false;
    } else {
      return true;
    }
  };

  isFormValid = () => {
    let errors = [];
    let error;

    if (this.isFormEmpty()) {
      error = { message: "Fill in all the fields" };
      this.setState({ errors: errors.concat(error) });
      return false;
    } else if (!this.isPasswordValid()) {
      error = { message: "Password is invalid" };
      this.setState({ errors: errors.concat(error) });
      return false;
    } else {
      return true;
    }
  };

  displayErrors = errors =>
    errors.map((error, i) => <p key={i}>{error.message}</p>);

  handleSubmit = event => {
    event.preventDefault();
    if (this.isFormValid()) {
      this.setState({ errors: [], loading: true });
      firebase
        .auth()
        .createUserWithEmailAndPassword(this.state.email, this.state.password)
        .then(createdUser => {
          console.log(createdUser);
          createdUser.user
            .updateProfile({
              displayName: this.state.username,
              photoURL: `http://gravatar.com/avatar/${md5(
                createdUser.user.email
              )}?d=identicon`
            })
            .then(() => {
              this.saveUser(createdUser)
                .then(() => {
                  console.log("User Saved");
                })
                .catch(err => console.log(err));
              // this.setState({ loading: false });
            })
            .catch(err => {
              console.log(err);
              this.setState({
                errors: this.state.errors.concat(err),
                loading: false
              });
            });
        })
        .catch(err => {
          this.setState({
            errors: this.state.errors.concat(err),
            loading: false
          });
        });
    }
  };

  saveUser = createdUser => {
    return this.state.usersRef.child(createdUser.user.uid).set({
      name: createdUser.user.displayName,
      avatar: createdUser.user.photoURL
    });
  };

  render() {
    const {
      username,
      password,
      passwordConfirmation,
      email,
      errors,
      loading
    } = this.state;

    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h2" icon color="orange" textAlign="center">
            <Icon name="puzzle piece" color="orange" />
            Register to Slone
          </Header>
          <Form size="large" onSubmit={this.handleSubmit}>
            <Segment stacked>
              <Form.Input
                fluid
                name="username"
                value={username}
                icon="user"
                iconPosition="left"
                type="text"
                placeholder="Username"
                onChange={this.handleChange}
              />

              <Form.Input
                fluid
                name="email"
                icon="mail"
                value={email}
                iconPosition="left"
                type="email"
                placeholder="Email"
                onChange={this.handleChange}
              />

              <Form.Input
                fluid
                name="password"
                icon="lock"
                value={password}
                iconPosition="left"
                type="password"
                placeholder="Password"
                onChange={this.handleChange}
              />

              <Form.Input
                fluid
                name="passwordConfirmation"
                icon="repeat"
                iconPosition="left"
                value={passwordConfirmation}
                type="password"
                placeholder="Password Confirmation"
                onChange={this.handleChange}
              />

              <Button
                className={loading ? "loading" : ""}
                disabled={loading}
                color="orange"
                fluid
                size="large"
              >
                Submit
              </Button>

              <Message>
                Already a user? <Link to="/login">Login</Link>
              </Message>
            </Segment>
          </Form>
          {errors.length > 0 && (
            <Message error>
              <h3>Errors</h3>
              {this.displayErrors(errors)}
            </Message>
          )}
        </Grid.Column>
      </Grid>
    );
  }
}

export default Register;
