import { DataError } from "@carbon/icons-react";
import { Tile, Button } from "@carbon/react";
import { deepEqual } from "lazy-z";
import React from "react";
import "./resetState.css";

const konamiCode = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
  "Enter",
];

class ResetState extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cheatsEnabled: false,
      keysPressed: [],
    };
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  componentDidMount() {
    if (
      // check for query
      window.location.href.indexOf("?cheats=true") !== -1 &&
      !this.state.cheatsEnabled
    )
      this.setState({ cheatsEnabled: true });
  }

  /**
   * handle keypress
   * @param {Event} e
   */
  handleKeyPress(e) {
    if (this.state.cheatsEnabled) {
      let key = e.key;
      let stateKeys = [...this.state.keysPressed];
      stateKeys.push(key); // add key to list
      // if the state equals the code
      if (deepEqual(stateKeys, konamiCode)) {
        // get json data
        let storeData = JSON.parse(
          window.localStorage.getItem(this.props.storeName),
        );
        // enable cheats
        storeData.cheatsEnabled = true;
        // set store data with new prop
      } else if (konamiCode[stateKeys.length - 1] === key) {
        // if the key is next in the code, set keys pressed to new keys
        this.setState({ keysPressed: stateKeys });
      } else {
        // otherwise reset keys
        this.setState({ keysPressed: [] });
      }
    }
  }

  render() {
    return (
      <div onKeyUp={this.handleKeyPress} tabIndex="0" className="height-100">
        {/* tabIndex allows for keypress events */}
        <Tile>
          <h2 className="marginBottomSmall">Uh oh!</h2>
          <div>
            <p>
              <DataError size="24" className="iconMargin" />
              If you have reached this page, there was an error loading your slz
              configuration from storage. You will need to reset your state to
              continue to use this application.
            </p>
            <Button
              className="marginTop"
              kind="danger"
              onClick={() => {
                window.localStorage.removeItem(this.props.storeName);
                window.location.hash = "#/home";
                window.location.reload();
              }}
            >
              Reset State
            </Button>
          </div>
        </Tile>
      </div>
    );
  }
}

export default ResetState;
