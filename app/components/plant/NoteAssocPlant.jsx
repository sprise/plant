// When editing/create a Note this component manages the list of associated plants.

const actions = require('../../actions');
const React = require('react');
const FloatingActionButton = require('material-ui/FloatingActionButton').default;
const InputCombo = require('../InputCombo');
const RaisedButton = require('material-ui/RaisedButton').default;
const ArrowLeft = require('material-ui/svg-icons/hardware/keyboard-arrow-left').default;
const ArrowRight = require('material-ui/svg-icons/hardware/keyboard-arrow-right').default;
const Errors = require('../Errors');
const utils = require('../../libs/utils');

class NoteAssocPlant extends React.Component {
  constructor() {
    super();
    this.state = {
      expanded: false,
      filter: ''
    };
    this.expand = this.expand.bind(this);
  }

  toggle(plantId) {
    const plantIds = this.props.plantIds.indexOf(plantId) >= 0
      ? this.props.plantIds.filter(pId => pId !== plantId)
      : this.props.plantIds.concat(plantId);

    this.props.dispatch(actions.editNoteChange({plantIds}));
  }

  expand() {
    const expanded = !this.state.expanded;
    this.setState({expanded});
  }

  renderPlantButton(plant, primary) {
    const _id = plant.get('_id');
    const title = plant.get('title');
    const secondary = !primary && !!plant.get('isTerminated');
    return <RaisedButton
      key={_id}
      label={title}
      style={{margin: 12}}
      onClick={this.toggle.bind(this, _id)}
      primary={primary}
      secondary={secondary}
    />;
  }

  renderPlantButtons(plantIds, plants, selected) {
    return plantIds.map(plantId => {
      const plant = plants.get(plantId);
      if(!plant) {
        console.warn(`Missing plant for plantId ${plantId}`);
        return null;
      }
      return this.renderPlantButton(plant, selected);
    });
  }

  render() {
    const {expanded, filter} = this.state;
    const {plantIds, plants} = this.props;

    const checkedPlantIds = utils.filterSortPlants(plantIds, plants, filter);
    const checkedPlants = this.renderPlantButtons(checkedPlantIds, plants, true);

    const uncheckedIds = plants.filter((plant, _id) => plantIds.indexOf(_id) === -1).keySeq().toArray();
    const uncheckedPlantIds = utils.filterSortPlants(uncheckedIds, plants, filter);

    const uncheckedPlants = expanded
      ? this.renderPlantButtons(uncheckedPlantIds, plants, false)
      : null;

    const arrow = <FloatingActionButton
      mini={true}
      onClick={this.expand}
      secondary={true}
      title='Expand/Collapse Unchecked Plants'
    >
      {expanded
        ? <ArrowLeft />
        : <ArrowRight />
      }
    </FloatingActionButton>;

    const filterInput = (<InputCombo
      changeHandler={(e) => this.setState({filter: e.target.value.toLowerCase()})}
      label='Filter'
      placeholder={'Filter...'}
      value={filter}
      name='filter'
    />);

    const errors = this.props.error ? [this.props.error] : [];

    return (
      <div style={{textAlign: 'left'}}>
        <Errors errors={errors} />
        <div>
          {'Associated plants:'}
          {filterInput}
          {checkedPlants}
          {uncheckedPlants}
          {arrow}
        </div>
      </div>
    );
  }
}

NoteAssocPlant.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  error: React.PropTypes.string,
  plantIds: React.PropTypes.array.isRequired,
  plants: React.PropTypes.object.isRequired, // Immutable.js Map
};

module.exports = NoteAssocPlant;
