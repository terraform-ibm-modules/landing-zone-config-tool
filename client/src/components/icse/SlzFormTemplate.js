import { Component } from "react";
import InstanceFormModal from "./InstanceFormModal.js";
import { disableSave } from "../../lib/index.js";
import SlzTabPanel from "./SlzTabPanel.js";
import { contains, kebabCase } from "lazy-z";
import PropTypes from "prop-types";
import { RenderForm, EmptyResourceTile } from "./wrappers/index.js";

class SlzFormTemplate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      shownArrayForms: [], // list of array forms to keep open on save
      shownChildForms: [] // list of child forms to keep open on save
    };
    this.onChildToggle = this.onChildToggle.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    // add an array for each vpc to track open and closed acls
    if (this.props.name === "VPC access control") {
      this.props.arrayData.forEach(() => this.state.shownChildForms.push([]));
    }
  }

  /**
   * keep update forms open
   * @param {number} index index to keep open
   * @param {number=} childIndex optional child index
   */
  onChildToggle(index, childIndex) {
    if (this.props.parentToggle) {
      // if the parent toggle is passed, run the callback (this function on parent form)
      // with parent index and current index
      this.props.parentToggle.callback(this.props.parentToggle.index, index);
    } else if (arguments.length !== 1) {
      // if a second param is passed
      let shownChildForms = [...this.state.shownChildForms]; // all forms
      // if contains index
      if (contains(this.state.shownChildForms[index], childIndex)) {
        // remove index from list
        shownChildForms[index].splice(index, 1);
      } else {
        // otherwise add
        shownChildForms[index].push(childIndex);
      }
      this.setState({ shownChildForms: shownChildForms });
    } else {
      // if only parent index
      let shownForms = [...this.state.shownArrayForms]; // all forms
      if (contains(this.state.shownArrayForms, index)) {
        // remove if contains
        shownForms.splice(index, 1);
      } else shownForms.push(index);
      this.setState({ shownArrayForms: shownForms });
    }
  }

  /**
   * on modal submit
   * @param {*} data arbitrary data
   */
  onSubmit(data) {
    this.props.onSubmit(data, this.props);
    this.toggleModal();
  }

  /**
   * toggle modal on and off
   */
  toggleModal() {
    this.setState({ showModal: !this.state.showModal });
  }

  render() {
    let formattedName = kebabCase(this.props.name); // formatted component name
    // enable submit field here is set to variable value to allow for passing to
    // child array components without needing to reference `this` directly
    let enableSubmitField = this.props.enableSubmitField;
    return (
      <div id={formattedName}>
        <SlzTabPanel
          name={this.props.name}
          onClick={this.toggleModal}
          addText={this.props.addText}
          hideButton={this.props.hideFormTitleButton}
          subHeading={this.props.subHeading}
          className={
            this.props.subHeading ? "subHeading marginBottomSmall" : ""
          }
          tooltip={this.props.tooltip}
          about={this.props.docs ? this.props.docs() : false}
          form={
            <>
              <EmptyResourceTile
                name={this.props.name}
                showIfEmpty={this.props.arrayData}
              />
              {/* for each props passed into the array */}
              {this.props.arrayData.map((data, index) => {
                // create an object with props
                let mapData = {
                  data: data,
                  slz: this.props.slz,
                  arrayParentName: this.props.arrayParentName,
                  onShowToggle: this.onChildToggle,
                  onChildShowToggle:
                    this.props.name === "VPC access control"
                      ? this.onChildToggle // pass through to child component if nacl
                      : false,
                  index: index,
                  show: this.props.parentToggle
                    ? contains(
                        this.props.parentToggle.shownChildren[
                          this.props.parentToggle.index
                        ],
                        index
                      ) // show children
                    : contains(this.state.shownArrayForms, index),
                  shownChildren: this.state.shownChildForms,
                  addText: this.props.addText
                };
                // set onSave and onDelete methods to child component
                ["onSave", "onDelete"].forEach(dataField => {
                  if (this.props[dataField])
                    mapData[dataField] = this.props[dataField];
                });
                // return a form with the index and props
                return this.props.form(index, mapData);
              })}
              <InstanceFormModal
                name={this.props.addText}
                show={this.state.showModal}
                onRequestSubmit={this.onSubmit}
                onRequestClose={this.toggleModal}
                arrayParentName={this.props.arrayParentName}
              >
                {// render the form inside the modal
                RenderForm(this.props.innerForm, {
                  slz: this.props.slz,
                  enableSubmitField: enableSubmitField,
                  isTeleport: this.props.isTeleport,
                  arrayParentName: this.props.arrayParentName,
                  isModal: true,
                  cluster: this.props.cluster,
                  shouldDisableSubmit: function() {
                    // references to `this` in funtion are intentionally vague
                    // in order to pass the correct funtions and field values to the
                    // child modal component
                    // by passing `this` in a function that it scoped to the component
                    // we allow the function to be successfully bound to the modal form
                    // while still referencing the local value `enableSubmitField`
                    // to use it's own values for state and props including enableModal
                    // and disableModal, which are dynamically added to the component
                    // at time of render
                    if (
                      disableSave(enableSubmitField, this.state, this.props) ===
                      false
                    ) {
                      this.props.enableModal();
                    } else {
                      this.props.disableModal();
                    }
                  }
                })}
              </InstanceFormModal>
            </>
          }
          hideFormTitleButton={this.props.hideFormTitleButton}
        />
      </div>
    );
  }
}

SlzFormTemplate.defaultProps = {
  hideFormTitleButton: false,
  subHeading: false,
  arrayParentName: null,
  isTeleport: false
};

SlzFormTemplate.propTypes = {
  name: PropTypes.string, // can be null for nacl
  arrayData: PropTypes.array.isRequired,
  parentToggle: PropTypes.shape({
    // used to track open and closed acls
    callback: PropTypes.func.isRequired,
    shownChildren: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))
      .isRequired
  }),
  onSubmit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  enableSubmitField: PropTypes.string.isRequired,
  addText: PropTypes.string,
  hideFormTitleButton: PropTypes.bool.isRequired,
  subHeading: PropTypes.bool.isRequired,
  isTeleport: PropTypes.bool.isRequired,
  docs: PropTypes.func, // only used on top level components
  tooltip: PropTypes.object, // used only for cos keys
  slz: PropTypes.shape({}).isRequired,
  arrayParentName: PropTypes.string,
  cluster: PropTypes.object // used for worker pools
};

export default SlzFormTemplate;
